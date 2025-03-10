import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Person as PersonIcon,
  Security as SecurityIcon,
  Email as EmailIcon,
  VerifiedUser as VerifiedUserIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';

const Dashboard: React.FC = () => {
  const { authState } = useAuth();
  const { user } = authState;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  console.log(authState);
  
  useEffect(() => {
    // You could fetch additional dashboard data here
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Example: await dashboardService.getData();
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (!user) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {/* Welcome Card */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom>
              Welcome, {user.firstName || user.phone}!
            </Typography>
            <Typography variant="body1">
              This is your personal dashboard where you can manage your account and access various features.
            </Typography>
          </Paper>
        </Grid>
        
        {/* User Profile Card */}
        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  {user.phone.charAt(0).toUpperCase()}
                </Avatar>
              }
              title="Your Profile"
              subheader="Personal Information"
            />
            <Divider />
            <CardContent>
              <List>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Username"
                    secondary={user.phone}
                  />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <EmailIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Email"
                    secondary={user.email}
                  />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <VerifiedUserIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Email Verified"
                    secondary={user.emailVerified ? 'Yes' : 'No'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <SecurityIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Roles"
                    secondary={user.roles.map(role => role.replace('ROLE_', '')).join(', ')}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Quick Stats Card */}
        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardHeader
              title="Account Status"
              subheader="Overview of your account"
            />
            <Divider />
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Account Status
                  </Typography>
                  <Typography variant="body2">
                    {user.enabled ? 'Active' : 'Inactive'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Email Verification
                  </Typography>
                  <Typography variant="body2">
                    {user.emailVerified 
                      ? 'Your email has been verified.' 
                      : 'Please verify your email to access all features.'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Account Type
                  </Typography>
                  <Typography variant="body2">
                    {user.roles.some(role => role === 'ROLE_ADMIN') 
                      ? 'Administrator' 
                      : 'Standard User'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
