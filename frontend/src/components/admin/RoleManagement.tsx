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
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import axios from 'axios';
import api from '../../services/api';

// Define types
interface Role {
  id: number;
  name: string;
  description: string;
  permissions: Permission[];
}

interface Permission {
  id: number;
  name: string;
  description: string;
}

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
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState<RoleFormData>({
    name: '',
    description: '',
    permissionIds: []
  });

  // Fetch roles and permissions
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch roles
        const rolesResponse = await api.get('/api/roles');
        setRoles(Array.isArray(rolesResponse.data) ? rolesResponse.data : []);
        
        // Fetch permissions
        const permissionsResponse = await api.get('/api/permissions');
        setPermissions(Array.isArray(permissionsResponse.data) ? permissionsResponse.data : []);
        
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

  // Handle permission selection
  const handlePermissionChange = (event: SelectChangeEvent<number[]>) => {
    const { value } = event.target;
    setFormData(prev => ({
      ...prev,
      permissionIds: typeof value === 'string' ? [parseInt(value)] : value as number[]
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
      permissionIds: role.permissions.map(p => p.id)
    });
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Save role (create or update)
  const handleSaveRole = async () => {
    try {
      setLoading(true);
      
      if (editingRole) {
        // Update existing role
        await api.put(`/api/roles/${editingRole.id}`, formData);
        setSuccess('Role updated successfully');
      } else {
        // Create new role
        await api.post('/api/roles', formData);
        setSuccess('Role created successfully');
      }
      
      // Refresh roles
      const rolesResponse = await api.get('/api/roles');
      setRoles(Array.isArray(rolesResponse.data) ? rolesResponse.data : []);
      
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

  // Delete role
  const handleDeleteRole = async (roleId: number) => {
    if (!window.confirm('Are you sure you want to delete this role?')) {
      return;
    }
    
    try {
      setLoading(true);
      
      await api.delete(`/api/roles/${roleId}`);
      
      // Refresh roles
      const rolesResponse = await api.get('/api/roles');
      setRoles(Array.isArray(rolesResponse.data) ? rolesResponse.data : []);
      
      setLoading(false);
      setSuccess('Role deleted successfully');
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">Role Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
        >
          Add Role
        </Button>
      </Box>
      
      {loading && roles.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
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
                      <Chip 
                        label={role.name.replace('ROLE_', '')} 
                        color="primary" 
                        size="small" 
                        variant="outlined"
                      />
                    </Box>
                  </TableCell>
                  <TableCell>{role.description}</TableCell>
                  <TableCell>
                    {role.permissions.map((permission) => (
                      <Chip
                        key={permission.id}
                        label={permission.name}
                        size="small"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenEditDialog(role)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteRole(role.id)}
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
      )}
      
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
            
            <FormControl fullWidth>
              <InputLabel id="permissions-label">Permissions</InputLabel>
              <Select
                labelId="permissions-label"
                multiple
                value={formData.permissionIds}
                onChange={handlePermissionChange}
                input={<OutlinedInput label="Permissions" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const permission = permissions.find(p => p.id === value);
                      return (
                        <Chip key={value} label={permission?.name || ''} />
                      );
                    })}
                  </Box>
                )}
              >
                {permissions.map((permission) => (
                  <MenuItem key={permission.id} value={permission.id}>
                    {permission.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
