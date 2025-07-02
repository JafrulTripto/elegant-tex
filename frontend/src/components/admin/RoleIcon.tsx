import React from 'react';
import { Avatar, Tooltip } from '@mui/material';
import {
  AdminPanelSettings as AdminIcon,
  SupervisorAccount as ManagerIcon,
  Person as UserIcon,
  Visibility as ViewerIcon,
  PersonOutline as GuestIcon,
  Security as SecurityIcon
} from '@mui/icons-material';

interface RoleIconProps {
  roleName: string;
  size?: 'small' | 'medium' | 'large';
}

const RoleIcon: React.FC<RoleIconProps> = ({ roleName, size = 'medium' }) => {
  // Determine icon and color based on role name
  const getIconConfig = (role: string) => {
    const normalizedRole = role.replace('ROLE_', '').toUpperCase();
    
    switch (normalizedRole) {
      case 'ADMIN':
        return { 
          icon: <AdminIcon fontSize={size} />, 
          color: '#d32f2f', // red
          label: 'Administrator'
        };
      case 'MANAGER':
        return { 
          icon: <ManagerIcon fontSize={size} />, 
          color: '#7b1fa2', // purple
          label: 'Manager'
        };
      case 'USER':
        return { 
          icon: <UserIcon fontSize={size} />, 
          color: '#1976d2', // blue
          label: 'User'
        };
      case 'VIEWER':
        return { 
          icon: <ViewerIcon fontSize={size} />, 
          color: '#388e3c', // green
          label: 'Viewer'
        };
      case 'GUEST':
        return { 
          icon: <GuestIcon fontSize={size} />, 
          color: '#f57c00', // orange
          label: 'Guest'
        };
      default:
        return { 
          icon: <SecurityIcon fontSize={size} />, 
          color: '#616161', // gray
          label: normalizedRole.charAt(0) + normalizedRole.slice(1).toLowerCase()
        };
    }
  };
  
  const { icon, color, label } = getIconConfig(roleName);
  
  // Determine avatar size based on the size prop
  const getAvatarSize = () => {
    switch (size) {
      case 'small':
        return { width: 24, height: 24 };
      case 'large':
        return { width: 40, height: 40 };
      default:
        return { width: 32, height: 32 };
    }
  };
  
  return (
    <Tooltip title={label}>
      <Avatar 
        sx={{ 
          bgcolor: color,
          ...getAvatarSize()
        }}
      >
        {icon}
      </Avatar>
    </Tooltip>
  );
};

export default RoleIcon;
