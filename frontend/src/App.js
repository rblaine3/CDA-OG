import React, { useState } from 'react';
import { 
  Container, 
  TextField, 
  Button, 
  Paper, 
  Typography, 
  Box,
  CircularProgress,
  Avatar
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import axios from 'axios';

function App() {
  const [step, setStep] = useState('setup'); // setup or interview
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState('');
  const [goals, setGoals] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');

  const handleSetup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('/initialize_interview', {
        context,
        goals,
        additional_context: additionalContext
      });
      setMessages([{ text: response.data.message, isUser: false }]);
      setStep('interview');
    } catch (error) {
      console.error('Error:', error);
      alert('Error initializing interview');
    }
    setLoading(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!currentMessage.trim()) return;

    setMessages(prev => [...prev, { text: currentMessage, isUser: true }]);
    setCurrentMessage('');
    setLoading(true);

    try {
      const response = await axios.post('/chat', { message: currentMessage });
      setMessages(prev => [...prev, { text: response.data.message, isUser: false }]);
    } catch (error) {
      console.error('Error:', error);
      alert('Error sending message');
    }
    setLoading(false);
  };

  const MessageBubble = ({ message, isUser }) => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 2,
        mb: 2,
        flexDirection: isUser ? 'row-reverse' : 'row',
      }}
    >
      <Avatar 
        sx={{ 
          bgcolor: isUser ? '#2563eb' : '#64748b',
          width: 32,
          height: 32
        }}
      >
        {isUser ? <PersonIcon /> : <SmartToyIcon />}
      </Avatar>
      <Box
        sx={{
          p: 2,
          backgroundColor: isUser ? '#e3f2fd' : '#f5f5f5',
          borderRadius: 2,
          maxWidth: '80%',
          boxShadow: 1,
          '& p': { m: 0 }
        }}
      >
        <Typography>{message.text}</Typography>
      </Box>
    </Box>
  );

  if (step === 'setup') {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h4" gutterBottom align="center">
            Interview Setup
          </Typography>
          <form onSubmit={handleSetup}>
            <TextField
              fullWidth
              label="Context about the interviewee"
              multiline
              rows={4}
              value={context}
              onChange={(e) => setContext(e.target.value)}
              required
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              label="Goals for this interview"
              multiline
              rows={4}
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              required
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              label="Additional context (optional)"
              multiline
              rows={4}
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              sx={{ mb: 3 }}
            />
            <Button 
              type="submit" 
              variant="contained" 
              fullWidth 
              disabled={loading}
              sx={{ py: 1.5 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Start Interview'}
            </Button>
          </form>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h4" gutterBottom align="center">
          Interview Session
        </Typography>
        
        <Box sx={{ 
          flex: 1, 
          overflowY: 'auto', 
          mb: 3,
          px: 2,
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#888',
            borderRadius: '4px',
          },
        }}>
          {messages.map((message, index) => (
            <MessageBubble key={index} message={message} isUser={message.isUser} />
          ))}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <CircularProgress />
            </Box>
          )}
        </Box>

        <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '16px' }}>
          <TextField
            fullWidth
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={loading}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
              }
            }}
          />
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading || !currentMessage.trim()}
            sx={{ 
              px: 4,
              borderRadius: '12px',
              minWidth: '100px'
            }}
          >
            Send
          </Button>
        </form>
      </Paper>
    </Container>
  );
}

export default App;
