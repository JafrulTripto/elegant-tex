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
  Email as EmailIcon,
  VerifiedUser as VerifiedUserIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  ShoppingCart as ShoppingCartIcon,
  Store as StoreIcon,
  AttachMoney as AttachMoneyIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import orderService from '../services/order.service';
import marketplaceService from '../services/marketplace.service';
import { Order, ORDER_STATUS_COLORS } from '../types/order';
import { Marketplace } from '../types/marketplace';
import UserMarketplaceLineChart from '../components/orders/UserMarketplaceLineChart';
import UserOrderStatusDistributionChart from '../components/orders/UserOrderStatusDistributionChart';
import MonthlyOrderStatusCard from '../components/orders/MonthlyOrderStatusCard';

const UserDashboard: React.FC = () => {
  const { authState } = useAuth();
  const { user } = authState;
  const navigate = useNavigate();
  
  // State for loading and error handling
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for user order statistics
  const [userOrderCount, setUserOrderCount] = useState<number>(0);
  const [userOrderTotal, setUserOrderTotal] = useState<number>(0);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  
  // State for user marketplaces
  const [userMarketplaces, setUserMarketplaces] = useState<Marketplace[]>([]);
  
  // Function to fetch dashboard data
  const fetchDashboardData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch user's order statistics
      const userStats = await orderService.getUserOrderStatistics(true);
      const currentUserStats = userStats.find(stat => stat.userId === user.id);
      
      if (currentUserStats) {
        setUserOrderCount(currentUserStats.orderCount || 0);
        setUserOrderTotal(currentUserStats.totalAmount || 0);
      }
      
      // Fetch user's recent orders (first page, 5 items)
      // For a real implementation, we would need a backend endpoint to get orders by user ID
      // For now, we'll use getAllOrders and filter on the client side
      const ordersResponse = await orderService.getAllOrders(0, 10);
      const userOrders = ordersResponse.content.filter(order => order.createdBy && order.createdBy.toString() === user.id.toString());
      setRecentOrders(userOrders.slice(0, 5));
      
      // Fetch user's marketplaces
      const userMarketplacesResponse = await marketplaceService.getUserMarketplaces(user.id);
      setUserMarketplaces(userMarketplacesResponse);
      
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  // Function to handle refresh
  const handleRefresh = () => {
    fetchDashboardData();
  };

  // Function to navigate to create order page
  const handleCreateOrder = () => {
    // Check if user has permission to create orders or is admin
    if (user?.permissions?.includes('ORDER_CREATE') || user?.roles.includes('ROLE_ADMIN')) {
      navigate('/orders/new');
    } else {
      setError('You do not have permission to create orders');
    }
  };

  // Function to navigate to order details
  const handleOrderClick = (orderId: number) => {
    // Check if user has permission to view orders or is admin
    if (user?.permissions?.includes('ORDER_READ') || user?.roles.includes('ROLE_ADMIN')) {
      navigate(`/orders/${orderId}`);
    } else {
      setError('You do not have permission to view order details');
    }
  };

  // Function to navigate to marketplace details
  const handleMarketplaceClick = (marketplaceId: number) => {
    // Check if user has permission to view marketplaces or is admin
    if (user?.permissions?.includes('MARKETPLACE_READ') || user?.roles.includes('ROLE_ADMIN')) {
      navigate(`/marketplaces/${marketplaceId}`);
    } else {
      setError('You do not have permission to view marketplace details');
    }
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
    <Box sx={{ flexGrow: 1 }}>
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        mb={2} // Reduced from mb={3}
        pb={1}
        sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}
      >
        <Typography 
          variant="h5" // Changed from h4 for more compact look
          sx={{ fontWeight: 500 }}
        >
          My Dashboard
        </Typography>
        <Box>
          <Tooltip title="Refresh Data">
            <IconButton 
              onClick={handleRefresh} 
              color="primary"
              size="small" // Smaller button
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {(user?.permissions?.includes('ORDER_CREATE') || user?.roles.includes('ROLE_ADMIN')) && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleCreateOrder}
              sx={{ ml: 1, py: 0.5, px: 1.5, fontSize: '0.85rem' }} // More compact button
              size="small"
            >
              New Order
            </Button>
          )}
        </Box>
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
          {/* User Order Statistics Section */}
          <Grid size={{ xs: 12 }}>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                fontSize: '1rem', 
                fontWeight: 500, 
                mb: 1 
              }}
            >
              My Order Statistics
            </Typography>
          </Grid>
          
          {/* Total Orders Card */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h4" component="div" fontWeight="bold">
                      {userOrderCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      My Total Orders
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <ShoppingCartIcon />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Total Amount Card */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h4" component="div" fontWeight="bold">
                      ${userOrderTotal.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      My Total Order Amount
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'success.main' }}>
                    <AttachMoneyIcon />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Monthly Order Status Card */}
          <Grid size={{ xs: 12, md: 4 }}>
            <MonthlyOrderStatusCard userId={user?.id} title="My Monthly Orders" />
          </Grid>
          
          {/* Order Status Distribution Chart */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ height: '100%', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
              <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 380, p: 1.5 }}> {/* Reduced height and padding */}
                <UserOrderStatusDistributionChart />
              </CardContent>
            </Card>
          </Grid>
          
          {/* Marketplace Line Chart */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ height: '100%', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
              <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 380, p: 1.5 }}> {/* Reduced height and padding */}
                <UserMarketplaceLineChart userMarketplaces={userMarketplaces} />
              </CardContent>
            </Card>
          </Grid>
          
          {/* Recent Orders */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
              <CardHeader 
                title="My Recent Orders" 
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
                                  bgcolor: ORDER_STATUS_COLORS[order.status as keyof typeof ORDER_STATUS_COLORS] || '#757575',
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
          
          {/* User Marketplaces */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }} style={{ padding: '0px' }}>
              <CardHeader 
                title="My Marketplaces" 
                titleTypographyProps={{ 
                  variant: 'subtitle1', 
                  fontSize: '0.95rem',
                  fontWeight: 'medium'
                }}
                sx={{ pb: 0.5, pt: 1.5, px: 1.5 }} // Reduced padding
              />
              <Divider />
              <CardContent sx={{ flexGrow: 1, overflow: 'auto', minHeight: 280, p: 1 }}> {/* Reduced height and padding */}
                {userMarketplaces.length > 0 ? (
                  <List>
                    {userMarketplaces.map((marketplace) => (
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
                title="My Profile"
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
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default UserDashboard;
