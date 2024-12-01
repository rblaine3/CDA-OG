import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

const MessageContainer = styled(Paper)(({ theme, variant }) => ({
  padding: theme.spacing(2, 3),
  maxWidth: '80%',
  borderRadius: '12px',
  marginBottom: theme.spacing(2),
  boxShadow: 'none',
  ...(variant === 'user' ? {
    marginLeft: 'auto',
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrast,
  } : {
    marginRight: 'auto',
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.neutral[300]}`,
  })
}));

const MessageTimestamp = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: theme.typography.caption.fontSize,
  marginTop: theme.spacing(1)
}));

export const Message = ({ content, timestamp, variant = 'assistant', ...props }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <MessageContainer variant={variant} elevation={0} {...props}>
        <Typography variant="body1">
          {content}
        </Typography>
        {timestamp && (
          <MessageTimestamp>
            {new Date(timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit'
            })}
          </MessageTimestamp>
        )}
      </MessageContainer>
    </Box>
  );
};
