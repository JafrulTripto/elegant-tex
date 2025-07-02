import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  TextField,
  Button,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Tooltip,
  Container,
  useTheme
} from '@mui/material';
import { spacing } from '../theme/styleUtils';
import { 
  Edit as EditIcon, 
  Save as SaveIcon, 
  Lock as LockIcon, 
  PhotoCamera,
  Person as PersonIcon 
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../contexts/ToastContext';
import userService from '../services/user.service';
import FileUpload from '../components/common/FileUpload';
import ImagePreview from '../components/common/ImagePreview';

const Profile: React.FC = () => {
  const { authState, loadUser } = useAuth();
  const { user } = authState;
  const { showToast } = useToast();
  
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [passwordError, setPasswordError] = useState<string | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleEdit = () => {
    setEditing(true);
  };
  
  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
    });
    setEditing(false);
    setError(null);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      await userService.updateUser(user.id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
      });
      
      await loadUser();
      setSuccess('Profile updated successfully');
      showToast('Profile updated successfully', 'success');
      setEditing(false);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update profile';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    
    try {
      setLoading(true);
      setPasswordError(null);
      
      await userService.changePassword(
        user!.id,
        passwordData.currentPassword,
        passwordData.newPassword
      );
      
      setSuccess('Password changed successfully');
      showToast('Password changed successfully', 'success');
      setOpenPasswordDialog(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to change password';
      setPasswordError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleProfileImageUpload = async (file: File) => {
    if (!user) return;
    
    try {
      setUploadLoading(true);
      setUploadError(null);
      
      await userService.uploadProfileImage(user.id, file);
      await loadUser(); // Reload user data to get updated profileImageId
      
      setSuccess('Profile image updated successfully');
      showToast('Profile image updated successfully', 'success');
      setShowUploadDialog(false);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to upload profile image';
      setUploadError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setUploadLoading(false);
    }
  };
  
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
  
  const theme = useTheme();

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ my: { xs: 2, sm: 3, md: 4 } }}>
        {/* Header Section - Similar to Settings Page */}
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            mb: 2,
            pb: 1,
            borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography 
              variant="h5" 
              component="h1"
              sx={{ fontWeight: 500 }}
            >
              Profile
            </Typography>
          </Box>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ ml: { sm: 4 } }}
          >
            Manage your personal information and account settings
          </Typography>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: theme.customSpacing.section }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: theme.customSpacing.section }}>
            {success}
          </Alert>
        )}
      
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          <Grid item xs={12} md={4}>
            <Card elevation={2} sx={{ borderRadius: 2, ...spacing.contentPadding(theme) }}>
              <CardHeader
                title="Profile Picture"
                subheader={user.phone}
              />
              <Divider />
              <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                <Box sx={{ position: 'relative' }}>
                  {user.profileImageId ? (
                    <ImagePreview
                      imageId={user.profileImageId}
                      alt={`${user.firstName} ${user.lastName}`}
                      width={120}
                      height={120}
                      borderRadius="50%"
                      fallbackText={user.phone.charAt(0).toUpperCase()}
                    />
                  ) : (
                    <Avatar
                      sx={{
                        width: 120,
                        height: 120,
                        fontSize: '3rem',
                        mb: 2,
                        bgcolor: 'primary.main',
                      }}
                    >
                      {user.phone.charAt(0).toUpperCase()}
                    </Avatar>
                  )}
                  <Tooltip title="Change profile picture">
                    <IconButton 
                      sx={{ 
                        position: 'absolute', 
                        bottom: 0, 
                        right: 0,
                        bgcolor: 'background.paper',
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                      onClick={() => setShowUploadDialog(true)}
                    >
                      <PhotoCamera />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Typography variant="body1" sx={{ mt: 2 }}>
                  {user.firstName} {user.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Paper
              component="form"
              onSubmit={handleSubmit}
              elevation={2}
              sx={{ borderRadius: 2, ...spacing.contentPadding(theme) }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Personal Information</Typography>
                {!editing ? (
                  <Button
                    startIcon={<EditIcon />}
                    onClick={handleEdit}
                    variant="outlined"
                    size="small"
                  >
                    Edit
                  </Button>
                ) : (
                  <Button
                    onClick={handleCancel}
                    variant="outlined"
                    size="small"
                    color="secondary"
                  >
                    Cancel
                  </Button>
                )}
              </Box>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={!editing || loading}
                    variant={editing ? 'outlined' : 'filled'}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={!editing || loading}
                    variant={editing ? 'outlined' : 'filled'}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={formData.email}
                    disabled={true}
                    variant="filled"
                    helperText={user.emailVerified ? 'Verified' : 'Not verified'}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Username"
                    value={user.phone}
                    disabled={true}
                    variant="filled"
                  />
                </Grid>
              </Grid>
              
              {editing && (
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SaveIcon />}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Box>
              )}
            </Paper>
            
            <Paper
              elevation={2}
              sx={{ borderRadius: 2, mt: theme.customSpacing.section, ...spacing.contentPadding(theme) }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Security</Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
              
              <Button
                variant="outlined"
                startIcon={<LockIcon />}
                onClick={() => setOpenPasswordDialog(true)}
              >
                Change Password
              </Button>
            </Paper>
          </Grid>
        </Grid>
        
        {/* Password Change Dialog */}
        <Dialog open={openPasswordDialog} onClose={() => setOpenPasswordDialog(false)}>
          <DialogTitle>Change Password</DialogTitle>
          <DialogContent>
            <DialogContentText>
              To change your password, please enter your current password and then your new password.
            </DialogContentText>
            
            {passwordError && (
              <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                {passwordError}
              </Alert>
            )}
            
            <TextField
              margin="dense"
              label="Current Password"
              type="password"
              fullWidth
              variant="outlined"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              required
            />
            <TextField
              margin="dense"
              label="New Password"
              type="password"
              fullWidth
              variant="outlined"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              required
            />
            <TextField
              margin="dense"
              label="Confirm New Password"
              type="password"
              fullWidth
              variant="outlined"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenPasswordDialog(false)}>Cancel</Button>
            <Button onClick={handlePasswordSubmit} disabled={loading}>
              {loading ? 'Changing...' : 'Change Password'}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Profile Image Upload Dialog */}
        <Dialog open={showUploadDialog} onClose={() => setShowUploadDialog(false)}>
          <DialogTitle>Upload Profile Picture</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Select an image file to use as your profile picture.
            </DialogContentText>
            
            {uploadError && (
              <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                {uploadError}
              </Alert>
            )}
            
            <FileUpload
              onFileSelected={handleProfileImageUpload}
              accept="image/*"
              maxSize={2 * 1024 * 1024} // 2MB
              label="Select a profile image"
              buttonText="Choose Image"
              isLoading={uploadLoading}
              error={uploadError || undefined}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowUploadDialog(false)}>Cancel</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default Profile;
