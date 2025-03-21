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
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import orderService from '../../services/order.service';
import MonthYearSelector, { MonthSelectorOption } from '../common/MonthYearSelector';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface MarketplaceOrderStatistics {
  marketplaceId: number;
  name: string;
  totalAmount: number;
}

const MarketplaceComparisonChart: React.FC = () => {
  const theme = useTheme();
  const [marketplaceStats, setMarketplaceStats] = useState<MarketplaceOrderStatistics[]>([]);
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

  useEffect(() => {
    fetchMarketplaceOrderStatistics();
  }, [selectedValue, isFullYear]);

  const fetchMarketplaceOrderStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let data;
      if (isFullYear) {
        // Use existing method for full year
        data = await orderService.getMarketplaceOrderStatistics(false);
      } else {
        // Parse month and year from selected value
        const [month, year] = selectedValue.split('-').map(Number);
        // Use new method for specific month
        data = await orderService.getMarketplaceOrderStatisticsByMonth(month, year);
      }
      
      setMarketplaceStats(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load marketplace order statistics');
      setLoading(false);
    }
  };

  const handleMonthChange = (value: string, fullYear: boolean) => {
    setSelectedValue(value);
    setIsFullYear(fullYear);
  };

  // Prepare data for Chart.js
  const labels = marketplaceStats.map(stat => stat.name);
  const amounts = marketplaceStats.map(stat => parseFloat(stat.totalAmount.toFixed(2)));
  
  // Configure chart options based on theme
  const chartOptions = {
    animation: {
      duration: 1000,
      easing: 'easeOutQuart' as const
    },
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: theme.palette.text.primary,
          font: {
            family: theme.typography.fontFamily,
            size: 12
          }
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
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', { 
                style: 'currency', 
                currency: 'USD' 
              }).format(context.parsed.y);
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
          callback: function(value: any) {
            return '$' + value;
          }
        }
      }
    }
  };
  
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Total Amount',
        data: amounts,
        backgroundColor: theme.palette.mode === 'dark' 
          ? 'rgba(80, 200, 200, 0.7)' 
          : theme.palette.primary.main + '99', // Add transparency
        borderColor: theme.palette.mode === 'dark'
          ? 'rgba(80, 200, 200, 1)'
          : theme.palette.primary.main,
        borderWidth: 1,
        borderRadius: 6,
        maxBarThickness: 50,
        hoverBackgroundColor: theme.palette.mode === 'dark'
          ? 'rgba(75, 192, 192, 0.9)'
          : theme.palette.primary.dark + 'cc',
      }
    ]
  };

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" >
        <Typography variant="h6">Marketplace Order Comparison</Typography>
        <MonthYearSelector
          selectedValue={selectedValue}
          options={monthOptions}
          onChange={handleMonthChange}
        />
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
            <Box sx={{ position: 'relative', height: '100%', width: '100%' }}>
              <Bar 
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
              <Typography variant="body1" color="text.secondary">
                No data available for this time period
              </Typography>
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default MarketplaceComparisonChart;
