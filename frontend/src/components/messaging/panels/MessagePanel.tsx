import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  IconButton,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  useTheme,
  Divider,
  Tooltip,
  InputAdornment,
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachIcon,
  EmojiEmotions as EmojiIcon,
  Person as PersonIcon,
  Facebook as FacebookIcon,
  WhatsApp as WhatsAppIcon,
  Check as CheckIcon,
  DoneAll as DoneAllIcon,
  Schedule as ScheduleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useMessaging } from '../layout/MessagingContext';
import { MessageDTO, MessageStatus } from '../../../types/messaging';
import { format, isToday, isYesterday } from 'date-fns';

const MessagePanel: React.FC = () => {
  const theme = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  
  const {
    messages,
    selectedConversation,
    selectedAccount,
    messagesLoading,
    error,
    sendMessage,
    refreshMessages,
  } = useMessaging();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getPlatformIcon = (platform: 'FACEBOOK' | 'WHATSAPP') => {
    if (platform === 'FACEBOOK') {
      return <FacebookIcon sx={{ color: '#1877F2', fontSize: 16 }} />;
    }
    return <WhatsAppIcon sx={{ color: '#25D366', fontSize: 16 }} />;
  };

  const getMessageStatusIcon = (status: MessageStatus) => {
    switch (status) {
      case MessageStatus.SENT:
        return <CheckIcon sx={{ fontSize: 14, color: 'text.secondary' }} />;
      case MessageStatus.DELIVERED:
        return <DoneAllIcon sx={{ fontSize: 14, color: 'text.secondary' }} />;
      case MessageStatus.READ:
        return <DoneAllIcon sx={{ fontSize: 14, color: 'primary.main' }} />;
      case MessageStatus.FAILED:
        return <ErrorIcon sx={{ fontSize: 14, color: 'error.main' }} />;
      default:
        return <ScheduleIcon sx={{ fontSize: 14, color: 'text.secondary' }} />;
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, 'HH:mm')}`;
    } else {
      return format(date, 'MMM dd, HH:mm');
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || sending) return;
    
    const content = messageInput.trim();
    setMessageInput('');
    setSending(true);
    
    try {
      await sendMessage(content);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Restore message input on error
      setMessageInput(content);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const groupMessagesByDate = (messages: MessageDTO[]) => {
    const groups: { [key: string]: MessageDTO[] } = {};
    
    messages.forEach(message => {
      const date = new Date(message.timestamp);
      let dateKey: string;
      
      if (isToday(date)) {
        dateKey = 'Today';
      } else if (isYesterday(date)) {
        dateKey = 'Yesterday';
      } else {
        dateKey = format(date, 'MMMM dd, yyyy');
      }
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });
    
    return groups;
  };

  if (!selectedConversation || !selectedAccount) {
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
          No Conversation Selected
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Select a conversation to start messaging
        </Typography>
      </Box>
    );
  }

  const messageGroups = groupMessagesByDate(messages);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Avatar
          sx={{
            bgcolor: theme.palette.grey[300],
            color: theme.palette.grey[600],
            width: 40,
            height: 40,
          }}
        >
          <PersonIcon />
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              fontSize: '1.1rem',
              color: theme.palette.text.primary,
            }}
          >
            {selectedConversation.customer.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {getPlatformIcon(selectedAccount.platform)}
            <Typography variant="caption" color="text.secondary">
              {selectedConversation.customer.phone || selectedConversation.customer.email || 'No contact info'}
            </Typography>
          </Box>
        </Box>
        {selectedConversation.unreadCount > 0 && (
          <Chip
            label={`${selectedConversation.unreadCount} unread`}
            size="small"
            color="error"
            sx={{ fontSize: '0.7rem' }}
          />
        )}
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

      {/* Messages Area */}
      <Box
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          p: 1,
          backgroundColor: theme.palette.grey[50],
        }}
      >
        {messagesLoading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
            }}
          >
            <CircularProgress size={32} />
          </Box>
        ) : messages.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              textAlign: 'center',
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              No messages yet
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Start the conversation by sending a message below
            </Typography>
          </Box>
        ) : (
          <Box>
            {Object.entries(messageGroups).map(([dateKey, dateMessages]) => (
              <Box key={dateKey} sx={{ mb: 2 }}>
                {/* Date Separator */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    my: 2,
                  }}
                >
                  <Chip
                    label={dateKey}
                    size="small"
                    sx={{
                      bgcolor: theme.palette.background.paper,
                      color: 'text.secondary',
                      fontSize: '0.7rem',
                    }}
                  />
                </Box>

                {/* Messages for this date */}
                {dateMessages.map((message) => (
                  <Box
                    key={message.id}
                    sx={{
                      display: 'flex',
                      justifyContent: message.isInbound ? 'flex-start' : 'flex-end',
                      mb: 1,
                    }}
                  >
                    <Paper
                      elevation={1}
                      sx={{
                        maxWidth: '70%',
                        p: 1.5,
                        borderRadius: 2,
                        backgroundColor: message.isInbound
                          ? theme.palette.background.paper
                          : `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        color: message.isInbound
                          ? theme.palette.text.primary
                          : theme.palette.primary.contrastText,
                        ...(message.isInbound
                          ? {
                              borderBottomLeftRadius: 4,
                            }
                          : {
                              borderBottomRightRadius: 4,
                              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            }),
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: '0.9rem',
                          lineHeight: 1.4,
                          wordBreak: 'break-word',
                        }}
                      >
                        {message.content}
                      </Typography>
                      
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          gap: 0.5,
                          mt: 0.5,
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: '0.7rem',
                            opacity: 0.8,
                            color: message.isInbound
                              ? 'text.secondary'
                              : 'inherit',
                          }}
                        >
                          {formatMessageTime(message.timestamp)}
                        </Typography>
                        {!message.isInbound && (
                          <Tooltip title={message.status}>
                            {getMessageStatusIcon(message.status)}
                          </Tooltip>
                        )}
                      </Box>
                    </Paper>
                  </Box>
                ))}
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Box>
        )}
      </Box>

      {/* Message Input */}
      <Box
        sx={{
          p: 2,
          borderTop: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Type a message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={sending}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                backgroundColor: theme.palette.grey[50],
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Attach file">
                      <IconButton size="small" disabled={sending}>
                        <AttachIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Add emoji">
                      <IconButton size="small" disabled={sending}>
                        <EmojiIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </InputAdornment>
              ),
            }}
          />
          <IconButton
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || sending}
            sx={{
              bgcolor: theme.palette.primary.main,
              color: 'white',
              '&:hover': {
                bgcolor: theme.palette.primary.dark,
              },
              '&.Mui-disabled': {
                bgcolor: theme.palette.grey[300],
                color: theme.palette.grey[500],
              },
            }}
          >
            {sending ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <SendIcon fontSize="small" />
            )}
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default MessagePanel;
