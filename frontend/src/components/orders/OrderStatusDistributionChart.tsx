import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  useTheme
} from '@mui/material';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import orderService from '../../services/order.service';
import { OrderStatusCount, ORDER_STATUS_DISPLAY } from '../../types/order';
import { getStatusColor } from '../../utils/statusConfig';
import { useTimeline } from '../../contexts/TimelineContext';
import { useOrderType } from '../../contexts/OrderTypeContext';
import { useBusinessUnit } from '../../contexts/BusinessUnitContext';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

const OrderStatusDistributionChart: React.FC = () => {
  const theme = useTheme();
  const { currentRange } = useTimeline();
  const { currentOrderType } = useOrderType();
  const { selectedBusinessUnit } = useBusinessUnit();
  const [statusCounts, setStatusCounts] = useState<OrderStatusCount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrderStatusCounts();
  }, [currentRange, currentOrderType, selectedBusinessUnit]);

  const fetchOrderStatusCounts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Convert dates to ISO string format for API
      const startDate = currentRange.startDate.toISOString().split('T')[0];
      const endDate = currentRange.endDate.toISOString().split('T')[0];
      
      // Use the enhanced API with date range and order type filtering
      const data = await orderService.getOrderStatusCounts(
        false, // currentMonth - not used when we provide date range
        startDate,
        endDate,
        currentOrderType,
        selectedBusinessUnit || undefined
      );
      
      setStatusCounts(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load order status counts');
      setLoading(false);
    }
  };

  // Calculate total orders
  const totalOrders = statusCounts.reduce((sum, item) => sum + item.count, 0);

  // Prepare data for Chart.js
  const labels = statusCounts.map(item => ORDER_STATUS_DISPLAY[item.status as keyof typeof ORDER_STATUS_DISPLAY] || item.status);
  const counts = statusCounts.map(item => item.count);
  const backgroundColor = statusCounts.map(item => getStatusColor(item.status, theme.palette.mode));
  
  const chartData = {
    labels,
    datasets: [
      {
        data: counts,
        backgroundColor,
        borderColor: theme.palette.background.paper,
        borderWidth: 2,
        hoverOffset: 15
      }
    ]
  };
  
  // Determine if we're on a small screen
  const isSmallScreen = window.innerWidth < 600;
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: isSmallScreen ? 'bottom' as const : 'right' as const,
        align: 'start' as const,
        labels: {
          color: theme.palette.text.primary,
          font: {
            family: theme.typography.fontFamily,
            size: isSmallScreen ? 9 : 10
          },
          padding: isSmallScreen ? 5 : 10,
          boxWidth: isSmallScreen ? 10 : 12,
          boxHeight: isSmallScreen ? 10 : 12
        }
      },
      tooltip: {
        backgroundColor: theme.palette.mode === 'dark' 
          ? 'rgba(0, 0, 0, 0.8)' 
          : 'rgba(255, 255, 255, 0.8)',
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.primary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
        padding: isSmallScreen ? 6 : 8,
        displayColors: true,
        titleFont: {
          size: isSmallScreen ? 10 : 11
        },
        bodyFont: {
          size: isSmallScreen ? 10 : 11
        },
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    cutout: isSmallScreen ? '60%' : '65%',
    layout: {
      padding: {
        left: isSmallScreen ? 2 : 5,
        right: isSmallScreen ? 2 : 5,
        top: isSmallScreen ? 2 : 5,
        bottom: isSmallScreen ? 15 : 5 // Extra padding at bottom for legend on small screens
      }
    }
  };

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        mb={1} // Reduced from mb={2}
        sx={{ 
          borderBottom: `1px solid ${theme.palette.divider}`,
          pb: 0.75
        }}
      >
        <Typography 
          variant="subtitle1" 
          fontWeight="medium"
          sx={{ fontSize: '0.95rem' }}
        >
          Order Status Distribution ({currentRange.label})
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
            mb: 1, // Reduced from mb={2}
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
          <CircularProgress size={30} /> {/* Smaller loading indicator */}
        </Box>
      ) : (
        <Paper 
          sx={{ 
            p: 1.5, // Reduced from p: 2
            flexGrow: 1,
            minHeight: 280, // Reduced from 300
            display: 'flex',
            flexDirection: 'column',
            boxShadow: theme.palette.mode === 'dark' ? '0 2px 10px rgba(0,0,0,0.3)' : '0 2px 10px rgba(0,0,0,0.08)',
            transition: 'box-shadow 0.3s ease-in-out'
          }}
        >
          {chartData.labels.length > 0 ? (
            <Box sx={{ position: 'relative', height: '100%', width: '100%', display: 'flex' }}>
              <Doughnut 
                options={chartOptions} 
                data={chartData} 
              />
              {/* Center content */}
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '40%', // Adjusted to account for legend on right
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                  pointerEvents: 'none' // Allows clicks to pass through to the chart
                }}
              >
                <Typography 
                  variant="h4" 
                  fontWeight="bold"
                  sx={{ fontSize: '1.75rem', lineHeight: 1.2 }}
                >
                  {totalOrders}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ fontSize: '0.75rem' }}
                >
                  Total Orders
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box 
              display="flex" 
              justifyContent="center" 
              alignItems="center" 
              height="100%"
            >
              <Typography variant="body2" color="text.secondary">
                No order status data available
              </Typography>
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default OrderStatusDistributionChart;
