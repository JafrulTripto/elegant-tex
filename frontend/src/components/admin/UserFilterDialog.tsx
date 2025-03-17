import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  Divider,
  Box,
  IconButton,
  SelectChangeEvent,
  Checkbox,
  FormControlLabel,
  FormGroup
} from '@mui/material';
import { Close as CloseIcon, FilterList as FilterIcon } from '@mui/icons-material';
import { UserFilterParams, Role } from '../../types';

interface UserFilterDialogProps {
  open: boolean;
  onClose: () => void;
  onApplyFilter: (filters: UserFilterParams) => void;
  roles: Role[];
  currentFilters: UserFilterParams;
  loading?: boolean;
}

const UserFilterDialog: React.FC<UserFilterDialogProps> = ({
  open,
  onClose,
  onApplyFilter,
  roles,
  currentFilters,
  loading = false
}) => {
  const [filters, setFilters] = useState<UserFilterParams>({
    emailVerified: undefined,
    accountVerified: undefined,
    roles: []
  });

  // Initialize filters from props
  useEffect(() => {
    setFilters(currentFilters);
  }, [currentFilters, open]);

  const handleSelectChange = (e: SelectChangeEvent<string[]>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: typeof value === 'string' ? [value] : value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    // Toggle between true, undefined (not false, as we want to use undefined to mean "any")
    const newValue = checked ? true : undefined;
    setFilters(prev => ({ ...prev, [name]: newValue }));
  };

  const handleApplyFilter = () => {
    onApplyFilter(filters);
    onClose();
  };

  const handleClearFilter = () => {
    const clearedFilters = {
      emailVerified: undefined,
      accountVerified: undefined,
      roles: []
    };
    setFilters(clearedFilters);
    onApplyFilter(clearedFilters);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <FilterIcon sx={{ mr: 1 }} />
            <Typography variant="h6">Filter Users</Typography>
          </Box>
          <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <Divider />
      
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="roles-label">Roles</InputLabel>
              <Select
                labelId="roles-label"
                id="roles"
                name="roles"
                multiple
                value={filters.roles || []}
                onChange={handleSelectChange}
                label="Roles"
                disabled={loading}
              >
                {roles.map((role) => (
                  <MenuItem key={role.id} value={role.name}>
                    {role.name.replace('ROLE_', '')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Status Filters
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filters.emailVerified === true}
                    onChange={handleCheckboxChange}
                    name="emailVerified"
                    disabled={loading}
                  />
                }
                label="Email Verified"
              />
              
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filters.accountVerified === true}
                    onChange={handleCheckboxChange}
                    name="accountVerified"
                    disabled={loading}
                  />
                }
                label="Account Active"
              />
            </FormGroup>
          </Grid>
        </Grid>
      </DialogContent>
      
      <Divider />
      
      <DialogActions>
        <Button onClick={handleClearFilter} color="inherit" disabled={loading}>
          Clear Filters
        </Button>
        <Button onClick={onClose} color="inherit" disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleApplyFilter} color="primary" variant="contained" disabled={loading}>
          Apply Filters
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserFilterDialog;
