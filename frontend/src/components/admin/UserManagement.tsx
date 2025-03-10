import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  SelectChangeEvent,
  CircularProgress,
  Alert,
  Snackbar,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as VerifiedIcon,
  Cancel as UnverifiedIcon
} from '@mui/icons-material';
import axios from 'axios';
import api from '../../services/api';
import { User, Role } from '../../types';

interface UserFormData {
  phone: string;
  email: string;
  firstName: string;
  lastName: string;
  roleIds: string[];
  accountVerified: boolean;
  password?: string;
}

const UserManagement: React.FC = () => {
  // State
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    phone: '',
    email: '',
    firstName: '',
    lastName: '',
    roleIds: [],
    accountVerified: true
  });

  // Fetch users and roles
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch users
        const usersResponse = await api.get('/users');
        setUsers(Array.isArray(usersResponse.data) ? usersResponse.data : []);
        
        // Fetch roles
        const rolesResponse = await api.get('/api/roles');
        setRoles(Array.isArray(rolesResponse.data) ? rolesResponse.data : []);
        
        setLoading(false);
      } catch (err) {
        setLoading(false);
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || 'Failed to fetch data');
        } else {
          setError('An unexpected error occurred');
        }
      }
    };
    
    fetchData();
  }, []);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle switch change
  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  // Handle role selection
  const handleRoleChange = (event: SelectChangeEvent<string[]>) => {
    const { value } = event.target;
    setFormData(prev => ({
      ...prev,
      roleIds: typeof value === 'string' ? [value] : value
    }));
  };

  // Open dialog for creating a new user
  const handleOpenCreateDialog = () => {
    setEditingUser(null);
    setFormData({
      phone: '',
      email: '',
      firstName: '',
      lastName: '',
      roleIds: [],
      accountVerified: true,
      password: ''
    });
    setOpenDialog(true);
  };

  // Open dialog for editing a user
  const handleOpenEditDialog = (user: User) => {
    setEditingUser(user);
    setFormData({
      phone: user.phone,
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      roleIds: user.roles,
      accountVerified: user.accountVerified || false
    });
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Save user (create or update)
  const handleSaveUser = async () => {
    try {
      setLoading(true);
      
      if (editingUser) {
        // Update existing user
        await api.put(`/users/${editingUser.id}`, formData);
        setSuccess('User updated successfully');
      } else {
        // Create new user using the auth/register endpoint
        await api.post('/auth/register', {
          phone: formData.phone,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          roles: formData.roleIds,
          password: formData.password
        });
        setSuccess('User created successfully');
      }
      
      // Refresh users
      const usersResponse = await api.get('/users');
      setUsers(Array.isArray(usersResponse.data) ? usersResponse.data : []);
      
      setLoading(false);
      setOpenDialog(false);
    } catch (err) {
      setLoading(false);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to save user');
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  // Delete user
  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }
    
    try {
      setLoading(true);
      
      await api.delete(`/users/${userId}`);
      
      // Refresh users
      const usersResponse = await api.get('/users');
      setUsers(Array.isArray(usersResponse.data) ? usersResponse.data : []);
      
      setLoading(false);
      setSuccess('User deleted successfully');
    } catch (err) {
      setLoading(false);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to delete user');
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  // Verify user email
  const handleVerifyUser = async (userId: number) => {
    try {
      setLoading(true);
      
      await api.post(`/users/${userId}/verify`);
      
      // Refresh users
      const usersResponse = await api.get('/users');
      setUsers(Array.isArray(usersResponse.data) ? usersResponse.data : []);
      
      setLoading(false);
      setSuccess('User verified successfully');
    } catch (err) {
      setLoading(false);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to verify user');
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSuccess(null);
    setError(null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">User Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
        >
          Add User
        </Button>
      </Box>
      
      {loading && users.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Roles</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {user.email}
                      {user.emailVerified ? (
                        <VerifiedIcon color="success" fontSize="small" />
                      ) : (
                        <UnverifiedIcon color="error" fontSize="small" />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {user.roles.map((role) => (
                      <Chip
                        key={role}
                        label={role.replace('ROLE_', '')}
                        size="small"
                        color={role === 'ROLE_ADMIN' ? 'primary' : 'default'}
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.accountVerified ? 'Active' : 'Inactive'}
                      color={user.accountVerified ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenEditDialog(user)}
                    >
                      <EditIcon />
                    </IconButton>
                    {!user.emailVerified && (
                      <IconButton
                        color="success"
                        onClick={() => handleVerifyUser(user.id)}
                      >
                        <VerifiedIcon />
                      </IconButton>
                    )}
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* User Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingUser ? 'Edit User' : 'Create User'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              name="phone"
              label="Phone"
              fullWidth
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
            
            <TextField
              name="email"
              label="Email"
              type="email"
              fullWidth
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                name="firstName"
                label="First Name"
                fullWidth
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
              
              <TextField
                name="lastName"
                label="Last Name"
                fullWidth
                value={formData.lastName}
                onChange={handleInputChange}
              />
            </Box>
            
            <FormControl fullWidth>
              <InputLabel id="roles-label">Roles</InputLabel>
              <Select
                labelId="roles-label"
                multiple
                value={formData.roleIds}
                onChange={handleRoleChange}
                input={<OutlinedInput label="Roles" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value.replace('ROLE_', '')} />
                    ))}
                  </Box>
                )}
              >
                {roles.map((role) => (
                  <MenuItem key={role.id} value={role.name}>
                    {role.name.replace('ROLE_', '')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {!editingUser && (
              <TextField
                name="password"
                label="Password"
                type="password"
                fullWidth
                value={formData.password || ''}
                onChange={handleInputChange}
                required={!editingUser}
                helperText="Minimum 6 characters"
              />
            )}
            
            <FormControlLabel
              control={
                <Switch
                  checked={formData.accountVerified}
                  onChange={handleSwitchChange}
                  name="accountVerified"
                  color="primary"
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSaveUser}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbars */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
      
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserManagement;
