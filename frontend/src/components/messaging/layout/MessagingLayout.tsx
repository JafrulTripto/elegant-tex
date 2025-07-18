import React from 'react';
import {
  Box,
  Paper,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  AccountCircle as AccountIcon,
  Chat as ConversationIcon,
  Message as MessageIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { useMessaging } from './MessagingContext';
import AccountPanel from '../panels/AccountPanel';
import ConversationPanel from '../panels/ConversationPanel';
import MessagePanel from '../panels/MessagePanel';

const MessagingLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg'));
  
  const {
    activePanel,
    setActivePanel,
    selectedAccount,
    selectedConversation,
  } = useMessaging();

  // Mobile navigation
  const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
    setActivePanel(newValue as 'accounts' | 'conversations' | 'messages');
  };

  const handleBackNavigation = () => {
    if (activePanel === 'messages') {
      setActivePanel('conversations');
    } else if (activePanel === 'conversations') {
      setActivePanel('accounts');
    }
  };

  // Mobile layout
  if (isMobile) {
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Mobile Header with Back Navigation */}
        <Paper
          elevation={1}
          sx={{
            p: 1,
            display: 'flex',
            alignItems: 'center',
            borderRadius: 0,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          {activePanel !== 'accounts' && (
            <Tooltip title="Back">
              <IconButton
                onClick={handleBackNavigation}
                size="small"
                sx={{ mr: 1 }}
              >
                <BackIcon />
              </IconButton>
            </Tooltip>
          )}
          
          <Tabs
            value={activePanel}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              flexGrow: 1,
              '& .MuiTab-root': {
                minHeight: 48,
                fontSize: '0.8rem',
              },
            }}
          >
            <Tab
              value="accounts"
              icon={<AccountIcon fontSize="small" />}
              label="Accounts"
              iconPosition="start"
            />
            <Tab
              value="conversations"
              icon={<ConversationIcon fontSize="small" />}
              label="Chats"
              iconPosition="start"
              disabled={!selectedAccount}
            />
            <Tab
              value="messages"
              icon={<MessageIcon fontSize="small" />}
              label="Messages"
              iconPosition="start"
              disabled={!selectedConversation}
            />
          </Tabs>
        </Paper>

        {/* Mobile Content */}
        <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
          {activePanel === 'accounts' && <AccountPanel />}
          {activePanel === 'conversations' && <ConversationPanel />}
          {activePanel === 'messages' && <MessagePanel />}
        </Box>
      </Box>
    );
  }

  // Desktop/Tablet layout
  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        gap: 1,
        minHeight: 0, // Important for flex children to shrink
      }}
    >
      {/* Account Panel - Left */}
      <Paper
        elevation={2}
        sx={{
          width: isTablet ? 280 : 320,
          minWidth: isTablet ? 280 : 320,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: 2,
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        }}
      >
        <AccountPanel />
      </Paper>

      {/* Conversation Panel - Middle */}
      <Paper
        elevation={2}
        sx={{
          width: isTablet ? 300 : 360,
          minWidth: isTablet ? 300 : 360,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: 2,
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        }}
      >
        <ConversationPanel />
      </Paper>

      {/* Message Panel - Right */}
      <Paper
        elevation={2}
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: 2,
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        }}
      >
        <MessagePanel />
      </Paper>
    </Box>
  );
};

export default MessagingLayout;
