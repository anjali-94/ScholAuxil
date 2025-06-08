import { Button, Input, Spin } from 'antd';
import styled from 'styled-components';
import {
  AudioOutlined,
  PaperClipOutlined,
  PictureOutlined,
  SendOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import useSpeechToText from 'react-hook-speech-to-text';

type ChatbotProps = {
  open: boolean;
  onClose: () => void;
  configuration: {
    ga4Property: string;
    Ga4Widget: {
      ga4Query: any;
    };
  };
};

const Chatbot: React.FC<ChatbotProps> = ({ open, onClose }) => {
  const [question, setQuestion] = useState('');
  const [questionResponse, setQuestionResponse] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedDocumentName, setUploadedDocumentName] = useState<string | null>(null);
  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null);
  const [uploadedDocumentFile, setUploadedDocumentFile] = useState<File | null>(null);
  const { isRecording, interimResult, startSpeechToText, stopSpeechToText } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
  });

  const promptSuggestions = [
    '🔍 Summarize a research paper',
    '📄 Extract key insights',
    '📊 Summarize results',
    '📑 Summarize methodology',
    '🌟 Discover trending topics',
    '🧠 Generate research hypotheses',
    '📚 Review related literature',
    '🔬 Explain key concepts',
    '📈 Analyze dataset trends',
  ];

  const handleClose = () => {
    setQuestion('');
    setQuestionResponse(undefined);
    setValidationMessage('');
    setUploadedImage(null);
    setUploadedDocumentName(null);
    setUploadedImageFile(null);
    setUploadedDocumentFile(null);
    onClose();
  };

  useEffect(() => {
    if (isRecording && interimResult) {
      setQuestion(interimResult);
    }
  }, [interimResult, isRecording]);

  const handleMicClick = async () => {
    try {
      const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      if (permissionStatus.state === 'granted' || permissionStatus.state === 'prompt') {
        if (isRecording) {
          stopSpeechToText();
        } else {
          startSpeechToText();
        }
      } else {
        alert('Microphone access denied.');
      }
    } catch (err) {
      console.error('Microphone permission error:', err);
    }
  };

  const iconMapping = {
    pdf: 'public/images/icons/pdf.png',
    doc: 'public/images/icons/docx.png',
    docx: 'public/images/icons/docx.png',
    txt: 'public/images/icons/txt.png',
    xlsx: 'public/images/icons/excel.png',
    xls: 'public/images/icons/excel.png',
  };

  const getFileIcon = (fileName: string) => {
    const fileExtension = fileName?.toLowerCase()?.split('.').pop();
    return iconMapping[fileExtension as keyof typeof iconMapping] || 'public/images/icons/default.png';
  };

  const askQuestion = async (userQuestion: string) => {
    if (!userQuestion && !uploadedDocumentFile && !uploadedImageFile) {
      setValidationMessage('Please enter a question or upload a file.');
      return;
    }

    setLoading(true);
    setValidationMessage('');
    setQuestionResponse(undefined);

    try {
      const formData = new FormData();
      formData.append('question', userQuestion);
      if (uploadedDocumentFile) formData.append('file', uploadedDocumentFile);
      if (uploadedImageFile) formData.append('image', uploadedImageFile);

      const response = await fetch('https://backend-scholauxil.onrender.com/api/chat', {
        method: 'POST',
        body: formData,
      });

      if (!response || !response.ok) throw new Error('Network response was not ok');
      const result = await response.json();
      const answer = result?.choices?.length > 0 ? result.choices[0].message.content : null;
      if (!answer) {
        setValidationMessage('No response received.');
      } else {
        setQuestionResponse(DOMPurify.sanitize(answer));
      }
    } catch (err) {
      console.error('API error:', err);
      setValidationMessage('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ChatbotContainer open={open}>
      <Header>
        <Title>Research Assistant</Title>
        <CloseButton onClick={handleClose}>
          <CloseOutlined />
        </CloseButton>
      </Header>
      <Content>
        <PromptBar>
          {promptSuggestions.map((prompt, index) => (
            <PromptButton key={index} onClick={() => setQuestion(prompt)}>
              {prompt}
            </PromptButton>
          ))}
        </PromptBar>
        <ChatArea>
          {questionResponse && !loading && (
            <ResponseBubble>
              <div dangerouslySetInnerHTML={{ __html: questionResponse }} />
            </ResponseBubble>
          )}
          {loading && <Spin size="large" />}
          {validationMessage && <ErrorMessage>{validationMessage}</ErrorMessage>}
        </ChatArea>
        <InputArea>
          {(uploadedDocumentName || uploadedImage) && (
            <FilePreview>
              {uploadedDocumentName && (
                <FileItem>
                  <img src={getFileIcon(uploadedDocumentName)} alt="file icon" className="file-icon" />
                  <span>{uploadedDocumentName}</span>
                  <RemoveButton
                    onClick={() => {
                      setUploadedDocumentName(null);
                      setUploadedDocumentFile(null);
                    }}
                  >
                    ✕
                  </RemoveButton>
                </FileItem>
              )}
              {uploadedImage && (
                <FileItem>
                  <img src={uploadedImage} alt="Uploaded Preview" className="image-preview" />
                  <RemoveButton
                    onClick={() => {
                      setUploadedImage(null);
                      setUploadedImageFile(null);
                    }}
                  >
                    ✕
                  </RemoveButton>
                </FileItem>
              )}
            </FilePreview>
          )}
          <InputWrapper>
            <StyledInput
              placeholder="Ask a research question..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onPressEnter={() => askQuestion(question)}
            />
            <ActionButtons>
              <AudioButton className={isRecording ? 'recording' : ''} onClick={handleMicClick}>
                <AudioOutlined />
              </AudioButton>
              <UploadButton>
                <label className="upload-label">
                  <PaperClipOutlined />
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,.xlsx,.xls"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setUploadedDocumentName(file.name);
                        setUploadedDocumentFile(file);
                      }
                    }}
                  />
                </label>
              </UploadButton>
              <UploadButton>
                <label className="upload-label">
                  <PictureOutlined />
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setUploadedImage(reader.result as string);
                          setUploadedImageFile(file);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </UploadButton>
              <SendButton onClick={() => askQuestion(question)}>
                <SendOutlined />
              </SendButton>
            </ActionButtons>
          </InputWrapper>
        </InputArea>
      </Content>
    </ChatbotContainer>
  );
};

