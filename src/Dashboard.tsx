import React, { useState } from 'react';
import { useEffect } from 'react';
import { Layout } from 'antd';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import AskPromptDrawer from './AskPromptDrawer';
import NavigationSider from './DashboardWrapper/NavigationSider';
import HeaderBar from './DashboardWrapper/HeaderBar';
import CitationGenerator from './DashboardWrapper/Citation';
import ResearchProgress from './DashboardWrapper/ResearchProgress';
import CustomTodo from './DashboardWrapper/CustomTodo';
import Repository from './DashboardWrapper/Repository';
import PlagiarismChecker from './PlagiarismChecker';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebaseConfig'; 
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebaseConfig'; 
import { motion } from 'framer-motion';

const { Content } = Layout;

type Task = {
  id: number;
  text: string;
  completed: boolean;
};

type CustomTask = {
   text: string;
  start: string;
  deadline: string;
  completed: boolean;
  alerted?: boolean;
};

 

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [showBot, setShowBot] = useState(false);
  const [showPlagiarismChecker, setShowPlagiarismChecker] = useState(false);
  const [showRepository, setShowRepository] = useState(false);
  const [showBibCitation,setShowBibCitation] = useState(false);
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

  return () => unsubscribe();
}, []);


  const handleLogout = () => navigate('/LandingPage');

  const handleTaskToggle = async (id: number) => {
  const updatedTasks = tasks.map(task =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  setTasks(updatedTasks);

  const user = auth.currentUser;
  if (user) {
    await setDoc(doc(db, 'users', user.uid), {
      tasks: updatedTasks
    }, { merge: true });
  }
};

   const getDashboardHeading = () => {
    if (showRepository) return 'Repository';
    if (showPlagiarismChecker) return 'Plagiarism Checker';
    if (showBibCitation) return 'Citation Generator';
    return '';
  };


  const handleAddTask = async (text: string) => {
  const newTask = { id: Date.now(), text, completed: false };
  const updatedTasks = [...tasks, newTask];
  setTasks(updatedTasks);

  const user = auth.currentUser;
  if (user) {
    await setDoc(doc(db, 'users', user.uid), {
      tasks: updatedTasks
    }, { merge: true });
  }
};


  return (
    <Layout style={{ minHeight: '100vh' }}>
      <NavigationSider
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        setShowBot={setShowBot}
        setShowPlagiarismChecker={setShowPlagiarismChecker}
        setShowRepository={setShowRepository}
        handleLogout={handleLogout}
        setShowBibciteGenerator = {setShowBibCitation}
      />

      <Layout>
        <HeaderBar collapsed={collapsed} setCollapsed={setCollapsed} logout={handleLogout} />

        <Content style={{ margin: '24px' }}>
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

            {showRepository ? (
              <Repository />
            ) : showPlagiarismChecker ? (
              <PlagiarismChecker />
            ) : showBibCitation ? (
              <CitationGenerator />
            ) : (
              <>

                {/* ⇣ NEW props wired in here ⇣ */}
                <ResearchProgress
                  tasks={tasks}
                  handleTaskToggle={handleTaskToggle}
                  handleAddTask={handleAddTask}
                 
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
      </Layout>

      <AskPromptDrawer
        open={showBot}
        onClose={() => setShowBot(false)}
        configuration={{ ga4Property: 'your-property-id', Ga4Widget: { ga4Query: {} } }}
      />
    </Layout>
  );
};

export default Dashboard;




