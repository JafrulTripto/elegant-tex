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
  CircularProgress,
  Alert,
  Snackbar,
  InputAdornment,
  Pagination,
  Stack,
  FormControl,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import axios from 'axios';
import { Role, Permission, RoleFilterParams } from '../../types';
import roleService from '../../services/role.service';
import api from '../../services/api';
import RoleFilterDialog from './RoleFilterDialog';
import PermissionSelector from './PermissionSelector';
import PermissionDisplay from './PermissionDisplay';
import ConfirmationDialog from '../common/ConfirmationDialog';

interface RoleFormData {
  name: string;
  description: string;
  permissionIds: number[];
}

const RoleManagement: React.FC = () => {
  // State
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [openFilterDialog, setOpenFilterDialog] = useState<boolean>(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState<RoleFormData>({
    name: '',
    description: '',
    permissionIds: []
  });
  
  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [roleToDelete, setRoleToDelete] = useState<number | null>(null);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterParams, setFilterParams] = useState<RoleFilterParams>({
    search: '',
    permissions: [],
    page: 0,
    size: 10,
    sortBy: 'id',
    sortDir: 'asc'
  });
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);

  // Fetch permissions on component mount
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const permissionsResponse = await api.get('/api/permissions');
        setPermissions(Array.isArray(permissionsResponse.data) ? permissionsResponse.data : []);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || 'Failed to fetch permissions');
        } else {
          setError('An unexpected error occurred');
        }
      }
    };
    
    fetchPermissions();
  }, []);
  
  // Fetch roles when filter params change
  useEffect(() => {
    fetchRoles();
  }, [filterParams]);
  
  // Fetch roles with search and filter
  const fetchRoles = async () => {
    try {
      setLoading(true);
      
      // Fetch roles with search and filter
      const response = await roleService.searchRoles(filterParams);
      
      // Handle both response structures (direct array or paginated response)
      if (response.data) {
        if (Array.isArray(response.data)) {
          // Direct array response
          setRoles(response.data);
          setTotalPages(1);
          setTotalElements(response.data.length);
        } else if (response.data.content) {
          // Paginated response
          setRoles(response.data.content);
          setTotalPages(response.data.totalPages);
          setTotalElements(response.data.totalElements || 0);
        } else if (response.data.data && response.data.data.content) {
          // ApiResponse<Page<Role>> response
          setRoles(response.data.data.content);
          setTotalPages(response.data.data.totalPages);
          setTotalElements(response.data.data.totalElements || 0);
        } else {
          setRoles([]);
          setTotalPages(1);
        }
      } else {
        setRoles([]);
        setTotalPages(1);
      }
      
      setLoading(false);
    } catch (err) {
      setLoading(false);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to fetch roles');
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

  // Handle permission selection
  const handlePermissionChange = (permissionIds: number[]) => {
    setFormData(prev => ({
      ...prev,
      permissionIds
    }));
  };

  // Open dialog for creating a new role
  const handleOpenCreateDialog = () => {
    setEditingRole(null);
    setFormData({
      name: '',
      description: '',
      permissionIds: []
    });
    setOpenDialog(true);
  };

  // Open dialog for editing a role
  const handleOpenEditDialog = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description || '',
      permissionIds: role.permissions ? role.permissions.map(p => p.id) : []
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
  };
  
  // Handle page change
  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    setFilterParams(prev => ({
      ...prev,
      page: page - 1
    }));
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

  // Save role (create or update)
  const handleSaveRole = async () => {
    try {
      setLoading(true);
      
      if (editingRole) {
        // Update existing role
        await roleService.updateRole(editingRole.id, formData);
        setSuccess('Role updated successfully');
      } else {
        // Create new role
        await roleService.createRole(formData);
        setSuccess('Role created successfully');
      }
      
      // Refresh roles
      fetchRoles();
      
      setLoading(false);
      setOpenDialog(false);
    } catch (err) {
      setLoading(false);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to save role');
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  // Open delete confirmation dialog
  const handleOpenDeleteDialog = (roleId: number) => {
    setRoleToDelete(roleId);
    setDeleteDialogOpen(true);
  };
  
  // Close delete confirmation dialog
  const handleCloseDeleteDialog = () => {
    setRoleToDelete(null);
    setDeleteDialogOpen(false);
  };

  // Delete role
  const handleDeleteRole = async () => {
    if (roleToDelete === null) return;
    
    try {
      setLoading(true);
      
      await roleService.deleteRole(roleToDelete);
      
      // Refresh roles
      fetchRoles();
      
      setLoading(false);
      setSuccess('Role deleted successfully');
      setDeleteDialogOpen(false);
    } catch (err) {
      setLoading(false);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to delete role');
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
      {/* Header and Action Buttons */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">Role Management</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
            sx={{ 
              height: 40,
              px: 2
            }}
          >
            Add Role
          </Button>
        </Box>
        
        {/* Search and filter UI */}
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={9}>
            <form onSubmit={handleSearchSubmit}>
              <TextField
                fullWidth
                placeholder="Search by role name or description"
                value={searchTerm}
                onChange={handleSearchChange}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button 
                        type="submit" 
                        variant="contained" 
                        size="small"
                        sx={{ 
                          height: 32,
                          minWidth: 'auto'
                        }}
                      >
                        Search
                      </Button>
                    </InputAdornment>
                  )
                }}
              />
            </form>
          </Grid>
          <Grid item xs={12} md={3} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => setOpenFilterDialog(true)}
              sx={{ 
                height: 40,
                px: 2
              }}
            >
              Filters
              {filterParams.permissions && filterParams.permissions.length > 0 && (
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
                  {filterParams.permissions.length}
                </Box>
              )}
            </Button>
          </Grid>
        </Grid>
      </Box>
      
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
                onClick={() => handleSortChange('name')}
                sx={{ cursor: 'pointer', userSelect: 'none' }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Name {renderSortIcon('name')}
                </Box>
              </TableCell>
              <TableCell 
                onClick={() => handleSortChange('description')}
                sx={{ cursor: 'pointer', userSelect: 'none' }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Description {renderSortIcon('description')}
                </Box>
              </TableCell>
              <TableCell>Permissions</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {role.name}
                    <Alert
                      icon={false}
                      severity="info"
                      sx={{ 
                        py: 0, 
                        px: 1, 
                        display: 'inline-flex', 
                        alignItems: 'center',
                        '& .MuiAlert-message': { p: 0 }
                      }}
                    >
                      {role.name.replace('ROLE_', '')}
                    </Alert>
                  </Box>
                </TableCell>
                <TableCell>{role.description}</TableCell>
                <TableCell>
                  <PermissionDisplay permissions={role.permissions || []} />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    color="primary"
                    onClick={() => handleOpenEditDialog(role)}
                    size="small"
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleOpenDeleteDialog(role.id)}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {roles.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No roles found
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
          {roles.length > 0 && (
            <Typography variant="body2" color="text.secondary">
              Showing {(filterParams.page || 0) * (filterParams.size || 10) + 1} to {Math.min(((filterParams.page || 0) + 1) * (filterParams.size || 10), ((filterParams.page || 0) * (filterParams.size || 10)) + roles.length)} of {totalElements} entries
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
      <RoleFilterDialog
        open={openFilterDialog}
        onClose={() => setOpenFilterDialog(false)}
        onApplyFilter={(filters) => {
          setFilterParams(prev => ({
            ...prev,
            ...filters,
            page: 0 // Reset to first page when applying filters
          }));
        }}
        permissions={permissions}
        currentFilters={filterParams}
        loading={loading}
      />
      
      {/* Role Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingRole ? 'Edit Role' : 'Create Role'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              name="name"
              label="Role Name"
              fullWidth
              value={formData.name}
              onChange={handleInputChange}
              required
              helperText="Role names are typically prefixed with 'ROLE_' (e.g., ROLE_ADMIN)"
            />
            
            <TextField
              name="description"
              label="Description"
              fullWidth
              value={formData.description}
              onChange={handleInputChange}
              multiline
              rows={2}
            />
            
            <Typography variant="subtitle1" gutterBottom>
              Permissions
            </Typography>
            
            <PermissionSelector
              permissions={permissions}
              selectedPermissionIds={formData.permissionIds}
              onChange={handlePermissionChange}
              disabled={loading}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSaveRole}
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
        title="Delete Role"
        message="Are you sure you want to delete this role? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteRole}
        onCancel={handleCloseDeleteDialog}
        loading={loading}
        severity="error"
      />
      
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

export default RoleManagement;
