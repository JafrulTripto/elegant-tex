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
  CircularProgress,
  alpha
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import { Customer, CustomerRequest } from '../../types/customer';
import { SortableTableHead, AddressDisplay } from '../common';
import type { Column } from '../common';

interface CustomerTableProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onDelete: (customerId: number) => void;
  sortBy: string;
  sortDir: 'asc' | 'desc';
  onSort: (column: string) => void;
  loading?: boolean;
}

const CustomerTable: React.FC<CustomerTableProps> = ({
  customers,
  onEdit,
  onDelete,
  sortBy,
  sortDir,
  onSort,
  loading = false
}) => {
  const theme = useTheme();

  // Define table columns
  const columns: Column[] = [
    { id: 'name', label: 'Name', sortable: true },
    { id: 'phone', label: 'Phone', sortable: true },
    { id: 'address', label: 'Address', sortable: false },
    { id: 'alternativePhone', label: 'Alternative Phone', sortable: false },
    { id: 'facebookId', label: 'Facebook ID', sortable: false },
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
        >
          <CircularProgress />
        </Box>
      )}
      
      <Table>
        <SortableTableHead
          columns={columns}
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={onSort}
        />
        
        <TableBody>
          {customers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center">
                No customers found
              </TableCell>
            </TableRow>
          ) : (
            customers.map((customer) => (
              <TableRow 
                key={customer.id}
                sx={{ 
                  '&:hover': { 
                    backgroundColor: theme.palette.action.hover 
                  },
                  transition: 'background-color 0.2s ease'
                }}
              >
                {/* Name Column */}
                <TableCell>{customer.name}</TableCell>
                
                {/* Phone Column */}
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <PhoneIcon fontSize="small" sx={{ mr: 1 }} />
                    {customer.phone}
                  </Box>
                </TableCell>
                
                {/* Address Column */}
                <TableCell>
                  <AddressDisplay 
                    customer={customer} 
                    variant="body2" 
                    showLabel={false} 
                  />
                </TableCell>
                
                {/* Alternative Phone Column */}
                <TableCell>{customer.alternativePhone || '-'}</TableCell>
                
                {/* Facebook ID Column */}
                <TableCell>{customer.facebookId || '-'}</TableCell>
                
                {/* Actions Column */}
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <IconButton
                      color="primary"
                      size="small"
                      onClick={() => onEdit(customer)}
                      sx={{ 
                        '&:hover': { backgroundColor: theme.palette.primary.light + '20' }
                      }}
                    >
                      <Tooltip title="Edit Customer">
                        <EditIcon fontSize="small" />
                      </Tooltip>
                    </IconButton>
                    
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => onDelete(customer.id)}
                      sx={{ 
                        '&:hover': { backgroundColor: theme.palette.error.light + '20' }
                      }}
                    >
                      <Tooltip title="Delete Customer">
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

export default CustomerTable;
