import React from 'react';
import { Input, DatePicker, Button, Checkbox, message, Popconfirm, Row, Col, notification } from 'antd';
import { PlusOutlined, DeleteOutlined, SortAscendingOutlined, ClearOutlined } from '@ant-design/icons';
import moment from 'moment';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import './styles/CustomTodo.css';
import { auth, db } from '../firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';

type CustomTask = {
  text: string;
  start: string;
  deadline: string;
  completed: boolean;
  alerted?: boolean; // Tracks if deadline notifications have been sent
};

type CustomTodoProps = {
  customTask: string;
  setCustomTask: (val: string) => void;
  customDate: moment.Moment | null;
  setCustomDate: (date: moment.Moment | null) => void;
  customTasks: CustomTask[];
  setCustomTasks: (tasks: CustomTask[]) => void;
};

const CustomTodo: React.FC<CustomTodoProps> = ({
  customTask,
  setCustomTask,
  customTasks,
  setCustomTasks,
}) => {
  const [startDateTime, setStartDateTime] = React.useState<moment.Moment | null>(null);
  const [deadlineDateTime, setDeadlineDateTime] = React.useState<moment.Moment | null>(null);

  const handleAddCustomTask = async () => {
    if (!customTask || !startDateTime || !deadlineDateTime) {
      message.warning('Please enter task, start time, and deadline.');
      return;
    }

    const newTask: CustomTask = {
      text: customTask,
      start: startDateTime.toISOString(),
      deadline: deadlineDateTime.toISOString(),
      completed: false,
      alerted: false, // Initialize alerted as false
    };

    const updatedTasks = [...customTasks, newTask];
    setCustomTasks(updatedTasks);
    setCustomTask('');
    setStartDateTime(null);
    setDeadlineDateTime(null);

    const user = auth.currentUser;
    if (user) {
      const docRef = doc(db, 'users', user.uid);
      await setDoc(docRef, { customTasks: updatedTasks }, { merge: true });
    }
  };

  const handleCustomTaskToggle = async (index: number) => {
    const updatedTasks = customTasks.map((task, idx) =>
      idx === index ? { ...task, completed: !task.completed } : task
    );
    setCustomTasks(updatedTasks);

    // Trigger notification if task is marked as completed
    if (updatedTasks[index].completed) {
      notification.success({
        message: 'Task Completed',
        description: `Great job! Task "${updatedTasks[index].text}" has been marked as completed.`,
      });
    }

    const user = auth.currentUser;
    if (user) {
      await setDoc(doc(db, 'users', user.uid), { customTasks: updatedTasks }, { merge: true });
    }
  };

  const handleDeleteTask = async (index: number) => {
    const updatedTasks = customTasks.filter((_, idx) => idx !== index);
    setCustomTasks(updatedTasks);

    const user = auth.currentUser;
    if (user) {
      await setDoc(doc(db, 'users', user.uid), { customTasks: updatedTasks }, { merge: true });
    }
  };

  const handleClearCompleted = async () => {
    const remainingTasks = customTasks.filter((task) => !task.completed);
    setCustomTasks(remainingTasks);

    const user = auth.currentUser;
    if (user) {
      await setDoc(doc(db, 'users', user.uid), { customTasks: remainingTasks }, { merge: true });
    }
  };

  const handleSortByDeadline = () => {
    const sorted = [...customTasks].sort((a, b) => moment(a.deadline).valueOf() - moment(b.deadline).valueOf());
    setCustomTasks(sorted);
  };

  return (
    <section style={{ background: '#f9fafb', padding: 'clamp(16px, 4vw, 32px)', borderRadius: '12px' }}>
      <h2
        style={{
          textAlign: 'center',
          color: '#2563eb',
          fontWeight: 700,
          fontSize: 'clamp(20px, 5vw, 28px)',
          marginBottom: 'clamp(16px, 3vw, 24px)',
        }}
      >
        Custom Task Manager
      </h2>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={24} md={12}>
          <Input
            placeholder="Task description"
            value={customTask}
            onChange={(e) => setCustomTask(e.target.value)}
            style={{ width: '100%', padding: 'clamp(8px, 2vw, 12px)', fontSize: 'clamp(14px, 3vw, 16px)' }}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <DatePicker
            showTime
            placeholder="Start Date & Time"
            value={startDateTime}
            onChange={setStartDateTime}
            style={{ width: '100%', fontSize: 'clamp(14px, 3vw, 16px)' }}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <DatePicker
            showTime
            placeholder="Deadline Date & Time"
            value={deadlineDateTime}
            onChange={setDeadlineDateTime}
            style={{ width: '100%', fontSize: 'clamp(14px, 3vw, 16px)' }}
          />
        </Col>
        <Col xs={24}>
          <Button
            icon={<PlusOutlined />}
            type="primary"
            block
            onClick={handleAddCustomTask}
            style={{ padding: 'clamp(8px, 2vw, 12px)', fontSize: 'clamp(14px, 3vw, 16px)' }}
          >
            Add Task
          </Button>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 'clamp(12px, 2vw, 16px)' }}>
        <Col xs={24} sm={12}>
          <Button
            icon={<SortAscendingOutlined />}
            onClick={handleSortByDeadline}
            block
            style={{
              fontSize: 'clamp(14px, 3vw, 16px)',
              padding: 'clamp(8px, 2vw, 12px)',
              height: 'auto',
              lineHeight: 'normal',
            }}
          >
            Sort by Deadline
          </Button>
        </Col>
        <Col xs={24} sm={12}>
          <Button
            danger
            icon={<ClearOutlined />}
            onClick={handleClearCompleted}
            block
            style={{
              fontSize: 'clamp(14px, 3vw, 16px)',
              padding: 'clamp(8px, 2vw, 12px)',
              height: 'auto',
              lineHeight: 'normal',
            }}
          >
            Clear Completed
          </Button>
        </Col>
      </Row>

      <TransitionGroup>
        {customTasks.map((task, index) => (
          <CSSTransition key={index} timeout={300} classNames="fade">
            <div
              style={{
                backgroundColor: task.completed ? '#e0f7fa' : '#ffffff',
                padding: 'clamp(8px, 2vw, 12px) clamp(12px, 3vw, 16px)',
                marginTop: 'clamp(8px, 2vw, 10px)',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: '1px solid #ccc',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ flex: 1, minWidth: '200px' }}>
                <Checkbox checked={task.completed} onChange={() => handleCustomTaskToggle(index)}>
                  <strong style={{ fontSize: 'clamp(14px, 3vw, 16px)' }}>{task.text}</strong>
                  <br />
                  <small style={{ fontSize: 'clamp(12px, 2.5vw, 14px)' }}>
                    Start: {moment(task.start).format('MMM D, YYYY h:mm A')}
                  </small>
                  <br />
                  <small style={{ fontSize: 'clamp(12px, 2.5vw, 14px)' }}>
                    Deadline: {moment(task.deadline).format('MMM D, YYYY h:mm A')}
                  </small>
                </Checkbox>
              </div>
              <Popconfirm
                title="Delete this task?"
                onConfirm={() => handleDeleteTask(index)}
                okText="Yes"
                cancelText="No"
              >
                <Button danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </div>
          </CSSTransition>
        ))}
      </TransitionGroup>
    </section>
  );
};

export default CustomTodo;
