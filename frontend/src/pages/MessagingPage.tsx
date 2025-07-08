import React from 'react';
import { Box, Container } from '@mui/material';
import { MessagingProvider } from '../components/messaging/layout/MessagingContext';
import MessagingLayout from '../components/messaging/layout/MessagingLayout';

const MessagingPage: React.FC = () => {
  return (
    <Container maxWidth={false} sx={{ py: 3, px: 2, height: 'calc(100vh - 120px)' }}>
      <Box sx={{ height: '100%' }}>
        <MessagingProvider>
          <MessagingLayout />
        </MessagingProvider>
      </Box>
    </Container>
  );
};

export default MessagingPage;
