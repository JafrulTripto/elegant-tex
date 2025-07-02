import React, { useState } from 'react';
import {
  Box,
  Grid,
  TextField,
  InputAdornment,
  Typography,
  Button,
  CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { Permission } from '../../types';
import { groupPermissionsByCategory } from '../../utils/permissionUtils';
import PermissionCategoryCard from './PermissionCategoryCard';

interface PermissionCardLayoutProps {
  permissions: Permission[];
  loading: boolean;
  onEditPermission: (permission: Permission) => void;
  onDeletePermission: (permissionId: number) => void;
  onAddPermission: () => void;
}

const PermissionCardLayout: React.FC<PermissionCardLayoutProps> = ({
  permissions,
  loading,
  onEditPermission,
  onDeletePermission,
  onAddPermission
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter permissions based on search query
  const filteredPermissions = permissions.filter(permission => 
    permission.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (permission.description && permission.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Group permissions by category
  const permissionCategories = groupPermissionsByCategory(filteredPermissions);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <TextField
          placeholder="Search permissions..."
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{ width: { xs: '100%', sm: '300px' } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={onAddPermission}
          sx={{ ml: { xs: 1, sm: 2 } }}
        >
          Add
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : permissionCategories.length === 0 ? (
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          {searchQuery ? 'No permissions match your search' : 'No permissions found'}
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {permissionCategories.map((category) => (
            <Grid item xs={12} sm={6} md={4} key={category.name}>
              <PermissionCategoryCard
                category={category}
                onEditPermission={onEditPermission}
                onDeletePermission={onDeletePermission}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default PermissionCardLayout;
