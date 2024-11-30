import React, { useState } from 'react';
import { Container, TextField, Button, Typography, CircularProgress, Grid, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ChatSetup = () => {
  const [context, setContext] = useState('');
  const [background, setBackground] = useState('');
  const [goals, setGoals] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSetupSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post('/initialize_interview', {
        context,
        background,
        goals,
      });
      
      if (response.status === 200) {
        // Store the initial message in sessionStorage
        sessionStorage.setItem('initialMessage', response.data.message);
        sessionStorage.setItem('setupComplete', 'true');
        // Navigate to the chat page
        navigate('/chat');
      }
    } catch (error) {
      console.error('Error:', error);
    }
    setIsLoading(false);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Setup Your Discussion
      </Typography>
      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSetupSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Context"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                multiline
                rows={4}
                placeholder="Describe the context of your discussion..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Background"
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                multiline
                rows={4}
                placeholder="Provide any relevant background information..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Goals"
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                multiline
                rows={4}
                placeholder="What are your goals for this discussion?"
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                disabled={isLoading}
                fullWidth
              >
                {isLoading ? <CircularProgress size={24} /> : 'Start Discussion'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default ChatSetup;
