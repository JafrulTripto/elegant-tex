import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Badge,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Chip,
  TextField,
  InputAdornment,
  useTheme,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Facebook as FacebookIcon,
  WhatsApp as WhatsAppIcon,
} from '@mui/icons-material';
import { useMessaging } from '../layout/MessagingContext';
import { ConversationDTO } from '../../../types/messaging';
import { format, isToday, isYesterday } from 'date-fns';

const ConversationPanel: React.FC = () => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  
  const {
    conversations,
    selectedConversation,
    setSelectedConversation,
    conversationsLoading,
    selectedAccount,
    error,
    refreshConversations,
  } = useMessaging();
  

  const getPlatformIcon = (platform: 'FACEBOOK' | 'WHATSAPP') => {
    if (platform === 'FACEBOOK') {
      return <FacebookIcon sx={{ color: '#1877F2', fontSize: 16 }} />;
    }
    return <WhatsAppIcon sx={{ color: '#25D366', fontSize: 16 }} />;
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM dd');
    }
  };

  const truncateMessage = (message: string, maxLength: number = 50) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  const handleConversationSelect = (conversation: ConversationDTO) => {
    setSelectedConversation(conversation);
  };

  const filteredConversations = conversations.filter(conversation =>
    conversation.conversationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conversation.customer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!selectedAccount) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          textAlign: 'center',
        }}
      >
        <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
          No Account Selected
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Please select a messaging account to view conversations
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getPlatformIcon(selectedAccount.platform)}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              fontSize: '1.1rem',
              color: theme.palette.primary.main,
            }}
          >
            Conversations
          </Typography>
        </Box>
        <Box>
          <Tooltip title="Refresh">
            <IconButton
              onClick={refreshConversations}
              size="small"
              disabled={conversationsLoading}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Search */}
      <Box sx={{ p: 2, pb: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
        />
      </Box>

      {/* Account Info */}
      <Box sx={{ px: 2, pb: 1 }}>
        <Typography variant="caption" color="text.secondary">
          {selectedAccount.accountName} • {conversations.length} conversations
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert
          severity="error"
          sx={{
            m: 1,
            py: 0.5,
            '& .MuiAlert-message': {
              fontSize: '0.8rem',
            },
          }}
        >
          {error}
        </Alert>
      )}

      {/* Conversation List */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {conversationsLoading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 200,
            }}
          >
            <CircularProgress size={32} />
          </Box>
        ) : filteredConversations.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: 200,
              px: 2,
              textAlign: 'center',
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 1 }}
            >
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {searchQuery 
                ? 'Try adjusting your search terms'
                : 'Conversations will appear here when customers message you'
              }
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {filteredConversations.map((conversation, index) => (
              <React.Fragment key={conversation.id}>
                <ListItem disablePadding>
                  <ListItemButton
                    selected={selectedConversation?.id === conversation.id}
                    onClick={() => handleConversationSelect(conversation)}
                    sx={{
                      py: 1.5,
                      px: 2,
                      '&.Mui-selected': {
                        backgroundColor: `${theme.palette.primary.main}15`,
                        borderRight: `3px solid ${theme.palette.primary.main}`,
                        '&:hover': {
                          backgroundColor: `${theme.palette.primary.main}20`,
                        },
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        badgeContent={
                          conversation.unreadCount > 0 ? (
                            <Chip
                              label={conversation.unreadCount}
                              size="small"
                              sx={{
                                bgcolor: theme.palette.error.main,
                                color: 'white',
                                height: 18,
                                fontSize: '0.65rem',
                                '& .MuiChip-label': {
                                  px: 0.5,
                                },
                              }}
                            />
                          ) : null
                        }
                      >
                        <Avatar
                          sx={{
                            bgcolor: theme.palette.grey[300],
                            color: theme.palette.grey[600],
                            width: 40,
                            height: 40,
                          }}
                        >
                          <PersonIcon fontSize="small" />
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: conversation.unreadCount > 0 ? 600 : 500,
                              fontSize: '0.9rem',
                              color: conversation.unreadCount > 0 ? 'text.primary' : 'text.primary',
                            }}
                          >
                            {conversation.customer.name}
                          </Typography>
                          {conversation.lastMessageAt && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontSize: '0.7rem' }}
                            >
                              {formatMessageTime(conversation.lastMessageAt)}
                            </Typography>
                          )}
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 0.5 }}>
                          {conversation.lastMessage && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                fontSize: '0.8rem',
                                fontWeight: conversation.unreadCount > 0 ? 500 : 400,
                                opacity: conversation.unreadCount > 0 ? 1 : 0.8,
                              }}
                            >
                              {conversation.lastMessage.isInbound ? '' : 'You: '}
                              {truncateMessage(conversation.lastMessage.content)}
                            </Typography>
                          )}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            {getPlatformIcon(selectedAccount.platform)}
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontSize: '0.65rem' }}
                            >
                              {conversation.customer.phone || conversation.customer.email || 'No contact info'}
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>
                {index < filteredConversations.length - 1 && (
                  <Divider variant="inset" component="li" />
                )}
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>

      {/* Footer */}
      {filteredConversations.length > 0 && (
        <Box
          sx={{
            p: 1.5,
            borderTop: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {filteredConversations.length} of {conversations.length} conversations
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ConversationPanel;