export default Chatbot;

const ChatbotContainer = styled.div<{ open: boolean }>`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: ${({ open }) => (open ? '80vh' : '0')};
  background: #f0f4f8;
  border-top: 2px solid #93c5fd;
  transition: height 0.4s ease-in-out;
  overflow: hidden;
  font-family: 'Inter', sans-serif;
  z-index: 1000;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
`;



const Header = styled.div`
  background: linear-gradient(90deg, #1e40af, #3b82f6);
  color: white;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
`;

const Title = styled.h3`
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  background: linear-gradient(45deg, #ffffff, #93c5fd);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  transition: transform 0.2s ease;
  &:hover {
    color: #f87171;
    transform: rotate(90deg);
  }
`;

const Content = styled.div`
  padding: 24px;
  height: calc(100% - 60px);
  display: flex;
  flex-direction: column;
  gap: 24px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(8px);
`;

const PromptBar = styled.div`
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  overflow-x: auto;
  gap: 12px;
  padding-bottom: 12px;
  background: #f0f4f8; /* Match parent background to avoid visual disconnect */
  &::-webkit-scrollbar {
    height: 10px;
  }
  &::-webkit-scrollbar-thumb {
    background: #60a5fa;
    border-radius: 5px;
  }
`;

const ChatArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto; /* Make ChatArea independently scrollable */
  padding: 16px 0;
  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background: #60a5fa;
    border-radius: 4px;
  }
`;

const PromptButton = styled(Button)`
  background: white;
  border: none;
  border-radius: 20px;
  color: #3730a3;
  font-size: 14px;
  padding: 8px 16px;
  &:hover {
    background: #c7d2fe;
    color: #312e81;
  }
`;


const ResponseBubble = styled.div`
  background: linear-gradient(135deg, #ffffff, #dbeafe);
  border-radius: 16px;
  padding: 16px 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  max-width: 85%;
  align-self: flex-start;
  animation: slideIn 0.4s ease;
  border: 1px solid #93c5fd;
  @keyframes slideIn {
    from {
      transform: translateY(30px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const ErrorMessage = styled.div`
  color: #f87171;
  font-size: 14px;
  font-weight: 500;
  background: rgba(248, 113, 113, 0.1);
  padding: 8px 12px;
  border-radius: 8px;
`;

const InputArea = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
`;

const FilePreview = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
`;

const FileItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(45deg, #e0e7ff, #f3f4f6);
  padding: 10px;
  border-radius: 10px;
  transition: transform 0.2s ease;
  &:hover {
    transform: scale(1.02);
  }
  .file-icon,
  .image-preview {
    width: 40px;
    height: 40px;
    object-fit: cover;
    border-radius: 6px;
    border: 1px solid #bfdbfe;
  }
`;

const RemoveButton = styled.div`
  cursor: pointer;
  color: #f87171;
  font-size: 14px;
  font-weight: bold;
  transition: color 0.2s ease;
  &:hover {
    color: #dc2626;
  }
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StyledInput = styled(Input)`
  border-radius: 30px;
  border: 1px solid #93c5fd;
  padding: 10px 20px;
  flex: 1;
  font-size: 15px;
  background: #f8fafc;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 8px rgba(59, 130, 246, 0.3);
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
`;

const AudioButton = styled.button`
  background: linear-gradient(45deg, #6b7280, #9ca3af);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  inder;
  justify-content: center;
  font-size: 18px;
  color: white;
  &.recording {
    background: linear-gradient(45deg, #dc2626, #f87171);
    animation: pulse 1s infinite;
  }
  &:hover {
    background: linear-gradient(45deg, #9ca3af, #6b7280);
  }
  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.15);
    }
    100% {
      transform: scale(1);
    }
  }
`;

const UploadButton = styled.button`
  background: linear-gradient(45deg, #6b7280, #9ca3af);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: white;
  cursor: pointer;
  .upload-label {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  &:hover {
    background: linear-gradient(45deg, #9ca3af, #6b7280);
  }
`;

const SendButton = styled.button`
  background: linear-gradient(45deg, #1e40af, #3b82f6);
  border: none;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  &:hover {
    background: linear-gradient(45deg, #3b82f6, #1e40af);
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
`;













