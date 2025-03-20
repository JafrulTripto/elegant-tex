import React from 'react';
import { Button, Box, Typography, Paper, Grid } from '@mui/material';
import { useToast } from '../../contexts/ToastContext';

/**
 * Example component demonstrating how to use toast notifications
 * This component can be used as a reference for implementing toast notifications
 * in other parts of the application.
 */
const ToastExample: React.FC = () => {
  const { showToast } = useToast();

  const handleSuccessToast = () => {
    showToast('This is a success message!', 'success');
  };

  const handleErrorToast = () => {
    showToast('This is an error message!', 'error');
  };

  const handleInfoToast = () => {
    showToast('This is an info message!', 'info');
  };

  const handleWarningToast = () => {
    showToast('This is a warning message!', 'warning');
  };

  const handleDefaultToast = () => {
    showToast('This is a default message!');
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
      <Typography variant="h5" gutterBottom>
        Toast Notification Examples
      </Typography>
      
      <Typography variant="body1" paragraph>
        Click the buttons below to see different types of toast notifications.
      </Typography>
      
      <Box sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          <Grid item>
            <Button 
              variant="contained" 
              color="success" 
              onClick={handleSuccessToast}
            >
              Success Toast
            </Button>
          </Grid>
          
          <Grid item>
            <Button 
              variant="contained" 
              color="error" 
              onClick={handleErrorToast}
            >
              Error Toast
            </Button>
          </Grid>
          
          <Grid item>
            <Button 
              variant="contained" 
              color="info" 
              onClick={handleInfoToast}
            >
              Info Toast
            </Button>
          </Grid>
          
          <Grid item>
            <Button 
              variant="contained" 
              color="warning" 
              onClick={handleWarningToast}
            >
              Warning Toast
            </Button>
          </Grid>
          
          <Grid item>
            <Button 
              variant="contained" 
              onClick={handleDefaultToast}
            >
              Default Toast
            </Button>
          </Grid>
        </Grid>
      </Box>
      
      <Typography variant="body2" sx={{ mt: 3 }}>
        To use toast notifications in your component:
      </Typography>
      
      <Box 
        component="pre" 
        sx={{ 
          bgcolor: 'background.paper', 
          p: 2, 
          mt: 1, 
          borderRadius: 1,
          overflow: 'auto',
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        {`
// 1. Import the useToast hook
import { useToast } from '../contexts/ToastContext';

// 2. Use the hook in your component
const YourComponent = () => {
  const { showToast } = useToast();
  
  // 3. Call showToast with a message and variant
  const handleAction = () => {
    // Do something...
    showToast('Action completed successfully!', 'success');
  };
  
  // Available variants: 'default', 'success', 'error', 'warning', 'info'
  return (
    <Button onClick={handleAction}>
      Perform Action
    </Button>
  );
};
        `}
      </Box>
    </Paper>
  );
};

export default ToastExample;
