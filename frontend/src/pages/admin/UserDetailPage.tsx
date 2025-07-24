import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Chip,
  Button,
  IconButton,
  Divider,
  Card,
  CardContent,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  CircularProgress,
  Container,
  useTheme,
  alpha
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Schedule as ScheduleIcon,
  CheckCircle as VerifiedIcon,
  Cancel as UnverifiedIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import { User } from '../../types';
import userService from '../../services/user.service';
import { StatusChip, ImagePreview } from '../../components/common';

const UserDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchUserDetails(parseInt(id));
    }
  }, [id]);

  const fetchUserDetails = async (userId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await userService.getUserById(userId);
      
      if (response.data) {
        const userData = response.data.data || response.data;
        setUser(userData);
      } else {
        setError('User not found');
      }
      
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError('Failed to fetch user details');
      console.error('Error fetching user details:', err);
    }
  };

  const handleBack = () => {
    navigate('/admin/users');
  };

  const handleEdit = () => {
    // Navigate back to user management with edit mode
    navigate('/admin/users', { state: { editUserId: user?.id } });
  };

  const formatLastLogin = (lastLoginTime?: string) => {
    if (!lastLoginTime) return 'Never logged in';
    
    const loginDate = new Date(lastLoginTime);
    const now = new Date();
    const diffInMs = now.getTime() - loginDate.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return loginDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !user) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error || 'User not found'}
          </Alert>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            variant="outlined"
          >
            Back to Users
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ my: { xs: 2, sm: 3, md: 4 } }}>
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={handleBack} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" component="h1" fontWeight={600}>
              User Details
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Detailed information about {user.firstName} {user.lastName}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={handleEdit}
            sx={{ height: 40 }}
          >
            Edit User
          </Button>
        </Box>

        <Grid container spacing={3}>
          {/* User Profile Card */}
          <Grid item xs={12} md={4}>
            <Card
              elevation={2}
              sx={{
                borderRadius: 2,
                transition: 'box-shadow 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.12)}`
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                {/* Enhanced User Avatar */}
                <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
                  {user.profileImageId ? (
                    <ImagePreview
                      imageId={user.profileImageId}
                      alt={`${user.firstName} ${user.lastName}`}
                      width={140}
                      height={140}
                      borderRadius="50%"
                      fallbackText={`${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase() || user.phone.charAt(0).toUpperCase()}
                    />
                  ) : (
                    <Avatar
                      sx={{
                        width: 140,
                        height: 140,
                        fontSize: '3.5rem',
                        fontWeight: 600,
                        bgcolor: theme.palette.primary.main,
                        border: `4px solid ${theme.palette.background.paper}`,
                        boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                          transform: 'scale(1.05)',
                          boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.4)}`
                        }
                      }}
                    >
                      {`${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase() || user.phone.charAt(0).toUpperCase()}
                    </Avatar>
                  )}
                </Box>
                
                <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>
                  {user.firstName} {user.lastName}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  User ID: {user.id}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <StatusChip
                    status={user.accountVerified ? 'active' : 'inactive'}
                    customLabel={user.accountVerified ? 'Active Account' : 'Inactive Account'}
                  />
                </Box>

                {/* Roles */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                  {user.roles.map((role) => (
                    <Chip
                      key={role}
                      label={role.replace('ROLE_', '')}
                      color={role === 'ROLE_ADMIN' ? 'primary' : 'default'}
                      size="small"
                      icon={role === 'ROLE_ADMIN' ? <AdminIcon /> : <PersonIcon />}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* User Information */}
          <Grid item xs={12} md={8}>
            <Card
              elevation={2}
              sx={{
                borderRadius: 2,
                transition: 'box-shadow 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.12)}`
                }
              }}
            >
              <CardContent>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                  Contact Information
                </Typography>
                
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <EmailIcon color="primary" />
                    </ListItemIcon>
                      <ListItemText
                        primary="Email Address"
                        secondary={
                          <Typography component="div">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {user.email}
                              {user.emailVerified ? (
                                <VerifiedIcon color="success" fontSize="small" />
                              ) : (
                                <UnverifiedIcon color="error" fontSize="small" />
                              )}
                              <Typography variant="caption" color="text.secondary">
                                {user.emailVerified ? 'Verified' : 'Not Verified'}
                              </Typography>
                            </Box>
                          </Typography>
                        }
                      />
                  </ListItem>
                  
                  <Divider variant="inset" component="li" />
                  
                  <ListItem>
                    <ListItemIcon>
                      <PhoneIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Phone Number"
                      secondary={user.phone}
                    />
                  </ListItem>
                </List>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                  Account Information
                </Typography>
                
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <SecurityIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Account Status"
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {user.accountVerified ? (
                            <>
                              <VerifiedIcon color="success" fontSize="small" />
                              <Typography variant="body2" color="success.main">
                                Active & Verified
                              </Typography>
                            </>
                          ) : (
                            <>
                              <UnverifiedIcon color="error" fontSize="small" />
                              <Typography variant="body2" color="error.main">
                                Inactive - Requires Activation
                              </Typography>
                            </>
                          )}
                        </Box>
                      }
                      secondaryTypographyProps={{ component: 'div' }}
                    />
                  </ListItem>
                  
                  <Divider variant="inset" component="li" />
                  
                  <ListItem>
                    <ListItemIcon>
                      <ScheduleIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Last Login"
                      secondary={formatLastLogin(user.lastLoginTime)}
                    />
                  </ListItem>
                </List>

                {user.permissions && user.permissions.length > 0 && (
                  <>
                    <Divider sx={{ my: 3 }} />
                    
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                      Permissions
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {user.permissions.map((permission) => (
                        <Chip
                          key={permission}
                          label={permission.replace(/_/g, ' ')}
                          variant="outlined"
                          size="small"
                        />
                      ))}
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default UserDetailPage;
