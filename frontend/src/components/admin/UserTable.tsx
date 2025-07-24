import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  IconButton,
  Box,
  Tooltip,
  useTheme,
  alpha,
  Typography
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as VerifiedIcon,
  Cancel as UnverifiedIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { User } from '../../types';
import { SortableTableHead, StatusChip } from '../common';
import UserAvatar from './UserAvatar';
import type { Column } from '../common';

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (userId: number) => void;
  onVerify: (userId: number) => void;
  onViewDetails?: (userId: number) => void;
  sortBy: string;
  sortDir: 'asc' | 'desc';
  onSort: (column: string) => void;
  loading?: boolean;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  onEdit,
  onDelete,
  onVerify,
  onViewDetails,
  sortBy,
  sortDir,
  onSort,
  loading = false
}) => {
  const theme = useTheme();

  // Helper function to format last login time
  const formatLastLogin = (lastLoginTime?: string) => {
    if (!lastLoginTime) return 'Never';
    
    const loginDate = new Date(lastLoginTime);
    const now = new Date();
    const diffInMs = now.getTime() - loginDate.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return loginDate.toLocaleDateString();
  };

  // Define table columns
  const columns: Column[] = [
    { id: 'avatar', label: '', sortable: false },
    { id: 'firstName', label: 'Name', sortable: true },
    { id: 'phone', label: 'Phone', sortable: true },
    { id: 'email', label: 'Email', sortable: true },
    { id: 'roles', label: 'Roles', sortable: false },
    { id: 'lastLoginTime', label: 'Last Login', sortable: true },
    { id: 'accountVerified', label: 'Status', sortable: true },
    { id: 'actions', label: 'Actions', sortable: false, align: 'right' }
  ];

  return (
    <TableContainer 
      component={Paper} 
      elevation={2}
      sx={{ 
        borderRadius: 1.25,
        position: 'relative',
        overflow: 'hidden',
        transition: 'box-shadow 0.2s ease-in-out',
        '&:hover': {
          boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.08)}`
        }
      }}
    >
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            zIndex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        />
      )}
      
      <Table>
        <SortableTableHead
          columns={columns}
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={onSort}
        />
        
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} align="center">
                No users found
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow 
                key={user.id}
                sx={{ 
                  '&:hover': { 
                    backgroundColor: theme.palette.action.hover 
                  },
                  transition: 'background-color 0.2s ease'
                }}
              >
                {/* Avatar Column */}
                <TableCell sx={{ width: 60 }}>
                  <UserAvatar 
                    user={user} 
                    size="small"
                    onClick={onViewDetails ? () => onViewDetails(user.id) : undefined}
                  />
                </TableCell>
                
                {/* Name Column */}
                <TableCell>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body2" fontWeight={500}>
                      {user.firstName} {user.lastName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ID: {user.id}
                    </Typography>
                  </Box>
                </TableCell>
                
                {/* Phone Column */}
                <TableCell>{user.phone}</TableCell>
                
                {/* Email Column */}
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {user.email}
                    {user.emailVerified ? (
                      <Tooltip title="Email Verified">
                        <VerifiedIcon color="success" fontSize="small" />
                      </Tooltip>
                    ) : (
                      <Tooltip title="Email Not Verified">
                        <UnverifiedIcon color="error" fontSize="small" />
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
                
                {/* Roles Column */}
                <TableCell>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {user.roles.map((role) => (
                      <Box
                        key={role}
                        sx={{
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          backgroundColor: role === 'ROLE_ADMIN' 
                            ? theme.palette.primary.main + '20'
                            : theme.palette.success.main + '20',
                          color: role === 'ROLE_ADMIN'
                            ? theme.palette.primary.main
                            : theme.palette.text.secondary,
                          borderRadius: 1.25,
                          px: 1,
                          py: 0.25,
                          display: 'inline-block',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {role.replace('ROLE_', '')}
                      </Box>
                    ))}
                  </Box>
                </TableCell>
                
                {/* Last Login Column */}
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {formatLastLogin(user.lastLoginTime)}
                  </Typography>
                </TableCell>
                
                {/* Status Column */}
                <TableCell>
                  <StatusChip
                    status={user.accountVerified ? 'active' : 'inactive'}
                    customLabel={user.accountVerified ? 'Active' : 'Inactive'}
                  />
                </TableCell>
                
                {/* Actions Column */}
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    {onViewDetails && (
                      <IconButton
                        color="info"
                        size="small"
                        onClick={() => onViewDetails(user.id)}
                        sx={{ 
                          '&:hover': { backgroundColor: theme.palette.info.light + '20' }
                        }}
                      >
                        <Tooltip title="View Details">
                          <ViewIcon fontSize="small" />
                        </Tooltip>
                      </IconButton>
                    )}
                    
                    <IconButton
                      color="primary"
                      size="small"
                      onClick={() => onEdit(user)}
                      sx={{ 
                        '&:hover': { backgroundColor: theme.palette.primary.light + '20' }
                      }}
                    >
                      <Tooltip title="Edit User">
                        <EditIcon fontSize="small" />
                      </Tooltip>
                    </IconButton>
                    
                    {!user.accountVerified && (
                      <IconButton
                        color="success"
                        size="small"
                        onClick={() => onVerify(user.id)}
                        sx={{ 
                          '&:hover': { backgroundColor: theme.palette.success.light + '20' }
                        }}
                      >
                        <Tooltip title="Activate Account">
                          <VerifiedIcon fontSize="small" />
                        </Tooltip>
                      </IconButton>
                    )}
                    
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => onDelete(user.id)}
                      sx={{ 
                        '&:hover': { backgroundColor: theme.palette.error.light + '20' }
                      }}
                    >
                      <Tooltip title="Delete User">
                        <DeleteIcon fontSize="small" />
                      </Tooltip>
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default UserTable;
