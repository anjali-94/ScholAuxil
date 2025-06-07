import { useState } from 'react';
import { Button, Input, Typography, Spin, Alert } from 'antd';
import axios from 'axios';

const { TextArea } = Input;
const { Title, Paragraph } = Typography;

const PlagiarismChecker = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleCheck = async () => {
    if (!text.trim()) {
      setError('Please enter text to check for plagiarism.');
      return;
    }

    if (text.trim().length < 100) {
      setError(`Text too short. Minimum 100 characters required (current: ${text.trim().length}).`);
      return;
    }

    if (text.trim().length > 120000) {
      setError(`Text too long. Maximum 120,000 characters allowed (current: ${text.trim().length}).`);
      return;
    }

    setError('');
    setLoading(true);
    setResult(null);

    try {
      const response = await axios.post('http://localhost:5000/api/check-plagiarism', { text });
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: 800, margin: '0 auto' }}>
      <Title level={2}>Plagiarism Checker</Title>
      <Paragraph>Enter text below to check for potential plagiarism using Winston AI.</Paragraph>

      <TextArea
        rows={8}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste your text here..."
      />

      <Button type="primary" onClick={handleCheck} style={{ marginTop: 16 }} disabled={loading}>
        Check Plagiarism
      </Button>

      {loading && <Spin style={{ display: 'block', marginTop: 20 }} />}

      {error && <Alert message={error} type="error" style={{ marginTop: 20 }} />}

      {result && (
        <div style={{ marginTop: 20 }}>
          <Title level={4}>Plagiarism Report</Title>
          <pre style={{ background: '#f5f5f5', padding: '1rem' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default PlagiarismChecker;
