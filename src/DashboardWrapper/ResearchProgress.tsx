import React, { useState } from 'react';
import { Checkbox, Progress, Button, Input, Radio, Row, Col } from 'antd';
import { PlusOutlined, DeleteOutlined} from '@ant-design/icons';

type Task = {
  id: number;
  text: string;
  completed: boolean;
};

type ResearchProgressProps = {
  tasks: Task[];
  handleTaskToggle: (id: number) => void;
  handleAddTask?: (text: string) => void;
  handleDeleteTask?: (id: number) => void; // New prop for deleting tasks
};

const ResearchProgress: React.FC<ResearchProgressProps> = ({
  tasks,
  handleTaskToggle,
  handleAddTask,
  handleDeleteTask,
}) => {
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [newTaskText, setNewTaskText] = useState('');

  const filteredTasks = tasks.filter((task) =>
    filter === 'completed' ? task.completed : filter === 'pending' ? !task.completed : true
  );

  const completedCount = tasks.filter((task) => task.completed).length;
  const totalTasks = tasks.length;
  const percentComplete = totalTasks ? Math.round((completedCount / totalTasks) * 100) : 0;

  const addTask = () => {
    if (newTaskText.trim() && handleAddTask) {
      handleAddTask(newTaskText.trim());
      setNewTaskText('');
    }
  };

  return (
    <section
      style={{
        marginBottom: 'clamp(24px, 5vw, 48px)',
        background: '#f0f4ff',
        padding: 'clamp(12px, 3vw, 24px)',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease',
      }}
    >
      <h2
        style={{
          textAlign: 'center',
          color: '#1d4ed8',
          fontWeight: 800,
          fontSize: 'clamp(18px, 4vw, 26px)',
          marginBottom: 'clamp(12px, 3vw, 20px)',
        }}
      >
        Research Paper Progress
      </h2>

      <Progress
        percent={percentComplete}
        status="active"
        strokeColor="#4f46e5"
        style={{ marginBottom: 'clamp(16px, 3vw, 24px)' }}
      />

      <Row gutter={[8, 8]} style={{ marginBottom: 'clamp(12px, 2vw, 16px)' }}>
        <Col xs={24}>
          <Radio.Group
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <Radio.Button value="all" style={{ flex: '1 1 100px', textAlign: 'center' }}>
              All
            </Radio.Button>
            <Radio.Button value="completed" style={{ flex: '1 1 100px', textAlign: 'center' }}>
              Completed
            </Radio.Button>
            <Radio.Button value="pending" style={{ flex: '1 1 100px', textAlign: 'center' }}>
              Pending
            </Radio.Button>
          </Radio.Group>
        </Col>
      </Row>

      {filteredTasks.map((task) => (
        <Row key={task.id} gutter={[8, 8]}>
          <Col xs={24}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#fff',
                padding: 'clamp(8px, 2vw, 12px) clamp(12px, 3vw, 16px)',
                borderRadius: '8px',
                boxShadow: task.completed ? 'none' : '0 2px 8px rgba(0,0,0,0.05)',
                transition: 'all 0.2s ease-in-out',
                flexWrap: 'wrap',
                overflow: 'hidden',
              }}
            >
              <Checkbox
                checked={task.completed}
                onChange={() => handleTaskToggle(task.id)}
                style={{
                  transform: 'scale(1.2)',
                  marginRight: 'clamp(8px, 2vw, 16px)',
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: 'clamp(14px, 3vw, 16px)',
                  fontWeight: 600,
                  color: task.completed ? '#9ca3af' : '#111827',
                  textDecoration: task.completed ? 'line-through' : 'none',
                  flexGrow: 1,
                  wordBreak: 'break-word',
                }}
              >
                {task.text}
              </span>
              {handleDeleteTask && (
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  onClick={() => handleDeleteTask(task.id)}
                  style={{
                    color: '#ff4d4f',
                    marginLeft: '8px',
                    flexShrink: 0,
                  }}
                />
              )}
            </div>
            
          </Col>
        </Row>
      ))}


      {handleAddTask && (
        <Row gutter={[8, 8]} style={{ marginTop: 'clamp(16px, 3vw, 24px)' }}>
          <Col xs={24} sm={18}>
            <Input
              placeholder="Add new task..."
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onPressEnter={addTask}
              style={{ width: '100%', fontSize: 'clamp(14px, 3vw, 16px)' }}
            />
          </Col>
          <Col xs={24} sm={6}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={addTask}
              style={{ width: '100%', fontSize: 'clamp(14px, 3vw, 16px)' }}
            >
              Add
            </Button>
          </Col>
        </Row>
      )}

      <div
        style={{
          marginTop: 'clamp(16px, 3vw, 24px)',
          textAlign: 'center',
          color: '#6b7280',
          fontSize: 'clamp(12px, 2.5vw, 14px)',
        }}
      >
        <small>
          {completedCount} of {totalTasks} tasks completed
        </small>
      </div>
    </section>
  );
};

export default ResearchProgress;
