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
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
  TableSortLabel,
  Alert
} from '@mui/material';
import { CalendarMonth, CalendarToday } from '@mui/icons-material';
import orderService from '../../services/order.service';

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
  const [userStats, setUserStats] = useState<UserOrderStatistics[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState<boolean>(true);
  
  // Sorting
  const [sortField, setSortField] = useState<SortField>('orderCount');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  useEffect(() => {
    fetchUserOrderStatistics();
  }, [currentMonth]);

  const fetchUserOrderStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderService.getUserOrderStatistics(currentMonth);
      setUserStats(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load user order statistics');
      setLoading(false);
    }
  };

  const handleTimeRangeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newValue: boolean | null
  ) => {
    if (newValue !== null) {
      setCurrentMonth(newValue);
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">User Order Statistics</Typography>
        <ToggleButtonGroup
          value={currentMonth}
          exclusive
          onChange={handleTimeRangeChange}
          aria-label="time range"
          size="small"
        >
          <ToggleButton value={true} aria-label="current month">
            <CalendarToday sx={{ mr: 1 }} fontSize="small" />
            Month
          </ToggleButton>
          <ToggleButton value={false} aria-label="current year">
            <CalendarMonth sx={{ mr: 1 }} fontSize="small" />
            Year
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" flexGrow={1}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer 
          component={Paper} 
          sx={{ 
            flexGrow: 1, 
            minHeight: 300,
            display: 'flex',
            flexDirection: 'column',
            mt: 2
          }}
        >
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'name'}
                    direction={sortField === 'name' ? sortDirection : 'asc'}
                    onClick={() => handleSort('name')}
                  >
                    Name
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'email'}
                    direction={sortField === 'email' ? sortDirection : 'asc'}
                    onClick={() => handleSort('email')}
                  >
                    Email
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={sortField === 'orderCount'}
                    direction={sortField === 'orderCount' ? sortDirection : 'asc'}
                    onClick={() => handleSort('orderCount')}
                  >
                    Orders
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={sortField === 'totalAmount'}
                    direction={sortField === 'totalAmount' ? sortDirection : 'asc'}
                    onClick={() => handleSort('totalAmount')}
                  >
                    Total Amount
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedUserStats.length > 0 ? (
                sortedUserStats.map((user) => (
                  <TableRow key={user.userId} hover>
                    <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell align="right">{user.orderCount}</TableCell>
                    <TableCell align="right">${user.totalAmount.toFixed(2)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
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
