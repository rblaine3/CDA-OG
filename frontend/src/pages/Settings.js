import React from 'react';
import { Typography, Paper, Grid, Switch, FormControlLabel, TextField } from '@mui/material';

const Settings = () => {
  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Chat Settings
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Enable voice input"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Auto-send after voice transcription"
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              API Configuration
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="OpenAI API Key"
              type="password"
              placeholder="Enter your OpenAI API key"
            />
          </Grid>
        </Grid>
      </Paper>
    </div>
  );
};

export default Settings;
