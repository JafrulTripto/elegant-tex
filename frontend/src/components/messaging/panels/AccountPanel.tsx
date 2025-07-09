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
  Button,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Chip,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Facebook as FacebookIcon,
  WhatsApp as WhatsAppIcon,
  Refresh as RefreshIcon,
  Circle as OnlineIcon,
} from '@mui/icons-material';
import { useMessaging } from '../layout/MessagingContext';
import { MessagingAccountDTO } from '../../../types/messaging';
import EnhancedAccountSetupDialog from '../dialogs/EnhancedAccountSetupDialog';

const AccountPanel: React.FC = () => {
  const theme = useTheme();
  const [setupDialogOpen, setSetupDialogOpen] = useState(false);
  
  const {
    accounts,
    selectedAccount,
    setSelectedAccount,
    accountsLoading,
    error,
    refreshAccounts,
  } = useMessaging();

  const getPlatformIcon = (platform: 'FACEBOOK' | 'WHATSAPP') => {
    if (platform === 'FACEBOOK') {
      return <FacebookIcon sx={{ color: '#1877F2' }} />;
    }
    return <WhatsAppIcon sx={{ color: '#25D366' }} />;
  };

  const getPlatformColor = (platform: 'FACEBOOK' | 'WHATSAPP') => {
    return platform === 'FACEBOOK' ? '#1877F2' : '#25D366';
  };

  const handleAccountSelect = (account: MessagingAccountDTO) => {
    setSelectedAccount(account);
  };

  const handleAddAccount = () => {
    setSetupDialogOpen(true);
  };

  const handleSetupComplete = () => {
    setSetupDialogOpen(false);
    refreshAccounts();
  };

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
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            fontSize: '1.1rem',
            color: theme.palette.primary.main,
          }}
        >
          Messaging Accounts
        </Typography>
        <Box>
          <Tooltip title="Refresh">
            <IconButton
              onClick={refreshAccounts}
              size="small"
              disabled={accountsLoading}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Add Account">
            <IconButton
              onClick={handleAddAccount}
              size="small"
              sx={{ ml: 0.5 }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
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

      {/* Account List */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {accountsLoading ? (
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
        ) : accounts.length === 0 ? (
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
              sx={{ mb: 2 }}
            >
              No messaging accounts configured
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddAccount}
              size="small"
              sx={{
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                '&:hover': {
                  background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                },
              }}
            >
              Add Account
            </Button>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {accounts.map((account) => (
              <ListItem key={account.id} disablePadding>
                <ListItemButton
                  selected={selectedAccount?.id === account.id}
                  onClick={() => handleAccountSelect(account)}
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
                        account.isActive ? (
                          <OnlineIcon
                            sx={{
                              color: '#4caf50',
                              fontSize: 12,
                            }}
                          />
                        ) : null
                      }
                    >
                      <Avatar
                        sx={{
                          bgcolor: getPlatformColor(account.platform),
                          width: 40,
                          height: 40,
                        }}
                      >
                        {getPlatformIcon(account.platform)}
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 500,
                            fontSize: '0.9rem',
                            flexGrow: 1,
                          }}
                        >
                          {account.accountName}
                        </Typography>
                        {account.unreadMessageCount && account.unreadMessageCount > 0 && (
                          <Chip
                            label={account.unreadMessageCount}
                            size="small"
                            sx={{
                              bgcolor: theme.palette.error.main,
                              color: 'white',
                              height: 20,
                              fontSize: '0.7rem',
                              '& .MuiChip-label': {
                                px: 0.5,
                              },
                            }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Chip
                          label={account.platform}
                          size="small"
                          sx={{
                            bgcolor: `${getPlatformColor(account.platform)}20`,
                            color: getPlatformColor(account.platform),
                            height: 18,
                            fontSize: '0.65rem',
                            fontWeight: 500,
                            '& .MuiChip-label': {
                              px: 0.5,
                            },
                          }}
                        />
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontSize: '0.7rem' }}
                        >
                          {account.isActive ? 'Active' : 'Inactive'}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      {/* Footer */}
      <Box
        sx={{
          p: 1.5,
          borderTop: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAddAccount}
          size="small"
          sx={{
            fontSize: '0.8rem',
            py: 0.5,
            px: 1.5,
          }}
        >
          Add Account
        </Button>
      </Box>

      {/* Setup Dialog */}
      <EnhancedAccountSetupDialog
        open={setupDialogOpen}
        onClose={() => setSetupDialogOpen(false)}
        onSuccess={handleSetupComplete}
      />
    </Box>
  );
};

export default AccountPanel;
