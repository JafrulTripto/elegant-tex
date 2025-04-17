import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormControlLabel,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  useTheme,
  alpha
} from '@mui/material';
import { 
  Person as PersonIcon,
  Email as EmailIcon,
  VerifiedUser as VerifiedUserIcon
} from '@mui/icons-material';
import { FilterDialog, FilterTab } from '../common';
import { UserFilterParams } from '../../hooks/useUserFilters';
import { Role } from '../../types';

interface UserFilterDialogProps {
  open: boolean;
  onClose: () => void;
  onApplyFilter: (filters: Partial<UserFilterParams>) => void;
  currentFilters: UserFilterParams;
  roles: Role[];
  loading?: boolean;
}

const UserFilterDialog: React.FC<UserFilterDialogProps> = ({
  open,
  onClose,
  onApplyFilter,
  currentFilters,
  roles,
  loading = false
}) => {
  const theme = useTheme();
  const [filters, setFilters] = useState<Partial<UserFilterParams>>({});

  // Initialize filters from props
  useEffect(() => {
    if (open) {
      setFilters({
        emailVerified: currentFilters.emailVerified,
        accountVerified: currentFilters.accountVerified,
        roles: currentFilters.roles || []
      });
    }
  }, [currentFilters, open]);

  // Handle email verified toggle
  const handleEmailVerifiedChange = (value: boolean | undefined) => {
    setFilters(prev => ({ ...prev, emailVerified: value }));
  };

  // Handle account verified toggle
  const handleAccountVerifiedChange = (value: boolean | undefined) => {
    setFilters(prev => ({ ...prev, accountVerified: value }));
  };

  // Handle role selection
  const handleRoleChange = (event: SelectChangeEvent<string[]>) => {
    const { value } = event.target;
    setFilters(prev => ({
      ...prev,
      roles: typeof value === 'string' ? [value] : value
    }));
  };

  // Handle apply filter
  const handleApplyFilter = () => {
    onApplyFilter(filters);
    onClose();
  };

  // Handle clear filter
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

  // Count active filters
  const getActiveFilterCount = (): number => {
    let count = 0;
    if (filters.emailVerified !== undefined) count++;
    if (filters.accountVerified !== undefined) count++;
    if (filters.roles && filters.roles.length > 0) count++;
    return count;
  };

  // Create filter tabs
  const filterTabs: FilterTab[] = [
    {
      label: "Email Status",
      icon: <EmailIcon />,
      content: (
        <Box>
          <Typography variant="subtitle2" gutterBottom color="primary">
            Email Verification Status
          </Typography>
          
          <Box sx={{ 
            p: 2, 
            borderRadius: theme.shape.borderRadius,
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            mb: 2
          }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={filters.emailVerified === true}
                    onChange={() => handleEmailVerifiedChange(
                      filters.emailVerified === true ? undefined : true
                    )}
                    color="success"
                  />
                }
                label="Show verified emails only"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={filters.emailVerified === false}
                    onChange={() => handleEmailVerifiedChange(
                      filters.emailVerified === false ? undefined : false
                    )}
                    color="error"
                  />
                }
                label="Show unverified emails only"
              />
            </Box>
          </Box>
        </Box>
      )
    },
    {
      label: "Account Status",
      icon: <VerifiedUserIcon />,
      content: (
        <Box>
          <Typography variant="subtitle2" gutterBottom color="primary">
            Account Status
          </Typography>
          
          <Box sx={{ 
            p: 2, 
            borderRadius: theme.shape.borderRadius,
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            mb: 2
          }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={filters.accountVerified === true}
                    onChange={() => handleAccountVerifiedChange(
                      filters.accountVerified === true ? undefined : true
                    )}
                    color="success"
                  />
                }
                label="Show active accounts only"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={filters.accountVerified === false}
                    onChange={() => handleAccountVerifiedChange(
                      filters.accountVerified === false ? undefined : false
                    )}
                    color="error"
                  />
                }
                label="Show inactive accounts only"
              />
            </Box>
          </Box>
        </Box>
      )
    },
    {
      label: "Roles",
      icon: <PersonIcon />,
      content: (
        <Box>
          <Typography variant="subtitle2" gutterBottom color="primary">
            Filter by Roles
          </Typography>
          
          <FormControl fullWidth variant="outlined">
            <InputLabel id="roles-label">Selected Roles</InputLabel>
            <Select
              labelId="roles-label"
              id="roles"
              multiple
              value={filters.roles || []}
              onChange={handleRoleChange}
              label="Selected Roles"
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Box
                      key={value}
                      sx={{
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        backgroundColor: value === 'ROLE_ADMIN' 
                          ? theme.palette.primary.main + '20'
                          : theme.palette.grey[200],
                        color: value === 'ROLE_ADMIN'
                          ? theme.palette.primary.main
                          : theme.palette.text.secondary,
                        borderRadius: theme.shape.borderRadius,
                        px: 1,
                        py: 0.25,
                        display: 'inline-block'
                      }}
                    >
                      {value.replace('ROLE_', '')}
                    </Box>
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
        </Box>
      )
    }
  ];

  return (
    <FilterDialog
      open={open}
      onClose={onClose}
      onApplyFilter={handleApplyFilter}
      onClearFilter={handleClearFilter}
      title="Filter Users"
      tabs={filterTabs}
      loading={loading}
      activeFilterCount={getActiveFilterCount()}
    />
  );
};

export default UserFilterDialog;
