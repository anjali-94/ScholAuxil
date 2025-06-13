import React, { useState, useEffect } from 'react';
import { Layout, Card, Row, Col, notification } from 'antd';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import { Steps } from 'antd';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useNavigate } from 'react-router-dom';
import Chatbot from './Chatbot';
import NavigationSider from './DashboardWrapper/NavigationSider';
import Header from './DashboardWrapper/Header';
import BibifyClone from './DashboardWrapper/Citation';
import ResearchProgress from './DashboardWrapper/ResearchProgress';
import CustomTodo from './DashboardWrapper/CustomTodo';
import Repository from './DashboardWrapper/Repository';
import PlagiarismChecker from './PlagiarismChecker';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { motion } from 'framer-motion';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const { Content, Footer } = Layout;

const localizer = momentLocalizer(moment);

type Task = {
  id: number;
  text: string;
  completed: boolean;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  progress?: number;
};

type CustomTask = {
  text: string;
  start: string;
  deadline: string;
  completed: boolean;
  alerted?: boolean;
};

const motivationalQuotes: string[] = [
  "Research is what I'm doing when I don't know what I'm doing. — Wernher von Braun",
  "Somewhere, something incredible is waiting to be known. — Carl Sagan",
  "The important thing is not to stop questioning. — Albert Einstein",
  "Big journeys begin with small steps. — Unknown",
  "Your limitation—it's only your imagination. — Unknown",
];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [showBot, setShowBot] = useState(false);
  const [showPlagiarismChecker, setShowPlagiarismChecker] = useState(false);
  const [showRepository, setShowRepository] = useState(false);
  const [showBibCitation, setShowBibCitation] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, text: 'Select Research Topic', completed: false },
    { id: 2, text: 'Complete Literature Review', completed: false },
    { id: 3, text: 'Define Methodology', completed: false },
    { id: 4, text: 'Conduct Experiments', completed: false },
    { id: 5, text: 'Analyze Results', completed: false },
    { id: 6, text: 'Write Paper Draft', completed: false },
    { id: 7, text: 'Finalize and Submit Paper', completed: false },
  ]);

  const [customTask, setCustomTask] = useState('');
  const [customDate, setCustomDate] = useState<moment.Moment | null>(null);
  const [customTasks, setCustomTasks] = useState<CustomTask[]>([]);
  const [quote, setQuote] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.tasks) {
            setTasks(data.tasks);
          }
          if (data.customTasks) {
            setCustomTasks(data.customTasks);
            localStorage.setItem('customTasks', JSON.stringify(data.customTasks));
          }
        }
      }
    });

    // Pick a random quote on mount
    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    setQuote(randomQuote);

    return () => unsubscribe();
  }, []);

  // New useEffect for deadline notifications
  useEffect(() => {
    const checkDeadlines = async () => {
      let tasksUpdated = false;
      const updatedTasks = customTasks.map((task) => {
        if (task.completed || task.alerted) return task; // Skip completed or already alerted tasks

        const deadline = moment(task.deadline);
        const now = moment();

        if (deadline.isBefore(now)) {
          // Deadline has passed
          notification.error({
            message: 'Deadline Missed',
            description: `Task "${task.text}" deadline has passed on ${deadline.format('MMM D, YYYY h:mm A')}!`,
          });
          return { ...task, alerted: true };
        } else if (deadline.diff(now, 'hours') <= 24) {
          // Deadline is within 1 day
          notification.warning({
            message: 'Deadline Approaching',
            description: `Task "${task.text}" is due soon on ${deadline.format('MMM D, YYYY h:mm A')}!`,
          });
          return { ...task, alerted: true };
        }
        return task;
      });

      // Update tasks if any were marked as alerted
      if (JSON.stringify(updatedTasks) !== JSON.stringify(customTasks)) {
        tasksUpdated = true;
        setCustomTasks(updatedTasks);
      }

      // Persist updated tasks to Firestore
      const user = auth.currentUser;
      if (user && tasksUpdated) {
        await setDoc(doc(db, 'users', user.uid), { customTasks: updatedTasks }, { merge: true });
        localStorage.setItem('customTasks', JSON.stringify(updatedTasks));
      }
    };

    // Run immediately and then every 5 minutes
    checkDeadlines();
    const interval = setInterval(checkDeadlines, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [customTasks]);

  const handleLogout = () => navigate('/LandingPage');

  const handleTaskToggle = async (id: number) => {
    const updatedTasks = tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed, progress: task.completed ? 0 : 100 } : task
    );
    setTasks(updatedTasks);

    const user = auth.currentUser;
    if (user) {
      await setDoc(doc(db, 'users', user.uid), { tasks: updatedTasks }, { merge: true });
      if (updatedTasks.find(task => task.id === id)?.completed) {
        notification.success({
          message: 'Task Completed',
          description: `Great job completing "${tasks.find(task => task.id === id)?.text}"!`,
        });
      }
    }
  };

  const handleDeleteTask = async (id: number) => {
    const updatedTasks = tasks.filter(task => task.id !== id);
    setTasks(updatedTasks);

    const user = auth.currentUser;
    if (user) {
      await setDoc(doc(db, 'users', user.uid), { tasks: updatedTasks }, { merge: true });
      notification.success({
        message: 'Task Deleted',
        description: `Task "${tasks.find(task => task.id === id)?.text}" has been deleted.`,
      });
    }
  };

  const getDashboardHeading = () => {
    if (showRepository) return 'Research Vault';
    if (showPlagiarismChecker) return 'Plagiarism Checker';
    if (showBibCitation) return 'Citation Generator';
    return 'Research Dashboard';
  };

  const isResearchDashboard = getDashboardHeading() === 'Research Dashboard';

  const handleAddTask = async (text: string, category: string = 'General', priority: 'low' | 'medium' | 'high' = 'medium') => {
    const newTask = { id: Date.now(), text, completed: false, category, priority, progress: 0 };
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);

    const user = auth.currentUser;
    if (user) {
      await setDoc(doc(db, 'users', user.uid), { tasks: updatedTasks }, { merge: true });
    }
  };

  const events = customTasks.map(task => ({
    title: task.text,
    start: new Date(task.start),
    end: new Date(task.deadline),
  }));

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <NavigationSider
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        setShowBot={setShowBot}
        setShowPlagiarismChecker={setShowPlagiarismChecker}
        setShowRepository={setShowRepository}
        handleLogout={handleLogout}
        setShowBibciteGenerator={setShowBibCitation}
      />

      <Layout>
        <div style={{ marginBottom: '18px' }}>
  <Header collapsed={collapsed} setCollapsed={setCollapsed} logout={handleLogout} />
