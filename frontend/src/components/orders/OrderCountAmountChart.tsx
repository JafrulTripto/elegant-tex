import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  useTheme,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import orderService, { MonthlyOrderCountAmount } from '../../services/order.service';
import MonthYearSelector, { MonthSelectorOption } from '../common/MonthYearSelector';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Combined Chart Component
interface ChartProps {
  data: MonthlyOrderCountAmount[];
  labels: string[];
  loading: boolean;
  activeView: 'count' | 'amount';
}

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
};

const CombinedChart: React.FC<ChartProps> = ({ data, labels, loading, activeView }) => {
  const theme = useTheme();
  
  // Extract data based on active view
  const chartData = activeView === 'count' 
    ? data.map(item => item.count)
    : data.map(item => parseFloat(item.amount.toString()));
  
  // Calculate total
  const total = chartData.reduce((sum, value) => sum + value, 0);
  
  // Configure chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: theme.palette.mode === 'dark' 
          ? 'rgba(0, 0, 0, 0.8)' 
          : 'rgba(255, 255, 255, 0.8)',
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.primary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
        padding: 8,
        titleFont: {
          size: 11
        },
        bodyFont: {
          size: 11
        },
        callbacks: {
          label: function(context: any) {
            if (activeView === 'count') {
              return `Orders: ${context.parsed.y}`;
            } else {
              return `Amount: ${formatCurrency(context.parsed.y)}`;
            }
          }
        }
      },
      legend: {
        display: false
      },
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
          padding: 5, // Reduced padding
          ...(activeView === 'amount' && {
            callback: function(value: any) {
              return formatCurrency(value);
            }
          }),
          ...(activeView === 'count' && {
            stepSize: 1,
            beginAtZero: true
          })
        },
        title: {
          display: true,
          text: activeView === 'count' ? 'Order Count' : 'Order Amount',
          color: theme.palette.text.primary,
          font: {
            family: theme.typography.fontFamily,
            size: 10 // Reduced from 12
          },
          padding: { top: 0, bottom: 5 } // Reduced padding
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
    },
    barPercentage: 0.7, // Make bars slightly thinner
    categoryPercentage: 0.8 // Adjust spacing between bar groups
  };
  
  const barData = {
    labels,
    datasets: [
      {
        label: activeView === 'count' ? 'Order Count' : 'Order Amount',
        data: chartData,
        backgroundColor: activeView === 'count' 
          ? theme.palette.primary.main 
          : theme.palette.secondary.main,
        borderColor: activeView === 'count' 
          ? theme.palette.primary.dark 
          : theme.palette.secondary.dark,
        borderWidth: 1,
      }
    ],
  };

  // Format the total value for display
  const formattedTotal = activeView === 'count' 
    ? `${total} orders` 
    : formatCurrency(total);

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        mb={0.75} // Reduced from mb={1}
      >
        <Typography 
          variant="subtitle2" 
          fontWeight="medium"
          sx={{ fontSize: '0.85rem' }}
        >
          {activeView === 'count' ? 'Order Count' : 'Order Amount'}
        </Typography>
        <Typography 
          variant="subtitle2" 
          fontWeight="bold"
          sx={{ fontSize: '0.85rem' }}
        >
          Total: {formattedTotal}
        </Typography>
      </Box>
      
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" flexGrow={1} minHeight={120}>
          <CircularProgress size={24} /> {/* Smaller loading indicator */}
        </Box>
      ) : (
        <Box sx={{ position: 'relative', height: 350, width: '100%' }}> {/* Reduced height from 400 */}
          {data.length > 0 ? (
            <Bar options={chartOptions} data={barData} />
          ) : (
            <Box 
              display="flex" 
              justifyContent="center" 
              alignItems="center" 
              height="100%"
            >
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                No order data available
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

// Main Container Component
const OrderCountAmountChart: React.FC = () => {
  const theme = useTheme();
  const [chartData, setChartData] = useState<MonthlyOrderCountAmount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // State for month/year selection
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const [selectedOption, setSelectedOption] = useState<string>(`${currentMonth}-${currentYear}`);
  const [isFullYear, setIsFullYear] = useState<boolean>(false);
  // New state for toggle between count and amount
  const [activeView, setActiveView] = useState<'count' | 'amount'>('count');
  
  // Generate month options for the selector
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
  
  // Fetch data based on selected month/year
  const fetchData = async (month?: number, year?: number, currentMonth: boolean = true) => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderService.getMonthlyOrderCountAndAmount(month, year, currentMonth);
      setChartData(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load order data');
      setLoading(false);
    }
  };
  
  // Handle month selection change
  const handleMonthChange = (value: string, fullYear: boolean) => {
    setSelectedOption(value);
    setIsFullYear(fullYear);
    
    // Determine which data to fetch based on selection
    if (fullYear) {
      // Full year data
      fetchData(undefined, undefined, false);
    } else {
      // Specific month data
      const [month, year] = value.split('-').map(Number);
      fetchData(month, year, false);
    }
  };
  
  // Initial data fetch
  useEffect(() => {
    // Fetch data for the initially selected month
    if (isFullYear) {
      fetchData(undefined, undefined, false);
    } else {
      const [month, year] = selectedOption.split('-').map(Number);
      fetchData(month, year, false);
    }
  }, []);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Prepare data for Chart.js
  const labels = chartData.map(item => formatDate(item.date));

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
          Order Count and Amount
        </Typography>
        <Box display="flex" alignItems="center" gap={1}> {/* Reduced gap from 2 */}
          <ToggleButtonGroup
            value={activeView}
            exclusive
            onChange={(_, newValue) => {
              if (newValue !== null) {
                setActiveView(newValue);
              }
            }}
            size="small"
            aria-label="Chart view"
            sx={{ 
              '& .MuiToggleButton-root': {
                py: 0.5, // Reduced padding
                px: 1.5,
                fontSize: '0.75rem', // Smaller font
                textTransform: 'none'
              }
            }}
          >
            <ToggleButton value="count" aria-label="Order Count">
              Count
            </ToggleButton>
            <ToggleButton value="amount" aria-label="Order Amount">
              Amount
            </ToggleButton>
          </ToggleButtonGroup>
          <MonthYearSelector
            selectedValue={selectedOption}
            options={monthOptions}
            onChange={handleMonthChange}
          />
        </Box>
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

      <Paper 
        sx={{ 
          p: 1.5, // Reduced from p: 2
          flexGrow: 1,
          minHeight: 380, // Reduced from 450
          display: 'flex',
          flexDirection: 'column',
          boxShadow: theme.palette.mode === 'dark' ? '0 2px 10px rgba(0,0,0,0.3)' : '0 2px 10px rgba(0,0,0,0.08)',
          transition: 'box-shadow 0.3s ease-in-out'
        }}
      >
        {/* Combined Chart */}
        <CombinedChart 
          data={chartData} 
          labels={labels} 
          loading={loading}
          activeView={activeView}
        />
      </Paper>
    </Box>
  );
};

export default OrderCountAmountChart;
