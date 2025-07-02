import React from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Divider,
  List,
} from '@mui/material';
import {
  Category as CategoryIcon,
  Person as PersonIcon,
  Style as FabricIcon,
  Dashboard as DashboardIcon,
  ShoppingCart as OrderIcon,
  LocalOffer as TagIcon,
  Security as RoleIcon,
  InsertDriveFile as FileIcon,
  Store as MarketplaceIcon
} from '@mui/icons-material';
import { PermissionCategory, Permission } from '../../types';
import { getCategoryColor } from '../../utils/permissionUtils';
import PermissionItem from './PermissionItem';

interface PermissionCategoryCardProps {
  category: PermissionCategory;
  onEditPermission: (permission: Permission) => void;
  onDeletePermission: (permissionId: number) => void;
}

const PermissionCategoryCard: React.FC<PermissionCategoryCardProps> = ({
  category,
  onEditPermission,
  onDeletePermission
}) => {
  // Get category color
  const colorName = getCategoryColor(category.name);
  
  // Map category names to icons
  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName) {
      case 'MARKETPLACE':
        return <MarketplaceIcon />;
      case 'USER':
        return <PersonIcon />;
      case 'FABRIC':
        return <FabricIcon />;
      case 'DASHBOARD':
        return <DashboardIcon />;
      case 'ORDER':
        return <OrderIcon />;
      case 'TAG':
        return <TagIcon />;
      case 'ROLE':
        return <RoleIcon />;
      case 'FILE':
        return <FileIcon />;
      case 'PRODUCT_TYPE':
        return <CategoryIcon />;
      default:
        return <CategoryIcon />;
    }
  };

  // Get background color based on category color
  const getBackgroundColor = (colorName: string) => {
    const colorMap: Record<string, string> = {
      primary: 'rgba(25, 118, 210, 0.08)',
      secondary: 'rgba(156, 39, 176, 0.08)',
      success: 'rgba(46, 125, 50, 0.08)',
      info: 'rgba(2, 136, 209, 0.08)',
      warning: 'rgba(237, 108, 2, 0.08)',
      error: 'rgba(211, 47, 47, 0.08)',
      default: 'rgba(0, 0, 0, 0.08)'
    };
    
    return colorMap[colorName] || colorMap.default;
  };

  return (
    <Card 
      elevation={2}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4
        }
      }}
    >
      <CardHeader
        avatar={getCategoryIcon(category.name)}
        title={category.name}
        titleTypographyProps={{ variant: 'h6' }}
        subheader={`${category.permissions.length} permission${category.permissions.length !== 1 ? 's' : ''}`}
        sx={{
          backgroundColor: getBackgroundColor(colorName),
          color: `${colorName}.main`,
          '& .MuiCardHeader-avatar': {
            color: `${colorName}.main`
          },
          '& .MuiCardHeader-subheader': {
            color: `${colorName}.dark`
          }
        }}
      />
      <CardContent sx={{ flexGrow: 1, p: 0 }}>
        <List disablePadding>
          {category.permissions.map((permission, index) => (
            <React.Fragment key={permission.id}>
              <PermissionItem
                permission={permission}
                onEdit={() => onEditPermission(permission)}
                onDelete={() => onDeletePermission(permission.id)}
              />
              {index < category.permissions.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default PermissionCategoryCard;
