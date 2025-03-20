import React, { useState } from 'react';
import {
  Box,
  Chip,
  Typography,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { Permission } from '../../types';
import { groupPermissionsByCategory, getPermissionDisplayName, getCategoryColor } from '../../utils/permissionUtils';

interface PermissionDisplayProps {
  permissions: Permission[];
  maxVisible?: number;
}

const PermissionDisplay: React.FC<PermissionDisplayProps> = ({
  permissions,
  maxVisible = 5
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  
  if (!permissions || permissions.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No permissions assigned
      </Typography>
    );
  }

  // Group permissions by category
  const permissionCategories = groupPermissionsByCategory(permissions);
  
  // Calculate total permissions and visible permissions
  const totalPermissions = permissions.length;
  const visiblePermissions = Math.min(maxVisible, totalPermissions);
  const hasMorePermissions = totalPermissions > visiblePermissions;
  
  // Handle dialog open/close
  const handleOpenDialog = () => setDialogOpen(true);
  const handleCloseDialog = () => setDialogOpen(false);

  return (
    <>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {permissionCategories.map((category) => (
          <Tooltip 
            key={category.name}
            title={`${category.name} permissions: ${category.permissions.map(p => getPermissionDisplayName(p)).join(', ')}`}
          >
            <Chip
              label={`${category.name} (${category.permissions.length})`}
              color={getCategoryColor(category.name) as any}
              size="small"
              sx={{ mr: 0.5, mb: 0.5 }}
            />
          </Tooltip>
        ))}
        
        {hasMorePermissions && (
          <Chip
            label={`+${totalPermissions - visiblePermissions} more`}
            variant="outlined"
            size="small"
            onClick={handleOpenDialog}
            sx={{ mr: 0.5, mb: 0.5, cursor: 'pointer' }}
          />
        )}
      </Box>
      
      {/* Dialog to show all permissions */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>All Permissions</DialogTitle>
        <DialogContent dividers>
          {permissionCategories.map((category, index) => (
            <React.Fragment key={category.name}>
              {index > 0 && <Divider sx={{ my: 1 }} />}
              <Box sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle1">{category.name}</Typography>
                  <Chip 
                    label={`${category.permissions.length}`} 
                    size="small" 
                    color={getCategoryColor(category.name) as any}
                    sx={{ ml: 1 }}
                  />
                </Box>
                <List dense disablePadding>
                  {category.permissions.map((permission) => (
                    <ListItem key={permission.id} disablePadding sx={{ py: 0.5 }}>
                      <ListItemText 
                        primary={getPermissionDisplayName(permission)}
                        secondary={permission.description}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </React.Fragment>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PermissionDisplay;
