import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  useTheme, 
  Collapse,
  IconButton,
  LinearProgress,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  ExpandMore as ExpandMoreIcon,
  Assignment as PendingIcon,
  PlayArrow as ActiveIcon,
  CheckCircle as CompleteIcon,
  Warning as IssuesIcon,
  Assessment as OverviewIcon
} from '@mui/icons-material';
import { getStatusColor, getDisplayStatus } from '../../utils/statusConfig';
import { useTimeline } from '../../contexts/TimelineContext';
import { useOrderType } from '../../contexts/OrderTypeContext';
import orderService from '../../services/order.service';

interface OrderStatusCount {
  status: string;
  count: number;
}

interface OrderStatsCardProps {
  onStatusClick?: (status: string) => void;
}

interface StatusCategory {
  key: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  statuses: string[];
  total: number;
  items: OrderStatusCount[];
}

const OrderStatsCard: React.FC<OrderStatsCardProps> = ({ onStatusClick }) => {
  const theme = useTheme();
  const { currentRange } = useTimeline();
  const { currentOrderType } = useOrderType();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [orderStatusCounts, setOrderStatusCounts] = useState<OrderStatusCount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrderStatusCounts();
  }, [currentRange, currentOrderType]);

  const fetchOrderStatusCounts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Convert dates to ISO string format for API
      const startDate = currentRange.startDate.toISOString().split('T')[0];
      const endDate = currentRange.endDate.toISOString().split('T')[0];
      
      // Fetch filtered order status counts
      const data = await orderService.getOrderStatusCounts(
        false, // not current month only
        startDate,
        endDate,
        currentOrderType === 'all' ? undefined : currentOrderType
      );
      
      setOrderStatusCounts(data || []);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load order status counts');
      setOrderStatusCounts([]);
      setLoading(false);
    }
  };

  // Ensure orderStatusCounts is always an array
  const safeOrderStatusCounts = orderStatusCounts || [];

  // Define status categories
  const statusCategories: Omit<StatusCategory, 'total' | 'items'>[] = [
    {
      key: 'pending',
      label: 'Pending Orders',
      icon: <PendingIcon />,
      color: theme.palette.info.main,
      statuses: ['ORDER_CREATED', 'APPROVED', 'BOOKING']
    },
    {
      key: 'active',
      label: 'Active Orders',
      icon: <ActiveIcon />,
      color: theme.palette.warning.main,
      statuses: ['PRODUCTION', 'QA', 'READY']
    },
    {
      key: 'complete',
      label: 'Complete Orders',
      icon: <CompleteIcon />,
      color: theme.palette.success.main,
      statuses: ['DELIVERED']
    },
    {
      key: 'issues',
      label: 'Issues',
      icon: <IssuesIcon />,
      color: theme.palette.error.main,
      statuses: ['RETURNED', 'CANCELLED']
    }
  ];

  // Process data into categories
  const processedCategories: StatusCategory[] = statusCategories.map(category => {
    const items = safeOrderStatusCounts.filter(item => 
      category.statuses.includes(item.status)
    );
    const total = items.reduce((sum, item) => sum + item.count, 0);
    
    return {
      ...category,
      total,
      items
    };
  });

  // Calculate totals
  const totalOrders = safeOrderStatusCounts.reduce((sum, item) => sum + item.count, 0);
  const completedOrders = processedCategories.find(cat => cat.key === 'complete')?.total || 0;
  const issueOrders = processedCategories.find(cat => cat.key === 'issues')?.total || 0;
  const activeOrders = processedCategories.find(cat => cat.key === 'active')?.total || 0;
  
  const successRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;
  const issueRate = totalOrders > 0 ? Math.round((issueOrders / totalOrders) * 100) : 0;
  const activeRate = totalOrders > 0 ? Math.round((activeOrders / totalOrders) * 100) : 0;

  const toggleCategory = (categoryKey: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryKey)) {
      newExpanded.delete(categoryKey);
    } else {
      newExpanded.add(categoryKey);
    }
    setExpandedCategories(newExpanded);
  };

  const handleStatusClick = (status: string) => {
    if (onStatusClick) {
      onStatusClick(status);
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ width: '100%' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600,
            color: theme.palette.text.primary
          }}
        >
          Orders by Status
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
          {currentRange.label} • {currentOrderType === 'all' ? 'All Orders' : 
           currentOrderType === 'marketplace' ? 'Marketplace' : 'Merchant'}
        </Typography>
      </Box>
      
      <Grid container spacing={2}>
        {/* Status Category Cards */}
        {processedCategories.map((category) => (
          <Grid size={{xs:12, sm:6, md:3}} key={category.key}>
            <Card 
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[4]
                }
              }}
              onClick={() => toggleCategory(category.key)}
            >
              <CardContent sx={{ p: 2 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box 
                      sx={{ 
                        color: category.color,
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {category.icon}
                    </Box>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {category.label}
                    </Typography>
                  </Box>
                  <IconButton 
                    size="small"
                    sx={{
                      transform: expandedCategories.has(category.key) ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s'
                    }}
                  >
                    <ExpandMoreIcon fontSize="small" />
                  </IconButton>
                </Box>

                <Typography 
                  variant="h4" 
                  fontWeight="bold" 
                  color={category.color}
                  sx={{ mb: 1 }}
                >
                  {category.total}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {category.total === 1 ? 'Order' : 'Orders'}
                </Typography>

                {/* Progress bar showing relative size */}
                {totalOrders > 0 && (
                  <LinearProgress
                    variant="determinate"
                    value={(category.total / totalOrders) * 100}
                    sx={{
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: theme.palette.grey[200],
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: category.color,
                        borderRadius: 2
                      }
                    }}
                  />
                )}

                {/* Expandable details */}
                <Collapse in={expandedCategories.has(category.key)}>
                  <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                    {category.items.map((item) => (
                      <Box 
                        key={item.status}
                        display="flex" 
                        justifyContent="space-between" 
                        alignItems="center"
                        sx={{ 
                          py: 0.5,
                          cursor: 'pointer',
                          borderRadius: 1,
                          px: 1,
                          '&:hover': {
                            backgroundColor: theme.palette.action.hover
                          }
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusClick(item.status);
                        }}
                      >
                        <Typography variant="body2">
                          {getDisplayStatus(item.status)}
                        </Typography>
                        <Chip
                          label={item.count}
                          size="small"
                          sx={{
                            backgroundColor: getStatusColor(item.status, theme.palette.mode),
                            color: '#fff',
                            fontWeight: 600,
                            minWidth: 32,
                            height: 20,
                            fontSize: '0.7rem'
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                </Collapse>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Overview Summary Card */}
        <Grid size={{xs:12, sm:6, md:3}}>
          <Card 
            sx={{ 
              height: '100%',
              background: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.secondary.main}15)`,
              border: `1px solid ${theme.palette.primary.main}30`
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <OverviewIcon sx={{ color: theme.palette.primary.main }} />
                <Typography variant="subtitle2" fontWeight={600}>
                  Overview
                </Typography>
              </Box>

              <Typography 
                variant="h4" 
                fontWeight="bold" 
                color="primary"
                sx={{ mb: 1 }}
              >
                {totalOrders}
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Total Orders
              </Typography>

              <Box sx={{ space: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                  <Typography variant="body2">Success Rate</Typography>
                  <Typography variant="body2" fontWeight={600} color="success.main">
                    {successRate}%
                  </Typography>
                </Box>
                
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                  <Typography variant="body2">Active</Typography>
                  <Typography variant="body2" fontWeight={600} color="warning.main">
                    {activeRate}%
                  </Typography>
                </Box>
                
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">Issues</Typography>
                  <Typography variant="body2" fontWeight={600} color="error.main">
                    {issueRate}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OrderStatsCard;
