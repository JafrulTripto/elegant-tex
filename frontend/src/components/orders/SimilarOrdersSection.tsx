import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  CircularProgress,
  Divider,
  Alert,
  Button,
  CardActions,
  Paper,
  Stack,
  useTheme
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { alpha } from '@mui/material/styles';
import {
  CalendarMonth as CalendarIcon,
  Person as PersonIcon,
  ShoppingBag as ProductIcon,
  AttachMoney as MoneyIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material';
import { Order } from '../../types/order';
import * as orderService from '../../services/order.service';
import { format } from 'date-fns';

interface SimilarOrdersSectionProps {
  orderId: number;
  currentOrderProducts?: Array<{
    productType: string;
    fabric: {
      id: number;
      name: string;
    };
  }>;
}

const SimilarOrdersSection: React.FC<SimilarOrdersSectionProps> = ({ orderId }) => {
  const [similarOrders, setSimilarOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme(); // Moved to top level to follow React hooks rules

  useEffect(() => {
    const fetchSimilarOrders = async () => {
      setLoading(true);
      try {
        const orders = await orderService.getSimilarOrders(orderId);
        setSimilarOrders(orders);
      } catch (err) {
        console.error('Error fetching similar orders:', err);
        setError('Failed to load similar orders');
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarOrders();
  }, [orderId]);

  // Get status chip color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Returned':
      case 'RETURNED':
        return 'error';
      case 'Cancelled':
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  // Since we're now filtering for similar products on the backend,
  // we don't need to check for matching products on the frontend

  // Convert backend status to display status
  const getDisplayStatus = (backendStatus: string): string => {
    switch (backendStatus) {
      case 'ORDER_CREATED':
        return 'Order Created';
      case 'APPROVED':
        return 'Approved';
      case 'BOOKING':
        return 'Booking';
      case 'PRODUCTION':
        return 'Production';
      case 'QA':
        return 'QA';
      case 'READY':
        return 'Ready';
      case 'DELIVERED':
        return 'Delivered';
      case 'RETURNED':
        return 'Returned';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return backendStatus;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={2}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (similarOrders.length === 0) {
    return (
      <Alert severity="info">
        No similar orders found with matching product types, fabrics, and descriptions.
      </Alert>
    );
  }
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Similar Orders ({similarOrders.length})
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        These are returned or cancelled orders with matching products (same product type AND fabric with similar descriptions) that could potentially be reused.
      </Typography>
      
      <Divider sx={{ mb: 2 }} />
      
      {similarOrders.map((order) => {
        const statusDisplay = getDisplayStatus(order.status);
        const statusColor = getStatusColor(order.status);
        const isReturned = order.status === 'RETURNED';
        const isCancelled = order.status === 'CANCELLED';
        
        // Border color based on status
        const borderColor = isReturned || isCancelled 
          ? theme.palette.error.light
          : '#e0e0e0';
          
        return (
          <Card 
            key={order.id} 
            sx={{ 
              mb: 2, 
              border: `1px solid ${borderColor}`,
              borderLeft: `4px solid ${statusColor === 'error' ? theme.palette.error.main : theme.palette.grey[500]}`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.12)'
              }
            }}
          >
            <CardContent sx={{ 
              pb: 1,
              backgroundColor: isReturned || isCancelled 
                ? alpha(theme.palette.error.light, 0.1)
                : 'inherit'
            }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography 
                  variant="h6" 
                  component={Link} 
                  to={`/orders/${order.id}`} 
                  sx={{ 
                    textDecoration: 'none', 
                    color: 'primary.main',
                    fontWeight: 'medium',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Order #{order.orderNumber}
                </Typography>
                <Chip
                  label={statusDisplay}
                  color={statusColor as any}
                  size="small"
                  sx={{ fontWeight: 'medium' }}
                />
              </Box>
              
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <PersonIcon fontSize="small" color="action" />
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Customer
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {order.customer.name}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CalendarIcon fontSize="small" color="action" />
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Created Date
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {format(new Date(order.createdAt), 'PP')}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <MoneyIcon fontSize="small" color="action" />
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Total Amount
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        ${order.totalAmount.toFixed(2)}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <ProductIcon fontSize="small" color="action" />
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Products
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {order.products.length} items
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>
              
              <Paper 
                variant="outlined" 
                sx={{ 
                  mt: 2, 
                  p: 1.5, 
                  backgroundColor: 'background.default',
                  borderRadius: 1
                }}
              >
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1 }}>
                  Products:
                </Typography>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: 1,
                    maxHeight: order.products.length > 8 ? '120px' : 'auto',
                    overflowY: order.products.length > 8 ? 'auto' : 'visible',
                    pr: order.products.length > 8 ? 1 : 0, // Add padding for scrollbar
                    '&::-webkit-scrollbar': {
                      width: '8px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: 'rgba(0,0,0,0.2)',
                      borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-track': {
                      backgroundColor: 'rgba(0,0,0,0.05)',
                    }
                  }}
                >
                  {order.products.map((product, idx) => (
                    <Chip
                      key={idx}
                      label={`${product.productType} (${product.fabric.name})`}
                      size="small"
                      variant="filled"
                      color="primary"
                      sx={{ 
                        borderRadius: '4px',
                        '& .MuiChip-label': {
                          px: 1
                        }
                      }}
                    />
                  ))}
                  {order.products.length > 8 && (
                    <Typography variant="caption" color="textSecondary" sx={{ alignSelf: 'center', ml: 1 }}>
                      Scroll to see all
                    </Typography>
                  )}
                </Box>
              </Paper>
            </CardContent>
            
            <CardActions sx={{ justifyContent: 'flex-end', pt: 0, pb: 1, px: 2 }}>
              <Button 
                component={Link}
                to={`/orders/${order.id}`}
                size="small" 
                endIcon={<ArrowIcon />}
              >
                View Details
              </Button>
            </CardActions>
          </Card>
        );
      })}
    </Box>
  );
};

export default SimilarOrdersSection;
