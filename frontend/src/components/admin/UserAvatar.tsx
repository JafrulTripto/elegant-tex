import React, { useState, useEffect } from 'react';
import { Avatar, Box, useTheme, CircularProgress } from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import { getFileUrl } from '../../services/fileStorage.service';

interface UserAvatarProps {
  user: {
    id: number;
    firstName?: string;
    lastName?: string;
    profileImageId?: number;
  };
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ 
  user, 
  size = 'medium',
  onClick 
}) => {
  const theme = useTheme();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Size configurations
  const sizeConfig = {
    small: { width: 32, height: 32, fontSize: '0.875rem' },
    medium: { width: 40, height: 40, fontSize: '1rem' },
    large: { width: 56, height: 56, fontSize: '1.25rem' }
  };

  const currentSize = sizeConfig[size];

  // Load image URL when profileImageId changes
  useEffect(() => {
    if (user.profileImageId && user.profileImageId > 0) {
      setLoading(true);
      setError(false);
      
      // Get the image URL using the getFileUrl function
      const url = getFileUrl(user.profileImageId);
      setImageUrl(url);
      setLoading(false);
    } else {
      setLoading(false);
      setImageUrl(null);
    }
  }, [user.profileImageId]);

  // Generate initials from first and last name
  const getInitials = () => {
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    } else if (firstName) {
      return firstName.charAt(0).toUpperCase();
    } else if (lastName) {
      return lastName.charAt(0).toUpperCase();
    }
    return '';
  };

  // Generate consistent color based on user ID
  const getAvatarColor = () => {
    const colors = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.info.main,
      '#9c27b0', // purple
      '#ff5722', // deep orange
      '#607d8b', // blue grey
    ];
    return colors[user.id % colors.length];
  };

  // Check if user has profile image and it's loaded successfully
  const hasProfileImage = imageUrl && !error && !loading;
  const initials = getInitials();

  return (
    <Box
      onClick={onClick}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? {
          transform: 'scale(1.05)',
          transition: 'transform 0.2s ease-in-out'
        } : {}
      }}
    >
      <Avatar
        src={imageUrl || undefined}
        onError={() => setError(true)}
        sx={{
          ...currentSize,
          backgroundColor: !hasProfileImage ? getAvatarColor() : undefined,
          color: 'white',
          fontWeight: 600,
          border: `2px solid ${theme.palette.background.paper}`,
          boxShadow: theme.shadows[2]
        }}
      >
        {loading ? (
          <CircularProgress size={size === 'small' ? 16 : size === 'medium' ? 20 : 24} color="inherit" />
        ) : !hasProfileImage ? (
          initials || <PersonIcon fontSize={size === 'small' ? 'small' : 'medium'} />
        ) : null}
      </Avatar>
    </Box>
  );
};

export default UserAvatar;
