import React from 'react';
import { Card, Typography, Avatar, Descriptions, Button, Space, Divider } from 'antd';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const ProfilePage: React.FC = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  const navigate = useNavigate();

  if (!user) return <div>Loading...</div>;

  const displayName =
    user.displayName || (user.email ? user.email.split('@')[0] : 'N/A');

  const creationTime = user.metadata.creationTime
    ? new Date(user.metadata.creationTime).toLocaleString()
    : 'N/A';

  const lastSignInTime = user.metadata.lastSignInTime
    ? new Date(user.metadata.lastSignInTime).toLocaleString()
    : 'N/A';

  return (
    <Card
      style={{
        maxWidth: 700,
        margin: '40px auto',
        padding: 24,
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
        borderRadius: 12,
      }}
    >
      <Button onClick={() => navigate(-1)} type="link" style={{ marginBottom: 16 }}>
        ← Back
      </Button>

      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Avatar
          size={96}
          style={{ backgroundColor: '#2563eb', marginBottom: 12, fontSize: 32 }}
        >
          {displayName.charAt(0).toUpperCase()}
        </Avatar>
        <Title level={3} style={{ marginBottom: 0 }}>{displayName}</Title>
        <Text type="secondary">Welcome to your profile</Text>
      </div>

      <Descriptions
        bordered
        column={1}
        size="middle"
        labelStyle={{ fontWeight: 600, width: 200 }}
      >
        <Descriptions.Item label="Display Name">{displayName}</Descriptions.Item>
        <Descriptions.Item label="Email">{user.email || 'N/A'}</Descriptions.Item>
        <Descriptions.Item label="User ID (UID)">{user.uid}</Descriptions.Item>
        <Descriptions.Item label="Email Verified">
          {user.emailVerified ? 'Yes ✅' : 'No ❌'}
        </Descriptions.Item>
        <Descriptions.Item label="Provider">
          {user.providerData[0]?.providerId || 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="Account Created On">{creationTime}</Descriptions.Item>
        <Descriptions.Item label="Last Sign-In">{lastSignInTime}</Descriptions.Item>
      </Descriptions>

      <Divider />

      <Space style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
        
        <Button danger>
          <a href="/login">
          Sign Out</a>
        </Button>
      </Space>
    </Card>
  );
};

export default ProfilePage;



