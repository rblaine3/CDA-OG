import React, { useState, useEffect } from 'react';
import { Container, TextField, Button, Box, Typography, CircularProgress, Paper, Divider, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import { useReactMediaRecorder } from 'react-media-recorder';
import axios from 'axios';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if setup is complete
    const setupComplete = sessionStorage.getItem('setupComplete');
    if (!setupComplete) {
      navigate('/chat-setup');
      return;
    }

    // Get initial message if it exists
    const initialMessage = sessionStorage.getItem('initialMessage');
    if (initialMessage) {
      setMessages([{ text: initialMessage, isUser: false }]);
      sessionStorage.removeItem('initialMessage'); // Clear it after using
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
          const messageEvent = {
            preventDefault: () => {},
          };
          handleMessageSubmit(messageEvent);
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
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        startRecording();
        setIsRecording(true);
      } catch (err) {
        console.error('Error accessing microphone:', err);
        alert('Unable to access microphone. Please check your browser permissions.');
      }
    }
  };

  return (
    <Container>
      <Paper sx={{ p: 2, height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ flexGrow: 1, overflow: 'auto', mb: 2 }}>
          {messages.map((message, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                justifyContent: message.isUser ? 'flex-end' : 'flex-start',
                mb: 2,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  gap: 1,
                  maxWidth: '70%',
                }}
              >
                {!message.isUser && (
                  <SmartToyIcon color="primary" />
                )}
                <Paper
                  sx={{
                    p: 2,
                    backgroundColor: message.isUser ? 'primary.main' : 'grey.100',
                    color: message.isUser ? 'white' : 'text.primary',
                  }}
                >
                  <Typography>{message.text}</Typography>
                </Paper>
                {message.isUser && (
                  <PersonIcon color="primary" />
                )}
              </Box>
            </Box>
          ))}
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <CircularProgress />
            </Box>
          )}
        </Box>
        
        <Divider />
        
        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleMessageSubmit(e)}
            placeholder="Type your message..."
            disabled={isLoading}
          />
          <IconButton
            color={isRecording ? "error" : "primary"}
            onClick={handleVoiceButton}
            disabled={isLoading}
          >
            {isRecording ? <StopIcon /> : <MicIcon />}
          </IconButton>
          <Button
            variant="contained"
            onClick={handleMessageSubmit}
            disabled={isLoading || !currentMessage.trim()}
            endIcon={<SendIcon />}
          >
            Send
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Chat;
