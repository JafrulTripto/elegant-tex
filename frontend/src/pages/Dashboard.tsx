import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  CircularProgress,
  Alert,
  Button,
  IconButton,
  Tooltip,
  Chip,
  useTheme,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  Person as PersonIcon,
  Security as SecurityIcon,
  Email as EmailIcon,
  VerifiedUser as VerifiedUserIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  ShoppingCart as ShoppingCartIcon,
  Store as StoreIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import OrderStatsCard from '../components/orders/OrderStatsCard';
import UserOrdersTable from '../components/orders/UserOrdersTable';
import MarketplaceComparisonChart from '../components/orders/MarketplaceComparisonChart';
import OrderStatusDistributionChart from '../components/orders/OrderStatusDistributionChart';
import LastMonthOrdersChart from '../components/orders/LastMonthOrdersChart';
import OrderCountAmountChart from '../components/orders/OrderCountAmountChart';
import GlobalTimelineSelector from '../components/common/GlobalTimelineSelector';
import GlobalOrderTypeToggle from '../components/common/GlobalOrderTypeToggle';
import ReactiveOrderStats from '../components/orders/ReactiveOrderStats';
import { TimelineProvider } from '../contexts/TimelineContext';
import { OrderTypeProvider } from '../contexts/OrderTypeContext';
import orderService from '../services/order.service';
import marketplaceService from '../services/marketplace.service';
import { Order } from '../types/order';
import { getStatusColor } from '../utils/statusConfig';
import { Marketplace } from '../types/marketplace';

