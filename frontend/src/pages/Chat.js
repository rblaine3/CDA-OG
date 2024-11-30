import React, { useState, useEffect, useRef } from 'react';
import { Box, TextField, IconButton, Typography, CircularProgress, useTheme, useMediaQuery } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import { useReactMediaRecorder } from 'react-media-recorder';
import { keyframes } from '@mui/system';
import axios from 'axios';

// Keyframe animations
const pulseAnimation = keyframes`
  0% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.05); opacity: 0.8; }
  100% { transform: scale(1); opacity: 0.5; }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const setupComplete = sessionStorage.getItem('setupComplete');
    if (!setupComplete) {
      navigate('/chat-setup');
      return;
    }

    const initialMessage = sessionStorage.getItem('initialMessage');
    if (initialMessage) {
      setMessages([{ text: initialMessage, isUser: false }]);
      sessionStorage.removeItem('initialMessage');
    }
  }, [navigate]);

  const { status, startRecording, stopRecording, mediaBlobUrl } = useReactMediaRecorder({
    audio: true,
    onStop: async (blobUrl, blob) => {
      const formData = new FormData();
      const audioFile = new File([blob], 'audio.wav', { type: 'audio/wav' });
      formData.append('audio', audioFile);
      
      try {
        setIsLoading(true);
        const response = await axios.post('/transcribe', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        if (response.data.text) {
          setCurrentMessage(response.data.text);
          handleMessageSubmit({ preventDefault: () => {} });
        }
      } catch (error) {
        console.error('Error transcribing audio:', error);
      } finally {
        setIsLoading(false);
      }
    },
  });

  const handleMessageSubmit = async (e) => {
    e.preventDefault();
    if (!currentMessage.trim()) return;

    const userMessage = currentMessage;
    setCurrentMessage('');
    setMessages(prev => [...prev, { text: userMessage, isUser: true }]);
    setIsLoading(true);

    try {
      const response = await axios.post('/chat', {
        message: userMessage
      });
      
      if (response.status === 200) {
        setMessages(prev => [...prev, { text: response.data.message, isUser: false }]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { text: 'Error: Unable to get response', isUser: false }]);
    }
    setIsLoading(false);
  };

  const handleVoiceButton = async () => {
    if (isRecording) {
      stopRecording();
      setIsRecording(false);
    } else {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        startRecording();
        setIsRecording(true);
      } catch (err) {
        console.error('Error accessing microphone:', err);
        alert('Unable to access microphone. Please check your browser permissions.');
      }
    }
  };

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 50%, #01579b 100%)',
        position: 'fixed',
        top: 0,
        left: 0,
      }}
    >
      {/* Messages Container */}
      <Box
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(255, 255, 255, 0.1)',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '4px',
          },
        }}
      >
        {messages.map((message, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              justifyContent: message.isUser ? 'flex-end' : 'flex-start',
              animation: `${fadeIn} 0.3s ease-out`,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                maxWidth: '80%',
                alignItems: 'flex-start',
              }}
            >
              {!message.isUser && (
                <Box
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    p: 1,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <SmartToyIcon sx={{ color: '#64ffda' }} />
                </Box>
              )}
              <Box
                sx={{
                  p: 2,
                  borderRadius: message.isUser ? '20px 20px 0 20px' : '20px 20px 20px 0',
                  backgroundColor: message.isUser 
                    ? 'rgba(255, 255, 255, 0.15)'
                    : 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: message.isUser
                    ? '0 4px 15px rgba(0, 255, 255, 0.1)'
                    : '0 4px 15px rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <Typography
                  sx={{
                    color: 'white',
                    fontSize: '0.95rem',
                    lineHeight: 1.5,
                    textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  }}
                >
                  {message.text}
                </Typography>
              </Box>
              {message.isUser && (
                <Box
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    p: 1,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <PersonIcon sx={{ color: '#64ffda' }} />
                </Box>
              )}
            </Box>
          </Box>
        ))}
        {isLoading && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              p: 2,
            }}
          >
            <CircularProgress
              sx={{
                color: '#64ffda',
                animation: `${pulseAnimation} 1.5s ease-in-out infinite`,
              }}
            />
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input Container */}
      <Box
        sx={{
          p: 2,
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Box
          component="form"
          onSubmit={handleMessageSubmit}
          sx={{
            display: 'flex',
            gap: 1,
            maxWidth: '800px',
            margin: '0 auto',
          }}
        >
          <TextField
            fullWidth
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleMessageSubmit(e)}
            placeholder="Type your message..."
            disabled={isLoading}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '25px',
                color: 'white',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#64ffda',
                },
              },
              '& .MuiOutlinedInput-input': {
                '&::placeholder': {
                  color: 'rgba(255, 255, 255, 0.5)',
                },
              },
            }}
          />
          <IconButton
            onClick={handleVoiceButton}
            disabled={isLoading}
            sx={{
              backgroundColor: isRecording ? 'rgba(244, 67, 54, 0.1)' : 'rgba(255, 255, 255, 0.05)',
              borderRadius: '50%',
              width: 48,
              height: 48,
              '&:hover': {
                backgroundColor: isRecording ? 'rgba(244, 67, 54, 0.2)' : 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            {isRecording ? (
              <StopIcon sx={{ color: '#ff1744' }} />
            ) : (
              <MicIcon sx={{ color: '#64ffda' }} />
            )}
          </IconButton>
          <IconButton
            onClick={handleMessageSubmit}
            disabled={isLoading || !currentMessage.trim()}
            sx={{
              backgroundColor: 'rgba(100, 255, 218, 0.1)',
              borderRadius: '50%',
              width: 48,
              height: 48,
              '&:hover': {
                backgroundColor: 'rgba(100, 255, 218, 0.2)',
              },
              '&.Mui-disabled': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              },
            }}
          >
            <SendIcon sx={{ color: '#64ffda' }} />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default Chat;
