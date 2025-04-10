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
import MonthYearSelector, { MonthSelectorOption } from '../common/MonthYearSelector';

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
  
  const [userStats, setUserStats] = useState<UserOrderStatistics[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // New state for month/year selection
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  
  // Generate month options
  const generateMonthOptions = (): MonthSelectorOption[] => {
    const options: MonthSelectorOption[] = [
      { value: 'full-year', label: 'Full Year', isFullYear: true }
    ];
    
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    // Add options for each month up to the current month
    for (let i = 0; i <= currentMonth; i++) {
      options.push({
        value: `${i}-${currentYear}`,
        label: `${monthNames[i]} ${currentYear}`,
        isFullYear: false
      });
    }
    
    return options;
  };
  
  const monthOptions = generateMonthOptions();
  const [selectedValue, setSelectedValue] = useState<string>(`${currentMonth}-${currentYear}`);
  const [isFullYear, setIsFullYear] = useState<boolean>(false);
  
  // Sorting
  const [sortField, setSortField] = useState<SortField>('orderCount');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  useEffect(() => {
    fetchUserOrderStatistics();
  }, [selectedValue, isFullYear]);

  const fetchUserOrderStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let data;
      if (isFullYear) {
        // Use existing method for full year
        data = await orderService.getUserOrderStatistics(false);
      } else {
        // Parse month and year from selected value
        const [month, year] = selectedValue.split('-').map(Number);
        // Use new method for specific month
        data = await orderService.getUserOrderStatisticsByMonth(month, year);
      }
      
      setUserStats(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load user order statistics');
      setLoading(false);
    }
  };

  const handleMonthChange = (value: string, fullYear: boolean) => {
    setSelectedValue(value);
    setIsFullYear(fullYear);
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
          User Order Statistics
        </Typography>
        <MonthYearSelector
          selectedValue={selectedValue}
          options={monthOptions}
          onChange={handleMonthChange}
        />
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
