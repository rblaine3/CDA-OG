import React, { useState } from 'react';
import { Container, TextField, Button, Box, Typography, CircularProgress, Grid, Paper, Divider } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import axios from 'axios';
import './App.css';

function App() {
  const [context, setContext] = useState('');
  const [background, setBackground] = useState('');
  const [goals, setGoals] = useState('');
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);

  const handleSetupSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post('/initialize_interview', {
        context,
        background,
        goals,
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 200) {
        setMessages([{ text: response.data.message, isUser: false }]);
        setSetupComplete(true);
      }
    } catch (error) {
      console.error('Error:', error);
    }
    setIsLoading(false);
  };

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
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 200) {
        setMessages(prev => [...prev, { text: response.data.message, isUser: false }]);
      }
    } catch (error) {
      console.error('Error:', error);
    }
    setIsLoading(false);
  };

  return (
    <Container className="container">
      <Grid container spacing={3}>
        {/* Left side - Setup Form */}
        <Grid item xs={12} md={4}>
          <Paper className="setup-panel">
            <Typography variant="h5" className="panel-title">
              Interview Setup
            </Typography>
            <Box component="form" onSubmit={handleSetupSubmit}>
              <TextField
                label="Context"
                multiline
                rows={4}
                value={context}
                onChange={(e) => setContext(e.target.value)}
                fullWidth
                required
                margin="normal"
                placeholder="Describe the context of this interview"
                disabled={setupComplete}
              />
              
              <TextField
                label="Personal Background"
                multiline
                rows={3}
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                fullWidth
                margin="normal"
                placeholder="Share relevant background information"
                disabled={setupComplete}
              />
              
              <TextField
                label="Goals"
                multiline
                rows={3}
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                fullWidth
                required
                margin="normal"
                placeholder="What do you hope to achieve?"
                disabled={setupComplete}
              />
              
              {!setupComplete && (
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  className="submit-button"
                  disabled={isLoading}
                >
                  {isLoading ? <CircularProgress size={24} /> : 'Start Interview'}
                </Button>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Right side - Chat Interface */}
        <Grid item xs={12} md={8}>
          <Paper className="chat-panel">
            <Typography variant="h5" className="panel-title">
              Interview Session
            </Typography>
            <Box className="messages">
              {messages.map((message, index) => (
                <Box key={index} className={`message-container ${message.isUser ? 'user' : ''}`}>
                  <Box className="avatar">
                    {message.isUser ? <PersonIcon /> : <SmartToyIcon />}
                  </Box>
                  <Box className="message-bubble">
                    {message.text}
                  </Box>
                </Box>
              ))}
            </Box>
            
            <Divider className="chat-divider" />
            
            <Box component="form" onSubmit={handleMessageSubmit} className="input-form">
              <TextField
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="Type your message..."
                fullWidth
                disabled={!setupComplete || isLoading}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                className="send-button"
                disabled={!setupComplete || isLoading || !currentMessage.trim()}
                endIcon={isLoading ? <CircularProgress size={20} /> : <SendIcon />}
              >
                Send
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default App;
