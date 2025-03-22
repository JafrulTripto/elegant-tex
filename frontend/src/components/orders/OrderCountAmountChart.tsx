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
        },
        ticks: {
          color: theme.palette.text.secondary,
          font: {
            family: theme.typography.fontFamily
          }
        }
      },
      y: {
        grid: {
          color: theme.palette.divider,
        },
        ticks: {
          color: theme.palette.text.secondary,
          font: {
            family: theme.typography.fontFamily
          },
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
            size: 12
          }
        }
      }
    },
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="subtitle1" fontWeight="medium">
          {activeView === 'count' ? 'Order Count' : 'Order Amount'}
        </Typography>
        <Typography variant="subtitle1" fontWeight="bold">
          Total: {formattedTotal}
        </Typography>
      </Box>
      
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" flexGrow={1} minHeight={150}>
          <CircularProgress size={30} />
        </Box>
      ) : (
        <Box sx={{ position: 'relative', height: 400, width: '100%' }}>
          {data.length > 0 ? (
            <Bar options={chartOptions} data={barData} />
          ) : (
            <Box 
              display="flex" 
              justifyContent="center" 
              alignItems="center" 
              height="100%"
            >
              <Typography variant="body2" color="text.secondary">
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Order Count and Amount</Typography>
        <Box display="flex" alignItems="center" gap={2}>
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
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper 
        sx={{ 
          p: 2, 
          flexGrow: 1,
          minHeight: 450,
          mt: 2,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: theme.palette.mode === 'dark' ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.1)',
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
