import React, { useState, useEffect } from 'react';
import { Container, TextField, Button, Typography, CircularProgress, Grid, Paper, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const STORAGE_KEY = 'chatSetupPreferences';

const ChatSetup = () => {
  const [context, setContext] = useState('');
  const [background, setBackground] = useState('');
  const [goals, setGoals] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Load saved preferences on component mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem(STORAGE_KEY);
    if (savedPreferences) {
      const { context: savedContext, background: savedBackground, goals: savedGoals } = JSON.parse(savedPreferences);
      setContext(savedContext || '');
      setBackground(savedBackground || '');
      setGoals(savedGoals || '');
    }
  }, []);

  // Save preferences whenever they change
  useEffect(() => {
    if (context || background || goals) {
      const preferences = {
        context,
        background,
        goals,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    }
  }, [context, background, goals]);

  const handleSetupSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Save the final version of preferences
      const preferences = {
        context,
        background,
        goals,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));

      const response = await axios.post('/initialize_interview', {
        context,
        background,
        goals,
      });
      
      if (response.status === 200) {
        // Store the initial message in sessionStorage
        sessionStorage.setItem('initialMessage', response.data.message);
        sessionStorage.setItem('setupComplete', 'true');
        
        // Check if device is mobile
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        navigate(isMobile ? '/mobile-chat' : '/chat');
      }
    } catch (error) {
      console.error('Error:', error);
    }
    setIsLoading(false);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ 
            fontWeight: 500,
            color: 'primary.main',
            mb: 3
          }}
        >
          Setup Your Discussion
        </Typography>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4,
            backgroundColor: 'background.paper',
            borderRadius: 2
          }}
        >
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
                  required
                  placeholder="Describe the context of your discussion..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                  }}
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
                  required
                  placeholder="Provide any relevant background information..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                  }}
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
                  required
                  placeholder="What are your goals for this discussion?"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/')}
                    sx={{
                      px: 4,
                      '&:hover': {
                        backgroundColor: 'primary.light',
                        color: 'white',
                      },
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isLoading || !context.trim() || !background.trim() || !goals.trim()}
                    sx={{
                      px: 4,
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                    }}
                  >
                    {isLoading ? <CircularProgress size={24} /> : 'Start Discussion'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default ChatSetup;
