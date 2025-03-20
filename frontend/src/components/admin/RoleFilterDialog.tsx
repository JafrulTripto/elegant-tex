import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress
} from '@mui/material';
import { Permission, RoleFilterParams } from '../../types';
import PermissionSelector from './PermissionSelector';

interface RoleFilterDialogProps {
  open: boolean;
  onClose: () => void;
  onApplyFilter: (filters: Partial<RoleFilterParams>) => void;
  permissions: Permission[];
  currentFilters: RoleFilterParams;
  loading?: boolean;
}

const RoleFilterDialog: React.FC<RoleFilterDialogProps> = ({
  open,
  onClose,
  onApplyFilter,
  permissions,
  currentFilters,
  loading = false
}) => {
  // Local state for filter values
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>(
    currentFilters.permissions || []
  );

  // Update local state when currentFilters change
  useEffect(() => {
    setSelectedPermissionIds(currentFilters.permissions || []);
  }, [currentFilters, open]);

  // Handle permission selection change
  const handlePermissionChange = (permissionIds: number[]) => {
    setSelectedPermissionIds(permissionIds);
  };

  // Handle apply filters
  const handleApplyFilters = () => {
    onApplyFilter({
      permissions: selectedPermissionIds
    });
    onClose();
  };

  // Handle reset filters
  const handleResetFilters = () => {
    setSelectedPermissionIds([]);
    onApplyFilter({
      permissions: []
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Filter Roles</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ py: 1 }}>
          <Typography variant="subtitle1" gutterBottom>
            Filter by Permissions
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select permissions to filter roles that have any of the selected permissions.
          </Typography>
          
          {permissions.length > 0 ? (
            <PermissionSelector
              permissions={permissions}
              selectedPermissionIds={selectedPermissionIds}
              onChange={handlePermissionChange}
              disabled={loading}
            />
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                <Typography color="text.secondary">No permissions available</Typography>
              )}
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleResetFilters} disabled={loading || selectedPermissionIds.length === 0}>
          Reset
        </Button>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleApplyFilters}
          variant="contained"
          color="primary"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Apply Filters'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RoleFilterDialog;
