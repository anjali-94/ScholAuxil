import React, { useEffect, useState } from 'react';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  RobotOutlined,
  UploadOutlined,
  LogoutOutlined,
  PlusOutlined
} from '@ant-design/icons';

const { Sider } = Layout;

type NavigationSiderProps = {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  setShowBot: (show: boolean) => void;
  setShowPlagiarismChecker: (show: boolean) => void;
  setShowRepository: (show: boolean) => void;
  handleLogout: () => void;
  setShowBibciteGenerator: (show: boolean) => void;
};

const NavigationSider: React.FC<NavigationSiderProps> = ({
  collapsed,
  setCollapsed,
  setShowBot,
  setShowPlagiarismChecker,
  setShowRepository,
  handleLogout,
  setShowBibciteGenerator,
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  // Handler to reset to the home dashboard
  const handleHomeClick = () => {
    setShowBot(false);
    setShowPlagiarismChecker(false);
    setShowRepository(false);
    setShowBibciteGenerator(false);
  };

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
      breakpoint="md"
      collapsedWidth={isMobile ? 80 : 80} // Show only icons on mobile collapse
      trigger={null}
      style={{ minHeight: '100vh' }}
    >
      <div style={{ height: 32, margin: 16, color: '#fff', textAlign: 'center' }}>
        {!collapsed || !isMobile ? 'Dashboard' : null}
      </div>
      <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}> 
        <Menu.Item key="1" icon={<DashboardOutlined />} onClick={handleHomeClick}>
          {!collapsed || !isMobile ? 'Home' : null}
        </Menu.Item>
        <Menu.Item key="2" icon={<RobotOutlined />} onClick={() => setShowBot(true)}>
          {!collapsed || !isMobile ? 'Ask Bot' : null}
        </Menu.Item>
        <Menu.Item
          key="3"
          icon={<UploadOutlined />}
          onClick={() => {
            setShowPlagiarismChecker(true);
            setShowRepository(false);
            setShowBot(false);
            setShowBibciteGenerator(false);
          }}
        >
          {!collapsed || !isMobile ? 'Plagiarism Checker' : null}
        </Menu.Item>
        <Menu.Item
          key="4"
          icon={<PlusOutlined />}
          onClick={() => {
            setShowBot(false);
            setShowPlagiarismChecker(false);
            setShowRepository(false);
            setShowBibciteGenerator(true);
          }}
        >
          {!collapsed || !isMobile ? 'Citation Generator' : null}
        </Menu.Item>
        <Menu.Item
          key="5"
          icon={<PlusOutlined />}
          onClick={() => {
            setShowBot(false);
            setShowPlagiarismChecker(false);
            setShowRepository(true);
            setShowBibciteGenerator(false);
          }}
        >
          {!collapsed || !isMobile ? 'Repository' : null}
        </Menu.Item>
        <Menu.Item key="6" icon={<LogoutOutlined />} onClick={handleLogout}>
          {!collapsed || !isMobile ? 'Logout' : null}
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default NavigationSider;
