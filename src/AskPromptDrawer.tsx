import { Button, Col, Drawer, Input, Row, Space, Spin } from 'antd';
import styled from 'styled-components';
import {
  AudioOutlined,
  PaperClipOutlined,
  PictureOutlined,
  SendOutlined,
  UploadOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import useSpeechToText from 'react-hook-speech-to-text';

type AskPromptDrawerProps = {
  open: boolean;
  onClose: () => void;
  configuration: {
    ga4Property: string;
    Ga4Widget: {
      ga4Query: any;
    };
  };
};

const AskPromptDrawer: React.FC<AskPromptDrawerProps> = ({
  open,
  onClose,
}) => {
  const [question, setQuestion] = useState('');
  const [questionResponse, setQuestionResponse] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedDocumentName, setUploadedDocumentName] = useState<string | null>(null);
  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null);
  const [uploadedDocumentFile, setUploadedDocumentFile] = useState<File | null>(null);
  const [isHoveringDocIcon, setIsHoveringDocIcon] = useState(false);
  const [isHoveringDocContainer, setIsHoveringDocContainer] = useState(false);
  const [isHoveringImgIcon, setIsHoveringImgIcon] = useState(false);
  const [isHoveringImgContainer, setIsHoveringImgContainer] = useState(false);

  const { isRecording, interimResult, startSpeechToText, stopSpeechToText } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
  });

  const promptSuggestions = [
    '🔍 Summarize a research paper(TL;DR)',
    '📄 Extract key insights from a paper',
    '📊 Summarize the results section',
    '📑 Summarize methodology',
    '🌟 Discover popular research topics right now',
];

  const handleClose = () => {
    setQuestion('');
    setQuestionResponse(undefined);
    setValidationMessage('');
    onClose();
  };

  useEffect(() => {
    if (!isHoveringDocIcon && !isHoveringDocContainer) {
      const timeout = setTimeout(() => setShowDocumentUpload(false), 100);
      return () => clearTimeout(timeout);
    }
  }, [isHoveringDocIcon, isHoveringDocContainer]);

  useEffect(() => {
    if (!isHoveringImgIcon && !isHoveringImgContainer) {
      const timeout = setTimeout(() => setShowImageUpload(false), 100);
      return () => clearTimeout(timeout);
    }
  }, [isHoveringImgIcon, isHoveringImgContainer]);

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
    doc: 'public/images/icons/Docx.png',
    docx: 'public/images/icons/Docx.png',
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
  
      if (uploadedDocumentFile) {
        formData.append('file', uploadedDocumentFile);
      }
  
      if (uploadedImageFile) {
        formData.append('image', uploadedImageFile);
      }
  
      // Sending the request to the backend
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        body: formData, 
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      // Process the response from the backend
      const result = await response.json();
      console.log('API Result:', result);
  
      // Extract and sanitize the answer
      const answer = result?.choices?.length > 0 ? result.choices[0].message.content : null;
      if (!answer) {
        setValidationMessage('No response received for the question.');
      } else {
        setQuestionResponse(DOMPurify.sanitize(answer)); // Sanitize the answer for safe display
      }
    } catch (err) {
      console.error('API error:', err);
      setValidationMessage('An error occurred while processing your question.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      placement="right"
      onClose={handleClose}
      open={open}
      width={500}
      title="Ask Bot"
    >
      <DrawerWrapper>
        <Row gutter={[24, 0]}>
          <Col span={24}>
            <div style={{ textAlign: 'center', marginBottom: 35 }}>
              <div style={{ marginBottom: 15, display: 'flex', justifyContent: 'center' }}>
                <img
                  style={{ height: 120, width: 125 }}
                  src="/images/icons/sparkle.png"
                  alt="sparkle"
                />
              </div>
              <h3
                style={{
                  background: 'linear-gradient(90deg, rgba(2,6,23,1) 0%, rgba(143,41,118,1) 63%, rgba(62,34,203,1) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 600,
                  fontSize: 22,
                }}
              >
                Get instant insights about your research.
              </h3>
            </div>

            <Space wrap style={{ marginBottom: 50, display: 'flex', justifyContent: 'center', gap: '15px' }}>
              {promptSuggestions.map((prompt, index) => (
                <Button
                  key={index}
                  style={{ fontSize: 14, fontWeight: 400, marginBottom: 4 }}
                  size="small"
                  onClick={() => {
                    setQuestion(prompt);
                  }}
                >
                  {prompt}
                </Button>
              ))}
            </Space>

            <div className="gradient-container">
              <div className="white-card">
                {uploadedDocumentName && (
                  <div className='file-preview'>
                    <img src={getFileIcon(uploadedDocumentName)} alt="file icon" className='doc-img' />
                    <div style={{ lineHeight: '1.2' }}>
                      <div>{uploadedDocumentName}</div>
                      <div style={{ color: '#888' }}>Document</div>
                    </div>
                    <div onClick={() => setUploadedDocumentName(null)} className="cross-btn">✕</div>
                  </div>
                )}

                {uploadedImage && (
                  <div className="image-preview" style={{ marginBottom: '10px' }}>
                    <img src={uploadedImage} alt="Uploaded Preview" className="uploaded-img" />
                    <div className="cross-btn" onClick={() => setUploadedImage(null)}>✖</div>
                  </div>
                )}

                <Input
                  className='text-input'
                  type="text"
                  placeholder="Ask anything about this data..."
                  value={question}
                  onChange={(e) => setQuestion(e?.target?.value)}
                  onPressEnter={() => askQuestion(question)}
                  style={{ background: 'transparent', fontSize: 60 }}
                />

                <div className="icon-container">
                  <AudioOutlined onClick={handleMicClick} className={`audio-icon ${isRecording ? 'recording' : ''}`} />

                  <div style={{ position: 'relative' }}>
                    <PaperClipOutlined
                      className="icon"
                      onMouseEnter={() => { setShowDocumentUpload(true); setIsHoveringDocIcon(true); }}
                      onMouseLeave={() => setIsHoveringDocIcon(false)}
                      onClick={() => setShowDocumentUpload((prev) => !prev)}
                    />
                    {showDocumentUpload && (
                      <div
                        className='FloatingContainer'
                        onMouseEnter={() => setIsHoveringDocContainer(true)}
                        onMouseLeave={() => setIsHoveringDocContainer(false)}
                      >
                        <label className="tooltipWrapper">
                          <UploadOutlined className='upload-icon' />
                          <span>Upload Document</span>
                          <RightOutlined className='arrow-icon' />
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,.txt,.xlsx,.xls"
                            style={{ display: 'none' }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                console.log("Uploaded file:", file.name);
                                setUploadedDocumentName(file.name);
                                setUploadedDocumentFile(file);

                              }
                              else {
                                console.error("No file uploaded");
                              }
                            }}
                          />
                        </label>
                      </div>
                    )}
                  </div>

                  <div style={{ position: 'relative' }}>
                    <PictureOutlined
                      className="icon"
                      onMouseEnter={() => { setShowImageUpload(true); setIsHoveringImgIcon(true); }}
                      onMouseLeave={() => setIsHoveringImgIcon(false)}
                      onClick={() => setShowImageUpload((prev) => !prev)}
                    />
                    {showImageUpload && (
                      <div
                        className='FloatingContainer'
                        onMouseEnter={() => setIsHoveringImgContainer(true)}
                        onMouseLeave={() => setIsHoveringImgContainer(false)}
                      >
                        <label className="tooltipWrapper">
                          <UploadOutlined className='upload-icon' />
                          <span>Upload Image</span>
                          <RightOutlined className='arrow-icon' />
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
                                  setShowImageUpload(false);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />

                        </label>
                      </div>
                    )}
                  </div>

                  <div style={{ marginLeft: 'auto' }}>
                    <SendOutlined className='send-button' onClick={() => askQuestion(question)} />
                  </div>
                </div>
              </div>
            </div>

            {validationMessage && (
              <div style={{ color: 'red', marginTop: 8 }}>{validationMessage}</div>
            )}

            {loading && (
              <div style={{ textAlign: 'center', marginTop: 20 }}>
                <Spin size="large" />
              </div>
            )}

            {questionResponse && !loading && (
              <div
                style={{ marginTop: 20, whiteSpace: 'pre-wrap' }}
                dangerouslySetInnerHTML={{ __html: questionResponse }}
              />
            )}
          </Col>
        </Row>
      </DrawerWrapper>
    </Drawer>
  );
};

