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
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import orderService, { MonthlyOrderData } from '../../services/order.service';
import { useTimeline } from '../../contexts/TimelineContext';
import { useOrderType } from '../../contexts/OrderTypeContext';
import { useBusinessUnit } from '../../contexts/BusinessUnitContext';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const LastMonthOrdersChart: React.FC = () => {
  const theme = useTheme();
  const { currentRange } = useTimeline();
  const { currentOrderType } = useOrderType();
  const { selectedBusinessUnit } = useBusinessUnit();
  const [orderData, setOrderData] = useState<MonthlyOrderData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrderData();
  }, [currentRange, currentOrderType, selectedBusinessUnit]);

  const fetchOrderData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Convert dates to ISO string format for API
      const startDate = currentRange.startDate.toISOString().split('T')[0];
      const endDate = currentRange.endDate.toISOString().split('T')[0];
      
      // Use the enhanced API with date range and order type filtering
      const data = await orderService.getMonthlyOrderCountAndAmount(
        undefined, // month
        undefined, // year
        false, // currentMonth - not used when we provide date range
        startDate,
        endDate,
        currentOrderType,
        selectedBusinessUnit || undefined
      );
      
      // Convert to the expected format for this chart
      const formattedData = data.map(item => ({
        date: item.date,
        count: item.count
      }));
      
      setOrderData(formattedData);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load order data');
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Prepare data for Chart.js
  const labels = orderData.map(item => formatDate(item.date));
  const counts = orderData.map(item => item.count);
  
  // Configure chart options based on theme
  const chartOptions = {
    animation: {
      duration: 800, // Reduced from 1000
      easing: 'easeOutQuart' as const
    },
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        align: 'end' as const,
        labels: {
          color: theme.palette.text.primary,
          font: {
            family: theme.typography.fontFamily,
            size: 10 // Reduced from 12
          },
          boxWidth: 12, // Smaller color boxes
          boxHeight: 12,
          padding: 10 // Reduced padding
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
        padding: 8, // Reduced from 10
        displayColors: true,
        titleFont: {
          size: 11
        },
        bodyFont: {
          size: 11
        },
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y + ' orders';
            }
            return label;
          }
        }
      },
      title: {
        display: false
      }
    },
    scales: {
      x: {
        grid: {
          color: theme.palette.divider,
          drawBorder: false,
          display: true,
          drawOnChartArea: true,
          drawTicks: false
        },
        ticks: {
          color: theme.palette.text.secondary,
          font: {
            family: theme.typography.fontFamily,
            size: 9 // Smaller font
          },
          maxRotation: 0, // Keep labels horizontal
          padding: 5 // Reduced padding
        }
      },
      y: {
        grid: {
          color: theme.palette.divider,
          drawBorder: false,
          display: true,
          drawOnChartArea: true,
          drawTicks: false
        },
        ticks: {
          color: theme.palette.text.secondary,
          font: {
            family: theme.typography.fontFamily,
            size: 9 // Smaller font
          },
          stepSize: 1,
          beginAtZero: true,
          padding: 5 // Reduced padding
        }
      }
    },
    layout: {
      padding: {
        left: 5,
        right: 5,
        top: 5,
        bottom: 5
      }
    }
  };
  
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Orders',
        data: counts,
        borderColor: theme.palette.primary.main,
        backgroundColor: theme.palette.mode === 'dark' 
          ? 'rgba(80, 200, 200, 0.15)' // Reduced opacity 
          : 'rgba(25, 118, 210, 0.08)', // Reduced opacity
        borderWidth: 1.5, // Reduced from 2
        pointBackgroundColor: theme.palette.primary.main,
        pointBorderColor: theme.palette.background.paper,
        pointBorderWidth: 1.5, // Reduced from 2
        pointRadius: 3, // Reduced from 4
        pointHoverRadius: 5, // Reduced from 6
        tension: 0.3,
        fill: true
      }
    ]
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
          Orders Trend ({currentRange.label})
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
            <Box sx={{ position: 'relative', height: '100%', width: '100%' }}>
              <Line 
                options={chartOptions} 
                data={chartData} 
              />
            </Box>
          ) : (
            <Box 
              display="flex" 
              justifyContent="center" 
              alignItems="center" 
              height="100%"
            >
              <Typography variant="body2" color="text.secondary">
                No order data available for the last month
              </Typography>
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default LastMonthOrdersChart;
