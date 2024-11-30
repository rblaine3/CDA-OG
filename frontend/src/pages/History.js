import React from 'react';
import { Typography, Paper, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';

const History = () => {
  // This is a placeholder. You'll need to implement actual history fetching from your backend
  const mockHistory = [
    { id: 1, topic: 'Research Discussion on AI Ethics', date: '2024-02-20' },
    { id: 2, topic: 'Analysis of Climate Change Data', date: '2024-02-19' },
    { id: 3, topic: 'Discussion on Renewable Energy', date: '2024-02-18' },
  ];

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Chat History
      </Typography>
      <Paper>
        <List>
          {mockHistory.map((chat) => (
            <ListItem button key={chat.id}>
              <ListItemIcon>
                <ChatIcon />
              </ListItemIcon>
              <ListItemText
                primary={chat.topic}
                secondary={new Date(chat.date).toLocaleDateString()}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </div>
  );
};

export default History;