</div>


        <Content>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{
              background: '#ffffff',
              padding: 'clamp(24px, 5vw, 48px) clamp(16px, 5vw, 32px)',
              borderRadius: '16px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            <motion.h1
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              style={{
                textAlign: 'center',
                color: '#2563eb',
                fontWeight: 800,
                fontSize: 'clamp(24px, 5vw, 40px)',
                marginBottom: 'clamp(20px, 4vw, 40px)',
              }}
            >
              {getDashboardHeading()}
            </motion.h1>

            {/* Motivational Card */}
            {isResearchDashboard && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: 'easeOut' }}
                style={{
                  marginTop: '2rem',
                  marginBottom: '2rem',
                  padding: '2rem',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #f0f4ff, #e2e8f0)',
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.06)',
                  borderLeft: '6px solid #2563eb',
                  backdropFilter: 'blur(4px)',
                  color: '#1e293b',
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: '#2563eb',
                  }}
                >
                  🔥 Thought Spark
                </h3>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 1 }}
                  style={{
                    fontStyle: 'italic',
                    marginTop: '1rem',
                    fontSize: '1.1rem',
                    color: '#334155',
                  }}
                >
                  {quote}
                </motion.p>
              </motion.div>
            )}

            {/* Conditionally render Analytics Overview and Calendar */}
            {isResearchDashboard && (
              <>
                {/* Analytics Overview */}
                <Row gutter={[24, 24]} style={{ marginBottom: '3rem' }}>
                  <Col xs={24} sm={8} md={8}>
                    <Card title="Total Tasks" style={{ background: '#fff' }}>
                      <p style={{ fontSize: '2rem', textAlign: 'center', color: '#1e293b' }}>
                        {tasks.length}
                      </p>
                    </Card>
                  </Col>
                  <Col xs={24} sm={8} md={8}>
                    <Card title="Completed Tasks" style={{ background: '#fff' }}>
                      <p style={{ fontSize: '2rem', textAlign: 'center', color: '#1e293b' }}>
                        {tasks.filter(task => task.completed).length}
                      </p>
                    </Card>
                  </Col>
                  <Col xs={24} sm={8} md={8}>
                    <Card title="Upcoming Deadlines" style={{ background: '#fff' }}>
                      <p style={{ fontSize: '2rem', textAlign: 'center', color: '#1e293b' }}>
                        {customTasks.filter(task => moment(task.deadline).diff(moment(), 'days') <= 7).length}
                      </p>
                    </Card>
                  </Col>
                </Row>

                {/* Calendar View */}
                <Card
                  title="Calendar"
                  style={{
                    marginBottom: '32px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                    border: '1px solid #d9d9d9',
                    overflowX: 'auto',
                  }}
                  bodyStyle={{
                    padding: '16px',
                    minHeight: '420px',
                  }}
                >
                  <div style={{ minWidth: 600 }}>
                    <Calendar
                      localizer={localizer}
                      events={events}
                      startAccessor="start"
                      endAccessor="end"
                      style={{
                        height: '400px',
                        background: '#fff',
                        borderRadius: '8px',
                      }}
                    />
                  </div>
                </Card>

              </>
            )}

            {/* Research Timeline */}
            {isResearchDashboard && (
              <div style={{ marginBottom: '3rem' }}>
                <Steps
                  current={tasks.filter(task => task.completed).length}
                  items={tasks.map(task => ({
                    title: task.text,
                    description: task.completed ? 'Completed' : `Priority: ${task.priority}`,
                    status: task.completed ? 'finish' : 'process',
                  }))}
                />
              </div>
            )}

            {showRepository ? (
              <Repository />
            ) : showPlagiarismChecker ? (
              <PlagiarismChecker />
            ) : showBibCitation ? (
              <BibifyClone />
            ) : (
              <>
                <ResearchProgress
                  tasks={tasks}
                  handleTaskToggle={handleTaskToggle}
                  handleAddTask={handleAddTask}
                  handleDeleteTask={handleDeleteTask}
                />

                <CustomTodo
                  customTask={customTask}
                  setCustomTask={setCustomTask}
                  customDate={customDate}
                  setCustomDate={setCustomDate}
                  customTasks={customTasks}
                  setCustomTasks={setCustomTasks}
                />
              </>
            )}
          </motion.div>
        </Content>
        <Footer
          style={{
            textAlign: 'center',
            backgroundColor: '#f9fafb',
            padding: '3rem 2rem',
            fontSize: '1rem',
            lineHeight: 1.8,
            marginTop: '6rem',
            minHeight: '150px',
          }}
        >
          © {new Date().getFullYear()} <strong>ScholAuxil</strong> — Made for curious minds.
        </Footer>
      </Layout>

      <Chatbot
        open={showBot}
        onClose={() => setShowBot(false)}
        configuration={{ ga4Property: 'your-property-id', Ga4Widget: { ga4Query: {} } }}
      />
    </Layout>
  );
};

export default Dashboard;



