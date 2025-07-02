import React from 'react';
import {
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
  Typography,
  Box
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { Permission } from '../../types';
import { getPermissionDisplayName } from '../../utils/permissionUtils';

interface PermissionItemProps {
  permission: Permission;
  onEdit: () => void;
  onDelete: () => void;
}

const PermissionItem: React.FC<PermissionItemProps> = ({
  permission,
  onEdit,
  onDelete
}) => {
  // Get display name for the permission
  const displayName = getPermissionDisplayName(permission);
  
  return (
    <ListItem 
      sx={{ 
        py: 1.5, 
        px: 2,
        transition: 'background-color 0.2s',
        '&:hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.04)'
        }
      }}
    >
      <ListItemText
        primary={
          <Typography variant="subtitle2" component="span">
            {displayName}
          </Typography>
        }
        secondary={
          permission.description ? (
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                mt: 0.5,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {permission.description}
            </Typography>
          ) : null
        }
        primaryTypographyProps={{
          sx: {
            fontWeight: 'medium'
          }
        }}
      />
      <ListItemSecondaryAction>
        <Box sx={{ display: 'flex' }}>
          <Tooltip title="Edit permission">
            <IconButton 
              edge="end" 
              aria-label="edit" 
              onClick={onEdit}
              size="small"
              sx={{ mr: 0.5 }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete permission">
            <IconButton 
              edge="end" 
              aria-label="delete" 
              onClick={onDelete}
              size="small"
              color="error"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

export default PermissionItem;