export default AskPromptDrawer;

const DrawerWrapper = styled.div`

.gradient-container {
  background: linear-gradient(to right, #00C1FD, #4707D8);
  padding: 2px;
  border-radius: 12px;
}

.white-card {
  background: #FFFFFF;
  border-radius: 10px;
  padding: 10px;
}

.file-preview {
  display: flex;
  align-items: center;
  color: #767676;
  background: #FFFFFF;
  padding: 10px 15px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: fit-content;
  margin-bottom: 10px;
  position: relative;
}       

.doc-img{
width: 40px;
height: 40px;
margin-right: 10px;
border-radius: 8px;
}

.image-preview{
  position: relative;
  margin-bottom: 12px;
  width: 50px;
  height: 50px;
}

.uploaded-img{
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
  border: 1px solid #ccc;
}

.cross-btn{
  position: absolute;
  top: -8px;
  right: -8px;
  background: black;
  border: 1px solid #ccc;
  border-radius: 30%;
  cursor: pointer;
  width: 18px;
  height: 18px;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 10px;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.2);
}

.FloatingContainer {
  position: absolute;
  border: 1px solid #ccc;
  padding: 10px;
  top: -40px;
  left: -10px;
  border-radius: 8px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
  font-weight: 500;
  color: #1C1C1C;
  background-color: #f5f7fa;
}

  input[type="file"] {
    display: none;
  }

  span {
    margin-right: 8px;
  }

.tooltipWrapper{
 display: flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  white-space: nowrap;
  transition: color 0.2s ease, transform 0.3s ease;
}

.tooltipWrapper:hover {
  color: #007bff; 
}

.tooltipWrapper:hover .upload-icon,
.tooltipWrapper:hover .arrow-icon {
  color: #007bff;
  transition: color 0.2s ease;
}

.tooltipWrapper:active {
  transform: scale(0.8); 
  color: #0056b3; 
}

.text-input,
.text-input input {
  font-size: 14px !important;
}

.icon-container{
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 15px;
}

.arrow-icon {
  font-size: 10px !important;
  margin-right: 8px;
}

.anticon {
 color: black;
 transition: transform 0.3s ease, color 0.3s ease; 
 font-size: 20px;
}

.anticon:hover {
  color: #007bff; 
  transform: scale(1.1); 
}

.audio-icon.recording {
  color: red; 
  animation: pulse 1s infinite;
}

.audio-icon:active {
  transform: scale(0.8); 
  color: #0056b3; 
}

.send-button:active {
  transform: scale(0.8); 
  color: #0056b3; 
}

.upload-icon{
font-size: 16px !important;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.15); }
  100% { transform: scale(1); }
}


`;












