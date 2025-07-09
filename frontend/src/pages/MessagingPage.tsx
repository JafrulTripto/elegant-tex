import React from 'react';
import { Container, Box, Typography, Chip } from '@mui/material';
import { Circle as CircleIcon } from '@mui/icons-material';
import { MessagingProvider, useMessaging } from '../components/messaging/layout/MessagingContext';
import MessagingLayout from '../components/messaging/layout/MessagingLayout';

const MessagingPageContent: React.FC = () => {
  const { isConnected } = useMessaging();
  
  return (
    <>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="h4" component="h1">
          Messaging Center
        </Typography>
        <Chip
          icon={<CircleIcon />}
          label={isConnected ? 'Connected' : 'Disconnected'}
          color={isConnected ? 'success' : 'error'}
          size="small"
        />
      </Box>
      
      <Box sx={{ height: 'calc(100% - 80px)' }}>
        <MessagingLayout />
      </Box>
    </>
  );
};

const MessagingPage: React.FC = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 4, height: 'calc(100vh - 100px)' }}>
      <MessagingProvider>
        <MessagingPageContent />
      </MessagingProvider>
    </Container>
  );
};

export default MessagingPage;
