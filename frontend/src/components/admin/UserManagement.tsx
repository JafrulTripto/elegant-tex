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
  FormControlLabel,
  InputAdornment,
  Pagination,
  Stack
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as VerifiedIcon,
  Cancel as UnverifiedIcon,
  Search as SearchIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import axios from 'axios';
import api from '../../services/api';
import userService from '../../services/user.service';
import { User, Role, UserFilterParams } from '../../types';
import UserFilterDialog from './UserFilterDialog';

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
  const [openFilterDialog, setOpenFilterDialog] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    phone: '',
    email: '',
    firstName: '',
    lastName: '',
    roleIds: [],
    accountVerified: true
  });
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterParams, setFilterParams] = useState<UserFilterParams>({
    search: '',
    emailVerified: undefined,
    accountVerified: undefined,
    roles: [],
    page: 0,
    size: 10,
    sortBy: 'id',
    sortDir: 'asc'
  });
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);

  // Fetch roles and initial users
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch roles
        const rolesResponse = await api.get('/roles');
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
  
  // Fetch users when filter params change
  useEffect(() => {
    fetchUsers();
  }, [filterParams]);
  
  // Fetch users with search and filter
  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch users with search and filter
      const response = await userService.searchUsers(filterParams);
      console.log('User search response:', response);
      
      // Handle both response structures (direct Page<User> or ApiResponse<Page<User>>)
      if (response.data) {
        // Use type assertion to handle potential response structure mismatch
        const responseData = response.data as any;
        
        if (responseData.content) {
          // Direct Page<User> response
          setUsers(responseData.content);
          setTotalPages(responseData.totalPages);
          setTotalElements(responseData.totalElements || 0);
        } else if (responseData.data && responseData.data.content) {
          // ApiResponse<Page<User>> response
          setUsers(responseData.data.content);
          setTotalPages(responseData.data.totalPages);
          setTotalElements(responseData.data.totalElements || 0);
        } else {
          setUsers([]);
          setTotalPages(1);
        }
      } else {
        setUsers([]);
        setTotalPages(1);
      }
      
      setLoading(false);
    } catch (err) {
      setLoading(false);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to fetch users');
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

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

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  // Handle search form submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Update filter params with search term and reset to first page
    setFilterParams(prev => ({
      ...prev,
      search: searchTerm || undefined,
      page: 0
    }));
    // No need to call fetchUsers() here as it will be triggered by the useEffect
  };
  
  // Handle page change
  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    setFilterParams(prev => ({
      ...prev,
      page: page - 1
    }));
    // No need to call fetchUsers() here as it will be triggered by the useEffect
  };
  
  // Handle page size change
  const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newSize = parseInt(event.target.value, 10);
    setFilterParams(prev => ({
      ...prev,
      size: newSize,
      page: 0 // Reset to first page when changing page size
    }));
  };
  
  // Handle sort change
  const handleSortChange = (column: string) => {
    setFilterParams(prev => {
      // If already sorting by this column, toggle direction
      if (prev.sortBy === column) {
        return {
          ...prev,
          sortDir: prev.sortDir === 'asc' ? 'desc' : 'asc',
          page: 0 // Reset to first page when changing sort
        };
      }
      // Otherwise, sort by the new column in ascending order
      return {
        ...prev,
        sortBy: column,
        sortDir: 'asc',
        page: 0 // Reset to first page when changing sort
      };
    });
  };
  
  // Render sort icon
  const renderSortIcon = (column: string) => {
    if (filterParams.sortBy !== column) {
      return null;
    }
    
    return filterParams.sortDir === 'asc' ? 
      <ArrowUpIcon fontSize="small" /> : 
      <ArrowDownIcon fontSize="small" />;
  };


  // Save user (create or update)
  const handleSaveUser = async () => {
    try {
      setLoading(true);
      
      if (editingUser) {
        // Update existing user with all necessary fields
        await api.put(`/users/${editingUser.id}`, {
          phone: formData.phone,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          roles: formData.roleIds,
          accountVerified: formData.accountVerified
        });
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
      fetchUsers();
      
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
      fetchUsers();
      
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
      fetchUsers();
      
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
      
      {/* Search and filter UI */}
      <Box sx={{ mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 9 }}>
            <form onSubmit={handleSearchSubmit}>
              <TextField
                fullWidth
                placeholder="Search by name, email, or phone"
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button type="submit" variant="contained" size="small">
                        Search
                      </Button>
                    </InputAdornment>
                  )
                }}
              />
            </form>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, mt: { xs: 1, md: 0 } }}>
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => setOpenFilterDialog(true)}
              sx={{ height: '100%' }}
            >
              Filters
              {(filterParams.emailVerified !== undefined || 
                filterParams.accountVerified !== undefined || 
                (filterParams.roles && filterParams.roles.length > 0)) && (
                <Box
                  component="span"
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    backgroundColor: 'primary.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    ml: 1
                  }}
                >
                  {(filterParams.emailVerified !== undefined ? 1 : 0) + 
                   (filterParams.accountVerified !== undefined ? 1 : 0) + 
                   (filterParams.roles && filterParams.roles.length > 0 ? 1 : 0)}
                </Box>
              )}
            </Button>
          </Grid>
        </Grid>
      </Box>
      
      {/* No pagination here - removed duplicate */}
      
      <TableContainer component={Paper}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2, position: 'relative' }}>
            <CircularProgress size={40} sx={{ position: 'absolute', top: '50%', left: '50%', marginTop: '-20px', marginLeft: '-20px', zIndex: 1 }} />
            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255, 255, 255, 0.7)', zIndex: 0 }} />
          </Box>
        )}
          <Table>
            <TableHead>
              <TableRow>
                <TableCell 
                  onClick={() => handleSortChange('firstName')}
                  sx={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    Name {renderSortIcon('firstName')}
                  </Box>
                </TableCell>
                <TableCell 
                  onClick={() => handleSortChange('phone')}
                  sx={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    Phone {renderSortIcon('phone')}
                  </Box>
                </TableCell>
                <TableCell 
                  onClick={() => handleSortChange('email')}
                  sx={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    Email {renderSortIcon('email')}
                  </Box>
                </TableCell>
                <TableCell>Roles</TableCell>
                <TableCell 
                  onClick={() => handleSortChange('accountVerified')}
                  sx={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    Status {renderSortIcon('accountVerified')}
                  </Box>
                </TableCell>
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
      
      {/* Enhanced Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, flexWrap: 'wrap' }}>
        {/* Pagination Info */}
        <Box sx={{ mb: { xs: 2, md: 0 } }}>
          {users.length > 0 && (
            <Typography variant="body2" color="text.secondary">
              Showing {(filterParams.page || 0) * (filterParams.size || 10) + 1} to {Math.min(((filterParams.page || 0) + 1) * (filterParams.size || 10), ((filterParams.page || 0) * (filterParams.size || 10)) + users.length)} of {totalElements} entries
            </Typography>
          )}
        </Box>
        
        {/* Page Size Selection */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: { xs: 2, md: 0 } }}>
          <Typography variant="body2" color="text.secondary">
            Rows per page:
          </Typography>
          <FormControl size="small" variant="outlined" sx={{ minWidth: 80 }}>
            <Select
              value={(filterParams.size || 10).toString()}
              onChange={(e) => handlePageSizeChange(e as React.ChangeEvent<HTMLInputElement>)}
              disabled={loading}
            >
              <MenuItem value="5">5</MenuItem>
              <MenuItem value="10">10</MenuItem>
              <MenuItem value="25">25</MenuItem>
              <MenuItem value="50">50</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        {/* Pagination Controls */}
        {totalPages > 0 && (
          <Stack spacing={2}>
            <Pagination
              count={totalPages}
              page={filterParams.page !== undefined ? filterParams.page + 1 : 1}
              onChange={handlePageChange}
              color="primary"
              disabled={loading}
              showFirstButton
              showLastButton
              siblingCount={1}
            />
          </Stack>
        )}
      </Box>
      
      {/* Filter Dialog */}
      <UserFilterDialog
        open={openFilterDialog}
        onClose={() => setOpenFilterDialog(false)}
        onApplyFilter={(filters) => {
          setFilterParams(prev => ({
            ...prev,
            ...filters,
            page: 0 // Reset to first page when applying filters
          }));
        }}
        roles={roles}
        currentFilters={filterParams}
        loading={loading}
      />
      
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
