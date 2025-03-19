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
  AttachMoney as AttachMoneyIcon,
  LocalShipping as LocalShippingIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import OrderStatsCard from '../components/orders/OrderStatsCard';
import UserOrdersTable from '../components/orders/UserOrdersTable';
import MarketplaceComparisonChart from '../components/orders/MarketplaceComparisonChart';
import OrderStatusDistributionChart from '../components/orders/OrderStatusDistributionChart';
import LastMonthOrdersChart from '../components/orders/LastMonthOrdersChart';
import orderService from '../services/order.service';
import marketplaceService from '../services/marketplace.service';
import { OrderStatusCount, Order, ORDER_STATUS_COLORS } from '../types/order';
import { Marketplace } from '../types/marketplace';

const Dashboard: React.FC = () => {
  const { authState } = useAuth();
  const { user } = authState;
  const navigate = useNavigate();
  
  // State for loading and error handling
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for order statistics
  const [orderStatusCounts, setOrderStatusCounts] = useState<OrderStatusCount[]>([]);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  
  // State for marketplace statistics
  const [marketplaces, setMarketplaces] = useState<Marketplace[]>([]);
  const [totalMarketplaces, setTotalMarketplaces] = useState<number>(0);
  
  // Function to fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch order status counts
      const statusCounts = await orderService.getOrderStatusCounts();
      setOrderStatusCounts(statusCounts);
      
      // Calculate total orders
      const total = statusCounts.reduce((sum, item) => sum + item.count, 0);
      setTotalOrders(total);
      
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

  // Function to navigate to create marketplace page
  const handleCreateMarketplace = () => {
    navigate('/marketplaces/new');
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

  // Function to calculate total revenue from orders
  const calculateTotalRevenue = () => {
    return recentOrders.reduce((sum, order) => sum + order.totalAmount, 0);
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
    <Box sx={{ flexGrow: 1 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Dashboard</Typography>
        <Box>
          <Tooltip title="Refresh Data">
            <IconButton onClick={handleRefresh} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateOrder}
            sx={{ ml: 1 }}
          >
            New Order
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateMarketplace}
            sx={{ ml: 1 }}
          >
            New Marketplace
          </Button>
        </Box>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box display="flex" justifyContent="center" my={5}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Order Statistics Section */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="h5" gutterBottom>
              Order Statistics
            </Typography>
          </Grid>
          
          {/* Total Orders Card */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h4" component="div" fontWeight="bold">
                      {totalOrders}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Orders
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <ShoppingCartIcon />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
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
          
          {/* Total Revenue Card */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h4" component="div" fontWeight="bold">
                      ${calculateTotalRevenue().toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Recent Revenue
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'success.main' }}>
                    <AttachMoneyIcon />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Pending Deliveries Card */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h4" component="div" fontWeight="bold">
                      {orderStatusCounts.find(item => item.status === 'IN_PROGRESS')?.count || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pending Deliveries
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'warning.main' }}>
                    <LocalShippingIcon />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Order Status Cards */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" gutterBottom>
              Orders by Status
            </Typography>
            <Grid container spacing={2}>
              {orderStatusCounts.map((statusCount) => (
                <Grid size={{ xs: 6, sm: 4, md: 2 }} key={statusCount.status}>
                  <OrderStatsCard
                    status={statusCount.status}
                    count={statusCount.count}
                    onClick={() => handleOrderStatusClick(statusCount.status)}
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>
          
          {/* User Order Statistics */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <UserOrdersTable />
              </CardContent>
            </Card>
          </Grid>
          
          {/* Marketplace Comparison Chart */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <MarketplaceComparisonChart />
              </CardContent>
            </Card>
          </Grid>
          
          {/* Order Status Distribution Chart */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 400 }}>
                <OrderStatusDistributionChart />
              </CardContent>
            </Card>
          </Grid>
          
          {/* Last Month Orders Chart */}
          <Grid size={{ xs: 12 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 400 }}>
                <LastMonthOrdersChart />
              </CardContent>
            </Card>
          </Grid>
          
          {/* Recent Orders */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardHeader title="Recent Orders" />
              <Divider />
              <CardContent sx={{ flexGrow: 1, overflow: 'auto', minHeight: 300 }}>
                {recentOrders.length > 0 ? (
                  <List>
                    {recentOrders.map((order) => (
                      <React.Fragment key={order.id}>
                        <ListItem
                          component="div"
                          onClick={() => handleOrderClick(order.id)}
                          sx={{ cursor: 'pointer' }}
                          secondaryAction={
                            <Tooltip title={order.status}>
                              <Chip
                                label={order.status}
                                size="small"
                                sx={{
                                  bgcolor: ORDER_STATUS_COLORS[order.status as keyof typeof ORDER_STATUS_COLORS] || '#757575',
                                  color: '#fff'
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
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardHeader title="Your Marketplaces" />
              <Divider />
              <CardContent sx={{ flexGrow: 1, overflow: 'auto', minHeight: 300 }}>
                {marketplaces.length > 0 ? (
                  <List>
                    {marketplaces.map((marketplace) => (
                      <React.Fragment key={marketplace.id}>
                        <ListItem
                          component="div"
                          onClick={() => handleMarketplaceClick(marketplace.id)}
                          sx={{ cursor: 'pointer' }}
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
            <Card elevation={2} sx={{ borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardHeader
                avatar={
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {user.firstName ? user.firstName.charAt(0).toUpperCase() : user.phone.charAt(0).toUpperCase()}
                  </Avatar>
                }
                title="Your Profile"
                subheader="Personal Information"
              />
              <Divider />
              <CardContent>
                <List>
                  <ListItem>
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
                  <ListItem>
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
                  <ListItem>
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
                  <ListItem>
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
            <Card elevation={2} sx={{ borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardHeader
                title="Account Status"
                subheader="Overview of your account"
              />
              <Divider />
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Account Status
                    </Typography>
                    <Typography variant="body2">
                      {user.accountVerified ? 'Active' : 'Inactive'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Email Verification
                    </Typography>
                    <Typography variant="body2">
                      {user.emailVerified 
                        ? 'Your email has been verified.' 
                        : 'Please verify your email to access all features.'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Account Type
                    </Typography>
                    <Typography variant="body2">
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
  );
};

export default Dashboard;
