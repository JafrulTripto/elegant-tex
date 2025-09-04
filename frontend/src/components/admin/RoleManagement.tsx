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
  Grid,
  Chip,
  Tooltip,
  useTheme,
  useMediaQuery,
  Avatar,
  SelectChangeEvent
} from '@mui/material';
import { Pagination } from '../common';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import axios from 'axios';
import { Role, Permission, RoleFilterParams } from '../../types';
import roleService from '../../services/role.service';
import api from '../../services/api';
import RoleFilterDialog from './RoleFilterDialog';
import PermissionSelector from './PermissionSelector';
import ConfirmationDialog from '../common/ConfirmationDialog';
import RoleIcon from './RoleIcon';
import PermissionIndicator from './PermissionIndicator';

interface RoleFormData {
  name: string;
  description: string;
  permissionIds: number[];
}

const RoleManagement: React.FC = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));
  
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
          setError(err.message || 'Failed to fetch permissions');
        } else {
          const errorMessage = (err as Error)?.message ?? 'Failed to fetch permissions';
          setError(errorMessage);
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
        setError(err.message || 'Failed to fetch role');
      } else {
        const errorMessage = (err as Error)?.message ?? 'Failed to fetch roles';
        setError(errorMessage);
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
        setError(err.message || 'Failed to save role');
      } else {
        const errorMessage = (err as Error)?.message ?? 'Failed to save role';
        setError(errorMessage);
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
        setError(err.message || 'Failed to delete role');
      } else {
        const errorMessage = (err as Error)?.message ?? 'Failed to delete role';
        setError(errorMessage);
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
        <Box sx={{ display: 'flex', flexDirection: 'column', mb: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 0.5 
          }}>
            <Typography variant="h5" sx={{ fontWeight: 500 }}>Roles</Typography>
            <Button
              variant="contained"
              startIcon={!isSmallScreen && <AddIcon />}
              onClick={handleOpenCreateDialog}
              size={isSmallScreen ? "small" : "medium"}
              sx={{ 
                height: isSmallScreen ? 36 : 40,
                px: isSmallScreen ? 1.5 : 2,
                boxShadow: 2
              }}
            >
              {isSmallScreen ? <AddIcon fontSize="small" /> : "Add Role"}
            </Button>
          </Box>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ mb: 2 }}
          >
            Manage user roles and their associated permissions
          </Typography>
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
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.1)'
                    },
                    '&.Mui-focused': {
                      boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)'
                    }
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
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
                          minWidth: 'auto',
                          px: 1.5,
                          boxShadow: 1
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
          <Grid item xs={12} md={3} sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
            <Tooltip title="Refresh roles">
              <IconButton 
                color="primary" 
                onClick={fetchRoles}
                size={isSmallScreen ? "small" : "medium"}
                sx={{ border: '1px solid', borderColor: 'divider' }}
              >
                <RefreshIcon fontSize={isSmallScreen ? "small" : "medium"} />
              </IconButton>
            </Tooltip>
            <Button
              variant="outlined"
              startIcon={!isSmallScreen && <FilterIcon />}
              onClick={() => setOpenFilterDialog(true)}
              size={isSmallScreen ? "small" : "medium"}
              sx={{ 
                height: isSmallScreen ? 36 : 40,
                px: isSmallScreen ? 1.5 : 2
              }}
            >
              {isSmallScreen ? <FilterIcon fontSize="small" /> : "Filters"}
              {filterParams.permissions && filterParams.permissions.length > 0 && (
                <Chip
                  label={filterParams.permissions.length}
                  color="primary"
                  size="small"
                  sx={{
                    ml: 1,
                    height: 20,
                    minWidth: 20,
                    fontSize: '0.75rem',
                    '& .MuiChip-label': {
                      px: 1
                    }
                  }}
                />
              )}
            </Button>
          </Grid>
        </Grid>
      </Box>
      
      <TableContainer 
        component={Paper} 
        sx={{ 
          boxShadow: 2,
          borderRadius: 2,
          overflow: 'hidden',
          position: 'relative',
          mb: 2
        }}
      >
        {loading && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            p: 2, 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10,
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            alignItems: 'center'
          }}>
            <CircularProgress size={40} />
          </Box>
        )}
        <Table sx={{ minWidth: isSmallScreen ? 400 : 650 }}>
          <TableHead>
            <TableRow sx={{ 
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
              '& th': { fontWeight: 600 }
            }}>
              <TableCell 
                onClick={() => handleSortChange('name')}
                sx={{ 
                  cursor: 'pointer', 
                  userSelect: 'none',
                  transition: 'background-color 0.2s',
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                  },
                  py: 1.5
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Role {renderSortIcon('name')}
                </Box>
              </TableCell>
              {!isSmallScreen && (
                <TableCell 
                  onClick={() => handleSortChange('description')}
                  sx={{ 
                    cursor: 'pointer', 
                    userSelect: 'none',
                    transition: 'background-color 0.2s',
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                    },
                    py: 1.5
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    Description {renderSortIcon('description')}
                  </Box>
                </TableCell>
              )}
              <TableCell sx={{ py: 1.5 }}>Permissions</TableCell>
              <TableCell align="right" sx={{ py: 1.5, pr: 2 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {roles.map((role) => (
              <TableRow 
                key={role.id}
                sx={{ 
                  '&:hover': { 
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
                  },
                  transition: 'background-color 0.2s'
                }}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <RoleIcon roleName={role.name} size={isSmallScreen ? "small" : "medium"} />
                    <Box>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontWeight: 500,
                          fontSize: isSmallScreen ? '0.875rem' : '0.95rem'
                        }}
                      >
                        {role.name.replace('ROLE_', '')}
                      </Typography>
                      {isSmallScreen && role.description && (
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ 
                            fontSize: '0.75rem',
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {role.description}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </TableCell>
                {!isSmallScreen && (
                  <TableCell>
                    <Typography 
                      variant="body2"
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: isMediumScreen ? 150 : 250
                      }}
                    >
                      {role.description || 'No description provided'}
                    </Typography>
                  </TableCell>
                )}
                <TableCell>
                  <PermissionIndicator permissions={role.permissions || []} />
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                    <Tooltip title="Edit role">
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenEditDialog(role)}
                        size="small"
                        sx={{ 
                          border: '1px solid',
                          borderColor: 'divider'
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete role">
                      <IconButton
                        color="error"
                        onClick={() => handleOpenDeleteDialog(role.id)}
                        size="small"
                        sx={{ 
                          border: '1px solid',
                          borderColor: 'divider'
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {roles.length === 0 && (
              <TableRow>
                <TableCell 
                  colSpan={isSmallScreen ? 3 : 4} 
                  align="center"
                  sx={{ py: 4 }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                    <SecurityIcon sx={{ fontSize: 40, color: 'text.secondary', opacity: 0.5 }} />
                    <Typography variant="body1" color="text.secondary">
                      No roles found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {searchTerm ? 'Try adjusting your search or filters' : 'Create your first role to get started'}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Enhanced Pagination */}
      <Pagination
        page={filterParams.page !== undefined ? filterParams.page : 0}
        size={filterParams.size || 10}
        totalPages={totalPages}
        totalElements={totalElements}
        itemsCount={roles.length}
        loading={loading}
        onPageChange={handlePageChange}
        onPageSizeChange={(e: SelectChangeEvent) => handlePageSizeChange(e as unknown as React.ChangeEvent<HTMLInputElement>)}
        pageSizeOptions={[5, 10, 25, 50]}
        variant="enhanced"
        elevation={1}
      />
      
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
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: 24
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {editingRole ? (
              <RoleIcon roleName={editingRole.name} size="medium" />
            ) : (
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <SecurityIcon />
              </Avatar>
            )}
            <Typography variant="h6">
              {editingRole ? `Edit ${editingRole.name.replace('ROLE_', '')}` : 'Create New Role'}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              name="name"
              label="Role Name"
              fullWidth
              value={formData.name}
              onChange={handleInputChange}
              required
              helperText="Role names are typically prefixed with 'ROLE_' (e.g., ROLE_ADMIN)"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                  transition: 'all 0.3s ease'
                }
              }}
            />
            
            <TextField
              name="description"
              label="Description"
              fullWidth
              value={formData.description}
              onChange={handleInputChange}
              multiline
              rows={2}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1
                }
              }}
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
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={handleCloseDialog}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveRole}
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Saving...' : 'Save'}
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
        onClose={handleCloseDeleteDialog}
        loading={loading}
        confirmColor="error"
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
