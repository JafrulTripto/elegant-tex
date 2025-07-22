import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  TableSortLabel,
  Alert,
  useTheme,
  useMediaQuery
} from '@mui/material';
import orderService from '../../services/order.service';
import { useTimeline } from '../../contexts/TimelineContext';
import { useOrderType } from '../../contexts/OrderTypeContext';

interface UserOrderStatistics {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  orderCount: number;
  totalAmount: number;
}

type SortField = 'name' | 'email' | 'orderCount' | 'totalAmount';
type SortDirection = 'asc' | 'desc';

const UserOrdersTable: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { currentRange } = useTimeline();
  const { currentOrderType } = useOrderType();
  
  const [userStats, setUserStats] = useState<UserOrderStatistics[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Sorting
  const [sortField, setSortField] = useState<SortField>('orderCount');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  useEffect(() => {
    fetchUserOrderStatistics();
  }, [currentRange, currentOrderType]);

  const fetchUserOrderStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Convert dates to ISO string format for API
      const startDate = currentRange.startDate.toISOString().split('T')[0];
      const endDate = currentRange.endDate.toISOString().split('T')[0];
      
      // Use the enhanced API with date range and order type filtering
      const data = await orderService.getUserOrderStatistics(
        false, // currentMonth - not used when we provide date range
        startDate,
        endDate,
        currentOrderType
      );
      
      setUserStats(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load user order statistics');
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    const isAsc = sortField === field && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortField(field);
  };

  const sortedUserStats = [...userStats].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'name':
        const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
        const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
        comparison = nameA.localeCompare(nameB);
        break;
      case 'email':
        comparison = a.email.toLowerCase().localeCompare(b.email.toLowerCase());
        break;
      case 'orderCount':
        comparison = a.orderCount - b.orderCount;
        break;
      case 'totalAmount':
        comparison = a.totalAmount - b.totalAmount;
        break;
      default:
        comparison = 0;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });


  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box 
        display="flex" 
        flexDirection={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between" 
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        mb={1}
        gap={{ xs: 1, sm: 0 }}
        sx={{ 
          borderBottom: `1px solid ${sortedUserStats.length > 0 ? 'transparent' : 'rgba(0, 0, 0, 0.12)'}`,
          pb: 0.75
        }}
      >
        <Typography 
          variant="subtitle1" 
          fontWeight="medium"
          sx={{ fontSize: '0.95rem' }}
        >
          User Order Statistics ({currentRange.label})
        </Typography>
        <Typography 
          variant="caption" 
          color="text.secondary"
          sx={{ fontSize: '0.75rem' }}
        >
          {currentOrderType === 'marketplace' ? 'Marketplace Orders' : 'Merchant Orders'}
        </Typography>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 1,
            py: 0.5, 
            '& .MuiAlert-message': { 
              padding: '2px 0' 
            } 
          }}
        >
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" flexGrow={1}>
          <CircularProgress size={30} />
        </Box>
      ) : (
        <TableContainer 
          component={Paper} 
          sx={{ 
            flexGrow: 1, 
            minHeight: { xs: 250, sm: 280 },
            display: 'flex',
            flexDirection: 'column',
            mt: 1,
            boxShadow: 'none',
            border: '1px solid rgba(0, 0, 0, 0.12)',
            overflowX: 'auto'
          }}
        >
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell 
                  sx={{ 
                    py: { xs: 0.75, sm: 1 },
                    px: { xs: 1, sm: 2 },
                    fontSize: { xs: '0.7rem', sm: '0.8rem' },
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <TableSortLabel
                    active={sortField === 'name'}
                    direction={sortField === 'name' ? sortDirection : 'asc'}
                    onClick={() => handleSort('name')}
                  >
                    Name
                  </TableSortLabel>
                </TableCell>
                {!isMobile && (
                  <TableCell 
                    sx={{ 
                      py: 1,
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <TableSortLabel
                      active={sortField === 'email'}
                      direction={sortField === 'email' ? sortDirection : 'asc'}
                      onClick={() => handleSort('email')}
                    >
                      Email
                    </TableSortLabel>
                  </TableCell>
                )}
                <TableCell 
                  align="right"
                  sx={{ 
                    py: { xs: 0.75, sm: 1 },
                    px: { xs: 1, sm: 2 },
                    fontSize: { xs: '0.7rem', sm: '0.8rem' },
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <TableSortLabel
                    active={sortField === 'orderCount'}
                    direction={sortField === 'orderCount' ? sortDirection : 'asc'}
                    onClick={() => handleSort('orderCount')}
                  >
                    Orders
                  </TableSortLabel>
                </TableCell>
                <TableCell 
                  align="right"
                  sx={{ 
                    py: { xs: 0.75, sm: 1 },
                    px: { xs: 1, sm: 2 },
                    fontSize: { xs: '0.7rem', sm: '0.8rem' },
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <TableSortLabel
                    active={sortField === 'totalAmount'}
                    direction={sortField === 'totalAmount' ? sortDirection : 'asc'}
                    onClick={() => handleSort('totalAmount')}
                  >
                    {isMobile ? 'Amount' : 'Total Amount'}
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedUserStats.length > 0 ? (
                sortedUserStats.map((user) => (
                  <TableRow 
                    key={user.userId} 
                    hover
                    sx={{ 
                      '& .MuiTableCell-root': { 
                        py: { xs: 0.5, sm: 0.75 },
                        px: { xs: 1, sm: 2 },
                        fontSize: { xs: '0.7rem', sm: '0.8rem' }
                      }
                    }}
                  >
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      {isMobile 
                        ? `${user.firstName.charAt(0)}. ${user.lastName}` 
                        : `${user.firstName} ${user.lastName}`}
                    </TableCell>
                    {!isMobile && (
                      <TableCell>{user.email}</TableCell>
                    )}
                    <TableCell align="right">{user.orderCount}</TableCell>
                    <TableCell align="right">${user.totalAmount.toFixed(2)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell 
                    colSpan={isMobile ? 3 : 4} 
                    align="center"
                    sx={{ py: 2, fontSize: { xs: '0.7rem', sm: '0.8rem' } }}
                  >
                    No data available for this time period
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default UserOrdersTable;
