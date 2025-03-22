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
import { OrderStatusCount, ORDER_STATUS_COLORS } from '../../types/order';

interface MonthlyOrderStatusCardProps {
  userId?: number; // Optional - if provided, shows only user's orders
  title?: string; // Optional custom title
}

const MonthlyOrderStatusCard: React.FC<MonthlyOrderStatusCardProps> = ({
  userId
}) => {
  const theme = useTheme();


  const [statusCounts, setStatusCounts] = useState<OrderStatusCount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<'DELIVERED' | 'RETURNED'>('DELIVERED');

  useEffect(() => {
    fetchOrderStatusCounts();
  }, [userId]);

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
        // Fetch all order status counts
        data = await orderService.getOrderStatusCounts(true);
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
  const deliveredColor = ORDER_STATUS_COLORS['DELIVERED'] || '#52c41a';
  const returnedColor = ORDER_STATUS_COLORS['RETURNED'] || '#fa8c16';

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
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography variant="h4" component="div" fontWeight="bold">
              {selectedStatus === 'DELIVERED' ? deliveredCount : returnedCount}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedStatus === 'DELIVERED' ? 'Delivered Orders' : 'Returned Orders'}
            </Typography>
          </Box>
          <Box
            sx={{
              bgcolor: selectedStatus === 'DELIVERED' ? deliveredColor : returnedColor,
              color: '#fff',
              width: 48,
              height: 48,
              borderRadius: '50%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {selectedStatus === 'DELIVERED' ? <DeliveredIcon /> : <ReturnedIcon />}
          </Box>

        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" py={3}>
            <CircularProgress size={40} />
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              transition: 'all 0.3s ease',
            }}
          >

            <ToggleButtonGroup
              value={selectedStatus}
              exclusive
              onChange={handleStatusToggle}
              size="small"
              aria-label="Order status filter"
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
