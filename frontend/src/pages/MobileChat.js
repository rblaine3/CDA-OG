import React, { useState, useEffect, useRef } from 'react';
import { Box, IconButton, Typography, Fade, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useReactMediaRecorder } from 'react-media-recorder';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { keyframes } from '@mui/system';

// Keyframe animations
const textReveal = keyframes`
  0% { opacity: 0; transform: translateY(20px); filter: blur(10px); }
  100% { opacity: 1; transform: translateY(0); filter: blur(0); }
`;

const glowPulse = keyframes`
  0% { box-shadow: 0 0 20px #64ffda, 0 0 40px #64ffda, 0 0 60px #64ffda; }
  50% { box-shadow: 0 0 30px #64ffda, 0 0 50px #64ffda, 0 0 70px #64ffda; }
  100% { box-shadow: 0 0 20px #64ffda, 0 0 40px #64ffda, 0 0 60px #64ffda; }
`;

const rippleEffect = keyframes`
  0% { transform: scale(1); opacity: 0.8; }
  100% { transform: scale(1.5); opacity: 0; }
`;

const MobileChat = () => {
  const [allMessages, setAllMessages] = useState([]); // Store all messages
  const [currentQuestion, setCurrentQuestion] = useState(null); // Current question to display
  const [isRecording, setIsRecording] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textMessage, setTextMessage] = useState('');
  const [isTypingEffect, setIsTypingEffect] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const setupComplete = sessionStorage.getItem('setupComplete');
    if (!setupComplete) {
      navigate('/chat-setup');
      return;
    }

    // Add welcome message first
    const welcomeMessage = {
      text: "Hi, I'm Survai, your digital interviewer. Let's have a great conversation!",
      isUser: false,
      isWelcome: true
    };
    handleNewMessage(welcomeMessage);

    // Then add the initial message from chat setup if it exists
    const initialMessage = sessionStorage.getItem('initialMessage');
    if (initialMessage) {
      setTimeout(() => {
        handleNewMessage({ 
          text: initialMessage, 
          isUser: false 
        });
      }, 2000);
      sessionStorage.removeItem('initialMessage');
    }
  }, [navigate]);

  const handleNewMessage = async (message) => {
    setIsTypingEffect(true);
    
    // Add message to full history
    setAllMessages(prev => [...prev, message]);
    
    // If it's not a user message and not the welcome message, set it as current question
    if (!message.isUser && !message.isWelcome) {
      setCurrentQuestion(message);
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsTypingEffect(false);
  };

  const handleMessage = async (text) => {
    // Save user's answer
    await handleNewMessage({ text, isUser: true });

    try {
      const response = await axios.post('/chat', { message: text });
      if (response.status === 200) {
        await handleNewMessage({ 
          text: response.data.message, 
          isUser: false 
        });
      }
    } catch (error) {
      console.error('Error:', error);
      await handleNewMessage({ 
        text: 'Connection lost. Please try again.', 
        isUser: false, 
        isError: true 
      });
    }
  };

  const { startRecording, stopRecording } = useReactMediaRecorder({
    audio: true,
    onStop: async (blobUrl, blob) => {
      const formData = new FormData();
      formData.append('audio', blob, 'audio.wav');
      
      try {
        const response = await axios.post('/transcribe', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        
        if (response.data.text) {
          await handleMessage(response.data.text);
        }
      } catch (error) {
        console.error('Error transcribing audio:', error);
      }
    },
  });

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
        alert('Unable to access microphone. Please check your permissions.');
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
        background: 'linear-gradient(135deg, #0a0a2e 0%, #1a1a3a 50%, #2a2a4a 100%)',
        position: 'fixed',
        top: 0,
        left: 0,
        overflow: 'hidden',
      }}
    >
      {/* Ambient Background Effects */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          background: 'radial-gradient(circle at 50% 50%, rgba(100, 255, 218, 0.2) 0%, transparent 70%)',
          animation: `${glowPulse} 4s ease-in-out infinite`,
          pointerEvents: 'none',
        }}
      />

      {/* Current Question Display */}
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
        }}
      >
        <Fade in={!isTypingEffect} timeout={1000}>
          <Box
            sx={{
              maxWidth: '90%',
              textAlign: 'center',
              animation: `${textReveal} 0.5s ease-out`,
            }}
          >
            <Typography
              variant="h4"
              sx={{
                color: '#ffffff',
                fontSize: '2rem',
                fontWeight: 600,
                lineHeight: 1.4,
                textShadow: '0 0 20px rgba(100, 255, 218, 0.5)',
                mb: 2,
              }}
            >
              {currentQuestion?.text || "Hi, I'm Survai"}
            </Typography>
          </Box>
        </Fade>
      </Box>

      {/* Input Controls */}
      <Box
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          background: 'rgba(10, 10, 46, 0.8)',
          backdropFilter: 'blur(10px)',
        }}
      >
        {showTextInput ? (
          <Box
            component="form"
            onSubmit={async (e) => {
              e.preventDefault();
              if (textMessage.trim()) {
                const message = textMessage;
                setTextMessage('');
                setShowTextInput(false);
                await handleMessage(message);
              }
            }}
            sx={{
              display: 'flex',
              gap: 2,
              position: 'relative',
            }}
          >
            <input
              type="text"
              value={textMessage}
              onChange={(e) => setTextMessage(e.target.value)}
              placeholder="Type your response..."
              style={{
                width: '100%',
                padding: '20px',
                borderRadius: '25px',
                border: '2px solid rgba(100, 255, 218, 0.3)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#ffffff',
                fontSize: '1.2rem',
                outline: 'none',
              }}
              autoFocus
            />
            <IconButton
              onClick={() => setShowTextInput(false)}
              sx={{
                color: '#64ffda',
                backgroundColor: 'rgba(100, 255, 218, 0.1)',
                width: '60px',
                height: '60px',
                '&:hover': {
                  backgroundColor: 'rgba(100, 255, 218, 0.2)',
                },
              }}
            >
              <CloseIcon sx={{ fontSize: '2rem' }} />
            </IconButton>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 3,
            }}
          >
            {/* Voice Button */}
            <Box
              onClick={handleVoiceButton}
              sx={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                backgroundColor: isRecording ? 'rgba(244, 67, 54, 0.1)' : 'rgba(100, 255, 218, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                '&::before': isRecording ? {
                  content: '""',
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  border: '3px solid #64ffda',
                  animation: `${rippleEffect} 1.5s infinite`,
                } : {},
                '&:hover': {
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <Box
                component="img"
                src="/mic-icon.svg"
                alt="Voice Input"
                sx={{
                  width: '60px',
                  height: '60px',
                  filter: 'drop-shadow(0 0 10px #64ffda)',
                }}
              />
            </Box>

            {/* Text Input Toggle */}
            <IconButton
              onClick={() => setShowTextInput(true)}
              sx={{
                color: '#64ffda',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                width: '60px',
                height: '60px',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <KeyboardIcon sx={{ fontSize: '2rem' }} />
            </IconButton>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default MobileChat;
