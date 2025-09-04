import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  IconButton,
  Alert,
  CircularProgress,
  useTheme,
  Container,
  SelectChangeEvent,
} from '@mui/material';
import { 
  Add as AddIcon, 
  Close as CloseIcon, 
  Delete as DeleteIcon,
  ManageAccounts as UserManagementIcon 
} from '@mui/icons-material';
import axios from 'axios';
import api from '../../services/api';
import userService from '../../services/user.service';
import { User, Role } from '../../types';
import { useUserFilters, UserFilterParams } from '../../hooks/useUserFilters';
import { FilterChips, ConfirmationDialog, Pagination } from '../common';
import UserTable from './UserTable';
import UserForm from './UserForm';
import UserSearch from './UserSearch';
import UserFilterDialog from './UserFilterDialog';
import {useToast} from "../../contexts/ToastContext.tsx";

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
  const theme = useTheme();
  const { showToast } = useToast();

  // State
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Dialog state
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
  
  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);
  
  // Pagination state
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);

  // Use the user filters hook
  const {
    filterParams,
    searchTerm,
    setSearchTerm,
    handleSearchSubmit,
    handlePageChange,
    handlePageSizeChange,
    handleSortChange,
    handleFilterApply,
    handleRemoveFilter,
    handleClearAllFilters,
    activeFilterChips,
    activeFilterCount
  } = useUserFilters({
    page: 0,
    size: 10,
    sortBy: 'id',
    sortDir: 'asc'
  });

  // Fetch roles and initial users
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const rolesResponse = await api.get('/roles');
        setRoles(Array.isArray(rolesResponse.data) ? rolesResponse.data : []);
      } catch (err) {
        console.error('Failed to fetch roles:', err);
        setError('Failed to fetch roles. Please try again.');
      }
    };
    
    fetchRoles();
  }, []);
  
  // Fetch users when filter params change
  useEffect(() => {
    fetchUsers();
  }, [filterParams]);
  
  // Fetch users with search and filter
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await userService.searchUsers(filterParams);
      
      if (response.data) {
        const responseData = response.data as any;
        
        if (responseData.content) {
          setUsers(responseData.content);
          setTotalPages(responseData.totalPages);
          setTotalElements(responseData.totalElements || 0);
        } else if (responseData.data && responseData.data.content) {
          setUsers(responseData.data.content);
          setTotalPages(responseData.data.totalPages);
          setTotalElements(responseData.data.totalElements || 0);
        } else {
          setUsers([]);
          setTotalPages(1);
          setTotalElements(0);
        }
      } else {
        setUsers([]);
        setTotalPages(1);
        setTotalElements(0);
      }
      
      setLoading(false);
    } catch (err) {
      setLoading(false);
      if (axios.isAxiosError(err)) {
        setError(err.message || 'Failed to delete role');
      } else {
        const errorMessage = (err as Error)?.message ?? 'Failed to delete role';
        setError(errorMessage);
      }
    }
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

  // Handle form data change
  const handleFormDataChange = (data: UserFormData) => {
    setFormData(data);
  };

  // Save user (create or update)
  const handleSaveUser = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (editingUser) {
        // Update existing user
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
        // Create new user
        await api.post('/auth/register', {
          phone: formData.phone,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          roles: formData.roleIds,
          password: formData.password
        });
        showToast('User created successfully', 'success');
      }
      
      // Refresh users
      fetchUsers();
      
      setLoading(false);
      setOpenDialog(false);
    } catch (err) {
      setLoading(false);
      if (axios.isAxiosError(err)) {
        showToast(err.response?.data?.message || 'Failed to save user', 'error');
      } else {
        showToast('An unexpected error occurred', 'error');
      }
    }
  };

  // Open delete confirmation dialog
  const handleDeleteClick = (userId: number) => {
    setUserToDelete(userId);
    setDeleteDialogOpen(true);
  };

  // Delete user
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    
    try {
      setDeleting(true);
      setError(null);
      
      await api.delete(`/users/${userToDelete}`);
      
      // Refresh users
      fetchUsers();
      
      setDeleting(false);
      setDeleteDialogOpen(false);
      setSuccess('User deleted successfully');
    } catch (err) {
      setDeleting(false);
      setDeleteDialogOpen(false);
      if (axios.isAxiosError(err)) {
        setError(err.message || 'Failed to delete role');
      } else {
        const errorMessage = (err as Error)?.message ?? 'Failed to delete role';
        setError(errorMessage);
      }
    }
  };

  // Verify user email
  const handleVerifyUser = async (userId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      await api.post(`/users/${userId}/verify`);
      
      // Refresh users
      fetchUsers();
      
      setLoading(false);
      setSuccess('User account activated successfully');
    } catch (err) {
      setLoading(false);
      if (axios.isAxiosError(err)) {
        setError(err.message || 'Failed to activate user account');
      } else {
        const errorMessage = (err as Error)?.message ?? 'Failed to activate user account';
        setError(errorMessage);
      }
    }
  };

  // Handle view user details
  const handleViewUserDetails = (userId: number) => {
    // Navigate to user detail page
    window.location.href = `/admin/users/${userId}`;
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSuccess(null);
    setError(null);
  };

  // Adapter for page size change
  const handlePageSizeChangeAdapter = (event: SelectChangeEvent) => {
    // Convert SelectChangeEvent to the format expected by handlePageSizeChange
    const adaptedEvent = {
      target: { value: event.target.value }
    } as React.ChangeEvent<{ value: unknown }>;
    
    handlePageSizeChange(adaptedEvent);
  };

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
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <UserManagementIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography 
                variant="h5" 
                component="h1"
                sx={{ fontWeight: 500 }}
              >
                Users
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenCreateDialog}
              sx={{ 
                height: { xs: 36, sm: 40 },
                px: { xs: 1.5, sm: 2 }
              }}
            >
              Add User
            </Button>
          </Box>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ ml: { sm: 4 } }}
          >
            Manage user accounts, roles, and permissions
          </Typography>
        </Box>
        
        {/* Error and Success Alerts */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: theme.customSpacing.section }}
            onClose={handleCloseSnackbar}
          >
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert 
            severity="success" 
            sx={{ mb: theme.customSpacing.section }}
            onClose={handleCloseSnackbar}
          >
            {success}
          </Alert>
        )}
        
        {/* Search and Filter */}
        <Box sx={{ mb: theme.customSpacing.section }}>
          <UserSearch
            searchTerm={searchTerm}
            onSearchChange={(e) => setSearchTerm(e.target.value)}
            onSearchSubmit={handleSearchSubmit}
            onFilterClick={() => setOpenFilterDialog(true)}
            activeFilterCount={activeFilterCount}
          />
          
          {/* Active Filter Chips */}
          {activeFilterCount > 0 && (
            <FilterChips
              filters={activeFilterChips}
              onRemoveFilter={handleRemoveFilter}
              onClearAll={handleClearAllFilters}
            />
          )}
        </Box>
        
        {/* User Table */}
        <UserTable
          users={users}
          loading={loading}
          onEdit={handleOpenEditDialog}
          onDelete={handleDeleteClick}
          onVerify={handleVerifyUser}
          onViewDetails={handleViewUserDetails}
          sortBy={filterParams.sortBy || 'id'}
          sortDir={(filterParams.sortDir as 'asc' | 'desc') || 'asc'}
          onSort={handleSortChange}
        />
        
        {/* Pagination */}
        <Box sx={{ mt: theme.customSpacing.section }}>
          <Pagination
            page={filterParams.page || 0}
            size={filterParams.size || 10}
            totalPages={totalPages}
            totalElements={totalElements}
            itemsCount={users.length}
            loading={loading}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChangeAdapter}
            pageSizeOptions={[5, 10, 25, 50]}
            variant="enhanced"
            elevation={1}
          />
        </Box>
        
        {/* User Form Dialog */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { borderRadius: theme.shape.borderRadius }
          }}
        >
          <DialogTitle>
            {editingUser ? 'Edit User' : 'Create User'}
            <IconButton
              aria-label="close"
              onClick={handleCloseDialog}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <UserForm
              initialData={formData}
              roles={roles}
              onDataChange={handleFormDataChange}
              editMode={!!editingUser}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={handleCloseDialog} color="inherit">
              Cancel
            </Button>
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
        
        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Confirm Delete"
          message="Are you sure you want to delete this user? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          confirmColor="error"
          loading={deleting}
          icon={<DeleteIcon />}
        />
        
        {/* Filter Dialog */}
        <UserFilterDialog
          open={openFilterDialog}
          onClose={() => setOpenFilterDialog(false)}
          onApplyFilter={handleFilterApply}
          currentFilters={filterParams as UserFilterParams}
          roles={roles}
          loading={loading}
        />
      </Box>
    </Container>
  );
};

export default UserManagement;
