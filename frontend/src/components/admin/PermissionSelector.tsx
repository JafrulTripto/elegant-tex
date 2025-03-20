import React from 'react';
import {
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Permission } from '../../types';
import { groupPermissionsByCategory, getPermissionDisplayName, getCategoryColor } from '../../utils/permissionUtils';

interface PermissionSelectorProps {
  permissions: Permission[];
  selectedPermissionIds: number[];
  onChange: (permissionIds: number[]) => void;
  disabled?: boolean;
}

const PermissionSelector: React.FC<PermissionSelectorProps> = ({
  permissions,
  selectedPermissionIds,
  onChange,
  disabled = false
}) => {
  // Group permissions by category
  const permissionCategories = groupPermissionsByCategory(permissions);

  // Handle permission checkbox change
  const handlePermissionChange = (permissionId: number) => {
    if (selectedPermissionIds.includes(permissionId)) {
      onChange(selectedPermissionIds.filter(id => id !== permissionId));
    } else {
      onChange([...selectedPermissionIds, permissionId]);
    }
  };

  // Handle category select all
  const handleSelectAllCategory = (categoryPermissions: Permission[], isSelected: boolean) => {
    const categoryPermissionIds = categoryPermissions.map(p => p.id);
    
    if (isSelected) {
      // Remove all permissions in this category
      onChange(selectedPermissionIds.filter(id => !categoryPermissionIds.includes(id)));
    } else {
      // Add all permissions in this category that aren't already selected
      const newPermissionIds = categoryPermissionIds.filter(id => !selectedPermissionIds.includes(id));
      onChange([...selectedPermissionIds, ...newPermissionIds]);
    }
  };

  // Check if all permissions in a category are selected
  const isCategoryFullySelected = (categoryPermissions: Permission[]): boolean => {
    return categoryPermissions.every(p => selectedPermissionIds.includes(p.id));
  };

  // Check if some permissions in a category are selected
  const isCategoryPartiallySelected = (categoryPermissions: Permission[]): boolean => {
    return categoryPermissions.some(p => selectedPermissionIds.includes(p.id)) && 
           !isCategoryFullySelected(categoryPermissions);
  };

  return (
    <Box>
      {permissionCategories.map((category) => (
        <Accordion key={category.name} defaultExpanded={false}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isCategoryFullySelected(category.permissions)}
                    indeterminate={isCategoryPartiallySelected(category.permissions)}
                    onChange={() => handleSelectAllCategory(
                      category.permissions, 
                      isCategoryFullySelected(category.permissions)
                    )}
                    onClick={(e) => e.stopPropagation()}
                    disabled={disabled}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="subtitle1">{category.name}</Typography>
                    <Chip 
                      label={`${category.permissions.length}`} 
                      size="small" 
                      color={getCategoryColor(category.name) as any}
                      sx={{ ml: 1 }}
                    />
                  </Box>
                }
                onClick={(e) => e.stopPropagation()}
                sx={{ width: '100%' }}
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <FormGroup>
              {category.permissions.map((permission) => (
                <FormControlLabel
                  key={permission.id}
                  control={
                    <Checkbox
                      checked={selectedPermissionIds.includes(permission.id)}
                      onChange={() => handlePermissionChange(permission.id)}
                      disabled={disabled}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2">
                        {getPermissionDisplayName(permission)}
                      </Typography>
                      {permission.description && (
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          ({permission.description})
                        </Typography>
                      )}
                    </Box>
                  }
                />
              ))}
            </FormGroup>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default PermissionSelector;