const Dashboard: React.FC = () => {
  const { authState } = useAuth();
  const { user } = authState;
  const navigate = useNavigate();
  const theme = useTheme();
  
  // State for loading and error handling
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for order statistics
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  
  // State for marketplace statistics
  const [marketplaces, setMarketplaces] = useState<Marketplace[]>([]);
  const [totalMarketplaces, setTotalMarketplaces] = useState<number>(0);
  
  // Function to fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch recent orders (first page, 5 items)
      const ordersResponse = await orderService.getAllOrders(0, 5);
      setRecentOrders(ordersResponse.content);
      
      // Fetch marketplaces
      const marketplacesResponse = await marketplaceService.getMarketplaces(0, 10);
      setMarketplaces(marketplacesResponse.content);
      setTotalMarketplaces(marketplacesResponse.totalElements);
      
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Function to handle refresh
  const handleRefresh = () => {
    fetchDashboardData();
  };

  // Function to navigate to create order page
  const handleCreateOrder = () => {
    navigate('/orders/new');
  };

  // Function to navigate to orders with specific status
  const handleOrderStatusClick = (status: string) => {
    navigate(`/orders?status=${status}`);
  };

  // Function to navigate to order details
  const handleOrderClick = (orderId: number) => {
    navigate(`/orders/${orderId}`);
  };

  // Function to navigate to marketplace details
  const handleMarketplaceClick = (marketplaceId: number) => {
    navigate(`/marketplaces/${marketplaceId}`);
  };

  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };


  if (!user) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <TimelineProvider>
      <OrderTypeProvider>
        <Box sx={{ flexGrow: 1 }}>
          <Box 
            display="flex" 
            justifyContent="space-between" 
            alignItems="center" 
            mb={2}
            pb={1}
            sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}
          >
            <Typography 
              variant="h5"
              sx={{ fontWeight: 500 }}
            >
              Dashboard
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <Tooltip title="Refresh Data">
                <IconButton 
                  onClick={handleRefresh} 
                  color="primary"
                  size="small"
                >
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleCreateOrder}
                sx={{ py: 0.5, px: 1.5, fontSize: '0.85rem' }}
                size="small"
              >
                New Order
              </Button>
            </Box>
          </Box>

          {/* Global Controls */}
          <Box 
            display="flex" 
            justifyContent="space-between" 
            alignItems="center" 
            mb={2}
            p={2}
            sx={{ 
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
              borderRadius: 1,
              border: `1px solid ${theme.palette.divider}`
            }}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                Global Filters:
              </Typography>
              <GlobalOrderTypeToggle />
            </Box>
            <GlobalTimelineSelector />
          </Box>
      
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2, // Reduced from mb={3}
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
        <Box display="flex" justifyContent="center" my={5}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}> {/* Reduced spacing from 3 to 2 */}
          {/* Order Statistics Section */}
          <Grid size={{ xs: 12 }}>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                fontSize: '1rem', 
                fontWeight: 500, 
                mb: 1 
              }}
            >
              Order Statistics
            </Typography>
          </Grid>
          
          {/* Reactive Order Statistics */}
          <ReactiveOrderStats />
          
          {/* Total Marketplaces Card */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h4" component="div" fontWeight="bold">
                      {totalMarketplaces}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Marketplaces
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'secondary.main' }}>
                    <StoreIcon />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Order Status Cards */}
          <Grid size={{ xs: 12 }}>
            <OrderStatsCard
              onStatusClick={handleOrderStatusClick}
            />
          </Grid>
          
          {/* User Order Statistics */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ height: 450, display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 1.5 }}> {/* Reduced padding */}
                <UserOrdersTable />
              </CardContent>
            </Card>
          </Grid>
          
          {/* Marketplace Comparison Chart */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ height: '100%', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
              <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 1.5 }}> {/* Reduced padding */}
                <MarketplaceComparisonChart />
              </CardContent>
            </Card>
          </Grid>
          
          {/* Order Status Distribution Chart */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ height: '100%', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
              <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 380, p: 1.5 }}> {/* Reduced height and padding */}
                <OrderStatusDistributionChart />
              </CardContent>
            </Card>
          </Grid>
          
          {/* Last Month Orders Chart */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ height: '100%', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
              <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 380, p: 1.5 }}> {/* Reduced height and padding */}
                <LastMonthOrdersChart />
              </CardContent>
            </Card>
          </Grid>
          
          {/* Order Count and Amount Chart */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ height: '100%', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
              <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 380, p: 1.5 }}> {/* Reduced height and padding */}
                <OrderCountAmountChart />
              </CardContent>
            </Card>
          </Grid>
          
          {/* Recent Orders */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
              <CardHeader 
                title="Recent Orders" 
                titleTypographyProps={{ 
                  variant: 'subtitle1', 
                  fontSize: '0.95rem',
                  fontWeight: 'medium'
                }}
                sx={{ pb: 0.5, pt: 1.5, px: 1.5 }} // Reduced padding
              />
              <Divider />
              <CardContent sx={{ flexGrow: 1, overflow: 'auto', minHeight: 280, p: 1 }}> {/* Reduced height and padding */}
                {recentOrders.length > 0 ? (
                  <List>
                    {recentOrders.map((order) => (
                      <React.Fragment key={order.id}>
                        <ListItem
                          component="div"
                          onClick={() => handleOrderClick(order.id)}
                          sx={{ 
                            cursor: 'pointer',
                            py: 0.75 // Reduced padding
                          }}
                          secondaryAction={
                            <Tooltip title={order.status}>
                              <Chip
                                label={order.status}
                                size="small"
                                sx={{
                                  bgcolor: getStatusColor(order.status, theme.palette.mode),
                                  color: '#fff',
                                  height: 24,
                                  fontSize: '0.7rem',
                                  '& .MuiChip-label': {
                                    px: 1
                                  }
                                }}
                              />
                            </Tooltip>
                          }
                        >
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              <ShoppingCartIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={`Order #${order.id} - ${order.customer.name}`}
                            secondary={`${formatDate(order.createdAt)} • $${order.totalAmount.toFixed(2)}`}
                          />
                        </ListItem>
                        <Divider variant="inset" component="li" />
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary" align="center">
                    No recent orders found
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          {/* Marketplaces */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }} style={{ padding: '0px' }}>
              <CardHeader 
                title="Your Marketplaces" 
                titleTypographyProps={{ 
                  variant: 'subtitle1', 
                  fontSize: '0.95rem',
                  fontWeight: 'medium'
                }}
                sx={{ pb: 0.5, pt: 1.5, px: 1.5 }} // Reduced padding
              />
              <Divider />
              <CardContent sx={{ flexGrow: 1, overflow: 'auto', minHeight: 280, p: 1 }}> {/* Reduced height and padding */}
                {marketplaces.length > 0 ? (
                  <List>
                    {marketplaces.map((marketplace) => (
                      <React.Fragment key={marketplace.id}>
                        <ListItem
                          component="div"
                          onClick={() => handleMarketplaceClick(marketplace.id)}
                          sx={{ 
                            cursor: 'pointer',
                            py: 0.75 // Reduced padding
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'secondary.main' }}>
                              <StoreIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={marketplace.name}
                            secondary={`${marketplace.pageUrl} • ${marketplace.members.length} members`}
                          />
                        </ListItem>
                        <Divider variant="inset" component="li" />
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary" align="center">
                    No marketplaces found
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          {/* User Profile Card */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
              <CardHeader
                avatar={
                  <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}> {/* Smaller avatar */}
                    {user.firstName ? user.firstName.charAt(0).toUpperCase() : user.phone.charAt(0).toUpperCase()}
                  </Avatar>
                }
                title="Your Profile"
                subheader="Personal Information"
                titleTypographyProps={{ 
                  variant: 'subtitle1', 
                  fontSize: '0.95rem',
                  fontWeight: 'medium'
                }}
                subheaderTypographyProps={{
                  fontSize: '0.8rem'
                }}
                sx={{ pb: 0.5, pt: 1.5, px: 1.5 }} // Reduced padding
              />
              <Divider />
              <CardContent sx={{ p: 1 }}> {/* Reduced padding */}
                <List dense> {/* Make list more compact */}
                  <ListItem sx={{ py: 0.75 }}> {/* Reduced padding */}
                    <ListItemAvatar>
                      <Avatar>
                        <PersonIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Name"
                      secondary={`${user.firstName || ''} ${user.lastName || ''}`}
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.75 }}> {/* Reduced padding */}
                    <ListItemAvatar>
                      <Avatar>
                        <EmailIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Email"
                      secondary={user.email}
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.75 }}> {/* Reduced padding */}
                    <ListItemAvatar>
                      <Avatar>
                        <VerifiedUserIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Email Verified"
                      secondary={user.emailVerified ? 'Yes' : 'No'}
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.75 }}> {/* Reduced padding */}
                    <ListItemAvatar>
                      <Avatar>
                        <SecurityIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="Roles"
                      secondary={user.roles.map(role => role.replace('ROLE_', '')).join(', ')}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Account Status Card */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
              <CardHeader
                title="Account Status"
                subheader="Overview of your account"
                titleTypographyProps={{ 
                  variant: 'subtitle1', 
                  fontSize: '0.95rem',
                  fontWeight: 'medium'
                }}
                subheaderTypographyProps={{
                  fontSize: '0.8rem'
                }}
                sx={{ pb: 0.5, pt: 1.5, px: 1.5 }} // Reduced padding
              />
              <Divider />
              <CardContent sx={{ p: 1.5 }}> {/* Reduced padding */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}> {/* Reduced gap */}
                  <Box>
                    <Typography 
                      variant="subtitle2" 
                      sx={{ fontSize: '0.85rem', fontWeight: 'medium', mb: 0.5 }}
                    >
                      Account Status
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                      {user.accountVerified ? 'Active' : 'Inactive'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography 
                      variant="subtitle2" 
                      sx={{ fontSize: '0.85rem', fontWeight: 'medium', mb: 0.5 }}
                    >
                      Email Verification
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                      {user.emailVerified 
                        ? 'Your email has been verified.' 
                        : 'Please verify your email to access all features.'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography 
                      variant="subtitle2" 
                      sx={{ fontSize: '0.85rem', fontWeight: 'medium', mb: 0.5 }}
                    >
                      Account Type
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                      {user.roles.some(role => role === 'ROLE_ADMIN') 
                        ? 'Administrator' 
                        : 'Standard User'}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
        </Box>
      </OrderTypeProvider>
    </TimelineProvider>
  );
};

export default Dashboard;
