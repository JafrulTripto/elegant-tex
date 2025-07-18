import React from 'react';
import { Container, Box, Typography, Chip } from '@mui/material';
import { Circle as CircleIcon, Message as MessageIcon } from '@mui/icons-material';
import { MessagingProvider, useMessaging } from '../components/messaging/layout/MessagingContext';
import MessagingLayout from '../components/messaging/layout/MessagingLayout';

const MessagingPageContent: React.FC = () => {
  const { isConnected } = useMessaging();
  
  return (
    <>
      {/* Header Section - Consistent with other pages */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          mb: 2,
          pb: 1,
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <MessageIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography 
              variant="h5" 
              component="h1"
              sx={{ fontWeight: 500 }}
            >
              Messaging Center
            </Typography>
          </Box>
          <Chip
            icon={<CircleIcon />}
            label={isConnected ? 'Connected' : 'Disconnected'}
            color={isConnected ? 'success' : 'error'}
            size="small"
          />
        </Box>
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ ml: { sm: 4 } }}
        >
          Manage conversations from Facebook Messenger and WhatsApp Business
        </Typography>
      </Box>
      
      <Box sx={{ flexGrow: 1, minHeight: 0 }}>
        <MessagingLayout />
      </Box>
    </>
  );
};

const MessagingPage: React.FC = () => {
  return (
    <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ my: { xs: 2, sm: 3, md: 4 }, height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
        <MessagingProvider>
          <MessagingPageContent />
        </MessagingProvider>
      </Box>
    </Container>
  );
};

export default MessagingPage;
