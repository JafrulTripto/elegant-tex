import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
  useTheme
} from '@mui/material';
import { LocalShipping as DeliveredIcon, AssignmentReturn as ReturnedIcon } from '@mui/icons-material';
import orderService from '../../services/order.service';
import { OrderStatusCount } from '../../types/order';
import { getStatusColor } from '../../utils/statusConfig';
import { useTimeline } from '../../contexts/TimelineContext';
import { useOrderType } from '../../contexts/OrderTypeContext';

interface MonthlyOrderStatusCardProps {
  userId?: number; // Optional - if provided, shows only user's orders
  title?: string; // Optional custom title
}

const MonthlyOrderStatusCard: React.FC<MonthlyOrderStatusCardProps> = ({
  userId
}) => {
  const theme = useTheme();
  const { currentRange } = useTimeline();
  const { currentOrderType } = useOrderType();
  const [statusCounts, setStatusCounts] = useState<OrderStatusCount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<'DELIVERED' | 'RETURNED'>('DELIVERED');

  useEffect(() => {
    fetchOrderStatusCounts();
  }, [userId, currentRange, currentOrderType]);

  const fetchOrderStatusCounts = async () => {
    try {
      setLoading(true);
      setError(null);

      let data;

      // If userId is provided, fetch user-specific data
      if (userId) {
        try {
          data = await orderService.getUserOrderStatusCounts(userId, true);
        } catch (apiError) {
          // Fallback if user-specific endpoint fails
          console.warn('User-specific order status API not available, falling back to client-side filtering');

          // Get all orders to filter by user
          const ordersResponse = await orderService.getAllOrders(0, 1000);
          const userOrders = ordersResponse.content.filter(order =>
            order.createdBy && order.createdBy.id === userId
          );

          // Count orders by status for this user
          const statusMap = new Map<string, number>();
          userOrders.forEach(order => {
            const count = statusMap.get(order.status) || 0;
            statusMap.set(order.status, count + 1);
          });

          // Convert to OrderStatusCount array
          data = Array.from(statusMap.entries()).map(([status, count]) => ({
            status,
            count
          }));
        }
      } else {
        // Convert dates to ISO string format for API
        const startDate = currentRange.startDate.toISOString().split('T')[0];
        const endDate = currentRange.endDate.toISOString().split('T')[0];
        
        // Fetch all order status counts with date range and order type filtering
        data = await orderService.getOrderStatusCounts(
          false, // currentMonth - not used when we provide date range
          startDate,
          endDate,
          currentOrderType
        );
      }

      setStatusCounts(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load order status counts');
      setLoading(false);
    }
  };

  // Get delivered and returned order counts
  const deliveredCount = statusCounts.find(item =>
    item.status === 'DELIVERED' || item.status === 'Delivered'
  )?.count || 0;

  const returnedCount = statusCounts.find(item =>
    item.status === 'RETURNED' || item.status === 'Returned'
  )?.count || 0;

  // Get status colors
  const deliveredColor = getStatusColor('DELIVERED', theme.palette.mode);
  const returnedColor = getStatusColor('RETURNED', theme.palette.mode);

  // Handle toggle change
  const handleStatusToggle = (
    _: React.MouseEvent<HTMLElement>,
    newStatus: 'DELIVERED' | 'RETURNED' | null
  ) => {
    if (newStatus !== null) {
      setSelectedStatus(newStatus);
    }
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 1.5, height: '100%' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
          <Box>
            <Typography 
              variant="h4" 
              component="div" 
              fontWeight="bold"
              sx={{ 
                fontSize: '1.5rem',
                lineHeight: 1.2,
                mb: 0.5
              }}
            >
              {selectedStatus === 'DELIVERED' ? deliveredCount : returnedCount}
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontSize: '0.75rem' }}
            >
              {selectedStatus === 'DELIVERED' ? 'Delivered Orders' : 'Returned Orders'}
            </Typography>
          </Box>
          <Box
            sx={{
              bgcolor: selectedStatus === 'DELIVERED' ? deliveredColor : returnedColor,
              color: '#fff',
              width: 40, // Reduced from 48
              height: 40, // Reduced from 48
              borderRadius: '50%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {selectedStatus === 'DELIVERED' ? 
              <DeliveredIcon sx={{ fontSize: '1.25rem' }} /> : 
              <ReturnedIcon sx={{ fontSize: '1.25rem' }} />
            }
          </Box>
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
          <Box display="flex" justifyContent="center" alignItems="center" py={1.5}>
            <CircularProgress size={30} /> {/* Smaller loading indicator */}
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-start', // Changed from space-between
              alignItems: 'center',
              transition: 'all 0.3s ease',
              mt: 0.5
            }}
          >
            <ToggleButtonGroup
              value={selectedStatus}
              exclusive
              onChange={handleStatusToggle}
              size="small"
              aria-label="Order status filter"
              sx={{ 
                '& .MuiToggleButton-root': {
                  py: 0.5, // Reduced padding
                  px: 1.5,
                  fontSize: '0.75rem', // Smaller font
                  textTransform: 'none'
                }
              }}
            >
              <ToggleButton
                value="DELIVERED"
                aria-label="Delivered orders"
                sx={{
                  '&.Mui-selected': {
                    color: deliveredColor,
                    borderColor: deliveredColor,
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(82, 196, 26, 0.1)' : 'rgba(82, 196, 26, 0.05)',
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(82, 196, 26, 0.2)' : 'rgba(82, 196, 26, 0.1)',
                    }
                  }
                }}
              >
                Delivered
              </ToggleButton>
              <ToggleButton
                value="RETURNED"
                aria-label="Returned orders"
                sx={{
                  '&.Mui-selected': {
                    color: returnedColor,
                    borderColor: returnedColor,
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(250, 140, 22, 0.1)' : 'rgba(250, 140, 22, 0.05)',
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(250, 140, 22, 0.2)' : 'rgba(250, 140, 22, 0.1)',
                    }
                  }
                }}
              >
                Returned
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default MonthlyOrderStatusCard;
