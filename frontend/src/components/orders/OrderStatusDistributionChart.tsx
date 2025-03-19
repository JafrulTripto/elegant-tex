import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
  Alert,
  useTheme
} from '@mui/material';
import { CalendarMonth, CalendarToday } from '@mui/icons-material';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import orderService from '../../services/order.service';
import { OrderStatusCount, ORDER_STATUS_COLORS, ORDER_STATUS_DISPLAY } from '../../types/order';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

const OrderStatusDistributionChart: React.FC = () => {
  const theme = useTheme();
  const [statusCounts, setStatusCounts] = useState<OrderStatusCount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState<boolean>(true);

  useEffect(() => {
    fetchOrderStatusCounts();
  }, [currentMonth]);

  const fetchOrderStatusCounts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderService.getOrderStatusCounts(currentMonth);
      setStatusCounts(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load order status counts');
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

  // Calculate total orders
  const totalOrders = statusCounts.reduce((sum, item) => sum + item.count, 0);

  // Prepare data for Chart.js
  const labels = statusCounts.map(item => ORDER_STATUS_DISPLAY[item.status as keyof typeof ORDER_STATUS_DISPLAY] || item.status);
  const counts = statusCounts.map(item => item.count);
  const backgroundColor = statusCounts.map(item => ORDER_STATUS_COLORS[item.status as keyof typeof ORDER_STATUS_COLORS] || '#757575');
  
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
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: theme.palette.text.primary,
          font: {
            family: theme.typography.fontFamily,
            size: 12
          },
          padding: 20
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
        padding: 10,
        displayColors: true,
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
    cutout: '60%'
  };

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Order Status Distribution</Typography>
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
        <Paper 
          sx={{ 
            p: 2, 
            flexGrow: 1,
            minHeight: 300,
            mt: 2,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: theme.palette.mode === 'dark' ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.1)',
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
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                  pointerEvents: 'none' // Allows clicks to pass through to the chart
                }}
              >
                <Typography variant="h4" fontWeight="bold">
                  {totalOrders}
                </Typography>
                <Typography variant="body2" color="text.secondary">
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
              <Typography variant="body1" color="text.secondary">
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
