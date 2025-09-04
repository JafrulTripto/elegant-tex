import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import axios from 'axios';
import api from '../../services/api';
import PermissionCardLayout from './PermissionCardLayout';
import { Permission } from '../../types';

// Define form data type

interface PermissionFormData {
  name: string;
  description: string;
}

const PermissionManagement: React.FC = () => {
  // State
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [formData, setFormData] = useState<PermissionFormData>({
    name: '',
    description: ''
  });

  // Fetch permissions
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        setLoading(true);
        
        const response = await api.get('/api/permissions');
        setPermissions(Array.isArray(response.data) ? response.data : []);
        
        setLoading(false);
      } catch (err) {
        setLoading(false);
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

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Open dialog for creating a new permission
  const handleOpenCreateDialog = () => {
    setEditingPermission(null);
    setFormData({
      name: '',
      description: ''
    });
    setOpenDialog(true);
  };

  // Open dialog for editing a permission
  const handleOpenEditDialog = (permission: Permission) => {
    setEditingPermission(permission);
    setFormData({
      name: permission.name,
      description: permission.description || ''
    });
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Save permission (create or update)
  const handleSavePermission = async () => {
    try {
      setLoading(true);
      
      if (editingPermission) {
        // Update existing permission
        await api.put(`/api/permissions/${editingPermission.id}`, formData);
        setSuccess('Permission updated successfully');
      } else {
        // Create new permission
        await api.post('/api/permissions', formData);
        setSuccess('Permission created successfully');
      }
      
      // Refresh permissions
      const response = await api.get('/api/permissions');
      setPermissions(Array.isArray(response.data) ? response.data : []);
      
      setLoading(false);
      setOpenDialog(false);
    } catch (err) {
      setLoading(false);
      if (axios.isAxiosError(err)) {
        setError(err.message || 'Failed to save permissions');
      } else {
        const errorMessage = (err as Error)?.message ?? 'Failed to save permissions';
        setError(errorMessage);
      }
    }
  };

  // Delete permission
  const handleDeletePermission = async (permissionId: number) => {
    if (!window.confirm('Are you sure you want to delete this permission?')) {
      return;
    }
    
    try {
      setLoading(true);
      
      await api.delete(`/api/permissions/${permissionId}`);
      
      // Refresh permissions
      const response = await api.get('/api/permissions');
      setPermissions(Array.isArray(response.data) ? response.data : []);
      
      setLoading(false);
      setSuccess('Permission deleted successfully');
    } catch (err) {
      setLoading(false);
      if (axios.isAxiosError(err)) {
        setError(err.message || 'Failed to delete permission');
      } else {
        const errorMessage = (err as Error)?.message ?? 'Failed to delete permission';
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
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ mb: 1 }}>Permission Management</Typography>
        <Typography variant="body2" color="text.secondary">
          Manage system permissions and their descriptions
        </Typography>
      </Box>
      
      <PermissionCardLayout
        permissions={permissions}
        loading={loading}
        onEditPermission={handleOpenEditDialog}
        onDeletePermission={handleDeletePermission}
        onAddPermission={handleOpenCreateDialog}
      />
      
      {/* Permission Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingPermission ? 'Edit Permission' : 'Create Permission'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              name="name"
              label="Permission Name"
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
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSavePermission}
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

export default PermissionManagement;
