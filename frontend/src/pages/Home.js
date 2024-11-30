import React from 'react';
import { Typography, Paper, Grid, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ChatIcon from '@mui/icons-material/Chat';

const Home = () => {
  const navigate = useNavigate();

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          Welcome to CDA Assistant
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Your AI-powered research and discussion companion
        </Typography>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Start a New Conversation
          </Typography>
          <Typography variant="body1" paragraph>
            Begin a new research discussion with our AI agents. They'll help you explore topics,
            analyze information, and generate insights.
          </Typography>
          <Button
            variant="contained"
            startIcon={<ChatIcon />}
            onClick={() => navigate('/chat-setup')}
          >
            Start New Chat
          </Button>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Home;
