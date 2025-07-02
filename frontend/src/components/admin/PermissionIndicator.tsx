import React from 'react';
import { Box, Tooltip, Typography } from '@mui/material';
import { Permission } from '../../types';

interface PermissionIndicatorProps {
  permissions: Permission[];
  maxDots?: number;
}

const PermissionIndicator: React.FC<PermissionIndicatorProps> = ({ 
  permissions, 
  maxDots = 5 
}) => {
  // Calculate the percentage of permissions (assuming a typical role might have up to 50 permissions)
  const totalPermissions = permissions.length;
  const maxPermissions = 50; // This is an assumption, adjust based on your system
  const filledDots = Math.min(
    maxDots,
    Math.ceil((totalPermissions / maxPermissions) * maxDots)
  );
  
  // Ensure at least one dot is filled if there are any permissions
  const adjustedFilledDots = totalPermissions > 0 && filledDots === 0 ? 1 : filledDots;
  
  // Group permissions by category for the tooltip
  const permissionsByCategory: Record<string, number> = {};
  
  permissions.forEach(permission => {
    const category = permission.name.split('_')[0];
    permissionsByCategory[category] = (permissionsByCategory[category] || 0) + 1;
  });

  return (
    <Tooltip
      title={
        <Box>
          <Typography variant="subtitle2">Permission Breakdown:</Typography>
          {Object.entries(permissionsByCategory).map(([category, count]) => (
            <Typography variant="body2" key={category}>
              {category}: {count} permission{count !== 1 ? 's' : ''}
            </Typography>
          ))}
        </Box>
      }
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {[...Array(maxDots)].map((_, index) => (
          <Box
            key={index}
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: index < adjustedFilledDots ? 'primary.main' : 'grey.300',
              transition: 'background-color 0.3s ease'
            }}
          />
        ))}
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ ml: 1, fontWeight: 500 }}
        >
          {totalPermissions} permission{totalPermissions !== 1 ? 's' : ''}
        </Typography>
      </Box>
    </Tooltip>
  );
};

export default PermissionIndicator;
