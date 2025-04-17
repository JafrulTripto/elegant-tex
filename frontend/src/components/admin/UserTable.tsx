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
  alpha
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as VerifiedIcon,
  Cancel as UnverifiedIcon
} from '@mui/icons-material';
import { User } from '../../types';
import { SortableTableHead, StatusChip } from '../common';
import type { Column } from '../common';

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (userId: number) => void;
  onVerify: (userId: number) => void;
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
  sortBy,
  sortDir,
  onSort,
  loading = false
}) => {
  const theme = useTheme();

  // Define table columns
  const columns: Column[] = [
    { id: 'firstName', label: 'Name', sortable: true },
    { id: 'phone', label: 'Phone', sortable: true },
    { id: 'email', label: 'Email', sortable: true },
    { id: 'roles', label: 'Roles', sortable: false },
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
              <TableCell colSpan={6} align="center">
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
                {/* Name Column */}
                <TableCell>
                  {user.firstName} {user.lastName}
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
                            : theme.palette.grey[200],
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
                    
                    {!user.emailVerified && (
                      <IconButton
                        color="success"
                        size="small"
                        onClick={() => onVerify(user.id)}
                        sx={{ 
                          '&:hover': { backgroundColor: theme.palette.success.light + '20' }
                        }}
                      >
                        <Tooltip title="Verify Email">
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
