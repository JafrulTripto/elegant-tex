import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { canViewAllOrders } from '../utils/permissionUtils';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Paper,
  Typography,
  Chip,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  PictureAsPdf as PdfIcon,
  Timeline as TimelineIcon,
  Delete as DeleteIcon,
  Inventory as InventoryIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { Order, OrderStatus, STATUS_OPTIONS, STATUS_DISPLAY_OPTIONS } from '../types/order';
import * as orderService from '../services/order.service';
import OrderImagePreview from '../components/orders/OrderImagePreview';
import OrderDeleteDialog from '../components/orders/OrderDeleteDialog';
import SimilarOrdersSection from '../components/orders/SimilarOrdersSection';

const ORDER_STATUS_STEPS: string[] = [
  'Order Created',
  'Approved',
  'Booking',
  'Production',
  'QA',
  'Ready',
  'Delivered'
];

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { authState } = useAuth();
  const hasViewAllOrdersPermission = authState.user?.permissions ? 
    canViewAllOrders(authState.user.permissions) : false;
  
  // State
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState<boolean>(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState<boolean>(false);
  const [newStatus, setNewStatus] = useState<OrderStatus | ''>('');
  const [displayStatus, setDisplayStatus] = useState<string>('');
  const [statusNotes, setStatusNotes] = useState<string>('');
  const [updatingStatus, setUpdatingStatus] = useState<boolean>(false);
  const [generatingPdf, setGeneratingPdf] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  
  // Load order data
  useEffect(() => {
    if (!id) return;
    
    const fetchOrder = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const orderData = await orderService.getOrderById(parseInt(id));
        
        // Check if user has permission to view this order
        if (!hasViewAllOrdersPermission && 
            authState.user && 
            orderData.createdBy.id !== authState.user.id) {
          setAccessDenied(true);
          setError('You do not have permission to view this order. You can only view orders created by you.');
          setLoading(false);
          return;
        }
        
        // If we get here, the user has permission to view the order
        setOrder(orderData);
        
      } catch (err: any) {
        console.error('Error fetching order:', err);
        if (err.response && err.response.status === 403) {
          setAccessDenied(true);
          setError('You do not have permission to view this order.');
        } else {
          setError('Failed to load order details. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
  }, [id, hasViewAllOrdersPermission, authState.user]);
  
  // Get active step for stepper
  const getActiveStep = (status: string): number => {
    const displayStatus = getDisplayStatus(status);
    const index = ORDER_STATUS_STEPS.indexOf(displayStatus);
    if (displayStatus === 'Returned' || displayStatus === 'Cancelled') return -1; // Special cases
    return index >= 0 ? index : 0;
  };
  
  // Get status chip color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Order Created':
        return 'info';
      case 'Approved':
        return 'info';
      case 'Booking':
        return 'secondary';
      case 'Production':
        return 'warning';
      case 'QA':
        return 'secondary';
      case 'Ready':
        return 'info';
      case 'Delivered':
        return 'success';
      case 'Returned':
        return 'error';
      case 'Cancelled':
        return 'error';
      default:
        return 'default';
    }
  };
  
  // Convert backend status to display status
  const getDisplayStatus = (backendStatus: string): string => {
    const index = STATUS_OPTIONS.indexOf(backendStatus as any);
    return index >= 0 ? STATUS_DISPLAY_OPTIONS[index] : backendStatus;
  };
  
  // Convert display status to backend status
  const getBackendStatus = (displayStatus: string): OrderStatus => {
    const index = STATUS_DISPLAY_OPTIONS.indexOf(displayStatus);
    return index >= 0 ? STATUS_OPTIONS[index] as OrderStatus : displayStatus as OrderStatus;
  };
  
  // Handle status dialog open
  const handleStatusDialogOpen = () => {
    if (order) {
      const currentDisplayStatus = getDisplayStatus(order.status);
      setNewStatus(order.status as OrderStatus);
      setDisplayStatus(currentDisplayStatus);
      setStatusNotes('');
      setError(null); // Clear any previous errors
      setStatusDialogOpen(true);
    }
  };
  
  // Handle status update
  const handleStatusUpdate = async () => {
    if (!id || !newStatus) return;
    
    setUpdatingStatus(true);
    try {
      const updatedOrder = await orderService.updateOrderStatus(
        parseInt(id),
        newStatus,
        statusNotes
      );
      setOrder(updatedOrder);
      setStatusDialogOpen(false);
    } catch (err: any) {
      console.error('Error updating status:', err);
      // Check if it's an invalid status transition error
      if (err.message?.includes('Invalid status transition from')) {
        setError(err.message);
      } else {
        setError('Failed to update order status. Please try again later.');
      }
    } finally {
      setUpdatingStatus(false);
    }
  };
  
  // Handle PDF generation
  const handleGeneratePdf = async () => {
    if (!id || !order) return;
    
    setGeneratingPdf(true);
    try {
      const pdfBlob = await orderService.generateOrderPdf(parseInt(id));
      orderService.downloadBlob(pdfBlob, `order-${order.orderNumber}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError('Failed to generate PDF. Please try again later.');
    } finally {
      setGeneratingPdf(false);
    }
  };
  
  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!id || !order) return;
    
    setDeleting(true);
    try {
      await orderService.deleteOrder(parseInt(id));
      navigate('/orders', { state: { message: `Order #${order.orderNumber} deleted successfully` } });
    } catch (err) {
      console.error('Error deleting order:', err);
      setError('Failed to delete order. Please try again later.');
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };
  
  // Calculate total price
  const calculateTotal = (): number => {
    if (!order) return 0;
    
    const productsTotal = order.products.reduce(
      (sum, product) => sum + product.price * product.quantity,
      0
    );
    
    return productsTotal + order.deliveryCharge;
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }
  
  if (error || !order) {
    return (
      <Container maxWidth="lg">
        <Box my={4}>
          <Alert severity="error">
            {accessDenied ? 
              'You do not have permission to view this order. You can only view orders created by you.' : 
              (error || 'Order not found')}
          </Alert>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/orders')}
            sx={{ mt: 2 }}
          >
            Back to Orders
          </Button>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center">
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/orders')}
              sx={{ mr: 2 }}
            >
              Back
            </Button>
            <Typography variant="h4" component="h1">
              Order #{order.orderNumber}
            </Typography>
          </Box>
          <Box>
            <Button
              variant="outlined"
              startIcon={<TimelineIcon />}
              onClick={handleStatusDialogOpen}
              sx={{ mr: 1 }}
            >
              Update Status
            </Button>
            <Button
              variant="outlined"
              startIcon={<PdfIcon />}
              onClick={handleGeneratePdf}
              disabled={generatingPdf}
              sx={{ mr: 1 }}
            >
              {generatingPdf ? 'Generating...' : 'Download PDF'}
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setDeleteDialogOpen(true)}
              disabled={deleting}
              sx={{ mr: 1 }}
            >
              {deleting ? 'Deleting...' : 'Delete Order'}
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/orders/${order.id}/edit`)}
            >
              Edit Order
            </Button>
          </Box>
        </Box>

        {/* Order Status */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Order Status</Typography>
            <Chip
              label={getDisplayStatus(order.status)}
              color={getStatusColor(getDisplayStatus(order.status)) as any}
              sx={{ fontWeight: 'bold' }}
            />
          </Box>
          
          {getDisplayStatus(order.status) !== 'Returned' && getDisplayStatus(order.status) !== 'Cancelled' ? (
            <Stepper activeStep={getActiveStep(order.status)} alternativeLabel>
              {ORDER_STATUS_STEPS.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          ) : (
            getDisplayStatus(order.status) === 'Returned' ? (
              <Alert severity="error" sx={{ mt: 2 }}>
                This order has been returned.
              </Alert>
            ) : (
              <Alert severity="error" sx={{ mt: 2 }}>
                This order has been cancelled.
              </Alert>
            )
          )}
          
          <Box mt={3}>
            <Typography variant="subtitle1" gutterBottom>
              Status History
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {order.statusHistory.map((history) => (
              <Box key={history.id} mb={1}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 3, sm: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                      {format(new Date(history.timestamp), 'PP p')}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 4, sm: 2 }}>
                      <Chip
                        label={getDisplayStatus(history.status)}
                        color={getStatusColor(getDisplayStatus(history.status)) as any}
                        size="small"
                      />
                  </Grid>
                  <Grid size={{ xs: 5, sm: 3 }}>
                    <Typography variant="body2">
                      {history.updatedBy.firstName} {history.updatedBy.lastName}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 5 }}>
                    {history.notes && (
                      <Typography variant="body2" color="textSecondary">
                        {history.notes}
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </Box>
            ))}
          </Box>
        </Paper>

        {/* Order Details - Two columns layout */}
        <Grid container spacing={3}>
          {/* Left Column */}
          <Grid size={{ xs: 12, md: 6 }}>
            {/* Customer Information */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Customer Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid size={{ xs: 4 }}>
                  <Typography variant="body2" color="textSecondary">
                    Name
                  </Typography>
                </Grid>
                <Grid size={{ xs: 8 }}>
                  <Typography variant="body1">
                    {order.customer.name}
                  </Typography>
                </Grid>
                
                <Grid size={{ xs: 4 }}>
                  <Typography variant="body2" color="textSecondary">
                    Phone
                  </Typography>
                </Grid>
                <Grid size={{ xs: 8 }}>
                  <Typography variant="body1">
                    {order.customer.phone}
                  </Typography>
                </Grid>
                
                {order.customer.alternativePhone && (
                  <>
                    <Grid size={{ xs: 4 }}>
                      <Typography variant="body2" color="textSecondary">
                        Alternative Phone
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 8 }}>
                      <Typography variant="body1">
                        {order.customer.alternativePhone}
                      </Typography>
                    </Grid>
                  </>
                )}
                
                {order.customer.facebookId && (
                  <>
                    <Grid size={{ xs: 4 }}>
                      <Typography variant="body2" color="textSecondary">
                        Facebook ID
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 8 }}>
                      <Typography variant="body1">
                        {order.customer.facebookId}
                      </Typography>
                    </Grid>
                  </>
                )}
                
                <Grid size={{ xs: 4 }}>
                  <Typography variant="body2" color="textSecondary">
                    Address
                  </Typography>
                </Grid>
                <Grid size={{ xs: 8 }}>
                  <Typography variant="body1">
                    {order.customer.address}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
            
            {/* Delivery Information */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Delivery Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid size={{ xs: 4 }}>
                  <Typography variant="body2" color="textSecondary">
                    Marketplace
                  </Typography>
                </Grid>
                <Grid size={{ xs: 8 }}>
                  <Typography variant="body1">
                    {order.marketplace.name}
                  </Typography>
                </Grid>
                
                <Grid size={{ xs: 4 }}>
                  <Typography variant="body2" color="textSecondary">
                    Delivery Channel
                  </Typography>
                </Grid>
                <Grid size={{ xs: 8 }}>
                  <Typography variant="body1">
                    {order.deliveryChannel}
                  </Typography>
                </Grid>
                
                <Grid size={{ xs: 4 }}>
                  <Typography variant="body2" color="textSecondary">
                    Delivery Charge
                  </Typography>
                </Grid>
                <Grid size={{ xs: 8 }}>
                  <Typography variant="body1">
                    ${order.deliveryCharge.toFixed(2)}
                  </Typography>
                </Grid>
                
                <Grid size={{ xs: 4 }}>
                  <Typography variant="body2" color="textSecondary">
                    Delivery Date
                  </Typography>
                </Grid>
                <Grid size={{ xs: 8 }}>
                  <Typography variant="body1">
                    {format(new Date(order.deliveryDate), 'PP')}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
            
            {/* Order Summary */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="textSecondary">
                    Products Subtotal
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body1" align="right">
                    ${order.products.reduce((sum, p) => sum + p.price * p.quantity, 0).toFixed(2)}
                  </Typography>
                </Grid>
                
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="textSecondary">
                    Delivery Charge
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body1" align="right">
                    ${order.deliveryCharge.toFixed(2)}
                  </Typography>
                </Grid>
                
                <Grid size={{ xs: 12 }}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                
                <Grid size={{ xs: 6 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Total
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="subtitle1" fontWeight="bold" align="right">
                    ${calculateTotal().toFixed(2)}
                  </Typography>
                </Grid>
                
                <Grid size={{ xs: 12 }}>
                  <Box mt={1}>
                    <Typography variant="body2" color="textSecondary">
                      Created by {order.createdBy.firstName} {order.createdBy.lastName} on {format(new Date(order.createdAt), 'PP p')}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          
          {/* Right Column - Products */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Products
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {order.products.map((product, index) => (
                <Card 
                  key={product.id} 
                  sx={{ 
                    mb: 2, 
                    borderRadius: 1,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.12)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="subtitle1" fontWeight="medium">
                        Product #{index + 1}: {product.productType}
                      </Typography>
                      <Chip 
                        label={`$${(product.price * product.quantity).toFixed(2)}`}
                        color="primary"
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </Box>
                    
                    <Divider sx={{ mb: 2 }} />
                    
                    {/* Fabric with image - horizontal layout */}
                    <Box 
                      sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        mb: 2,
                        p: 1.5,
                        bgcolor: 'background.paper',
                        borderRadius: 1,
                        border: '1px solid #f0f0f0'
                      }}
                    >
                      {/* Fabric image */}
                      <OrderImagePreview
                        imageId={product.fabric.imageId}
                        width={60}
                        height={60}
                        showDeleteButton={false}
                      />
                      
                      <Box ml={2} flex={1}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" color="textSecondary">
                            Fabric
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Qty: {product.quantity} × ${product.price.toFixed(2)}
                          </Typography>
                        </Box>
                        <Typography variant="body1" fontWeight="medium">
                          {product.fabric.name}
                        </Typography>
                        {product.fabric.tags && product.fabric.tags.length > 0 && (
                          <Box sx={{ mt: 0.5, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {product.fabric.tags.map(tag => (
                              <Chip 
                                key={tag.id} 
                                label={tag.name} 
                                size="small" 
                                sx={{ fontSize: '0.7rem' }}
                              />
                            ))}
                          </Box>
                        )}
                      </Box>
                    </Box>
                    
                    {/* Description if available */}
                    {product.description && (
                      <Box sx={{ mb: 2 }}>
                        <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                          <DescriptionIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="textSecondary">
                            Description
                          </Typography>
                        </Stack>
                        <Typography variant="body2" sx={{ pl: 3 }}>
                          {product.description}
                        </Typography>
                      </Box>
                    )}
                    
                    {/* Product images if available */}
                    {product.images.length > 0 && (
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                          <InventoryIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="textSecondary">
                            Product Images
                          </Typography>
                        </Stack>
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            flexWrap: 'wrap', 
                            gap: 1,
                            pl: 3
                          }}
                        >
                          {product.images.map((image) => (
                            <OrderImagePreview
                              key={image.id}
                              imageId={image.imageId}
                              width={80}
                              height={80}
                              showDeleteButton={false}
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Paper>
          </Grid>
        </Grid>
        
        {/* Similar Orders Section */}
        {order.status !== 'RETURNED' && order.status !== 'CANCELLED' && id && (
          <Paper sx={{ p: 3, mt: 3 }}>
            <SimilarOrdersSection 
              orderId={parseInt(id)} 
              currentOrderProducts={order.products.map(product => ({
                productType: product.productType,
                fabric: {
                  id: product.fabric.id,
                  name: product.fabric.name
                }
              }))}
            />
          </Paper>
        )}
      </Box>
      
      {/* Status Update Dialog */}
      <Dialog 
        open={statusDialogOpen} 
        onClose={() => {
          setStatusDialogOpen(false);
          setError(null); // Clear any errors when closing the dialog
        }}
      >
        <DialogTitle>Update Order Status</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label"
                id="status"
                value={displayStatus}
                label="Status"
                onChange={(e) => {
                  const selectedDisplayStatus = e.target.value as string;
                  setDisplayStatus(selectedDisplayStatus);
                  const backendStatus = getBackendStatus(selectedDisplayStatus);
                  setNewStatus(backendStatus);
                  // Clear any previous error when changing status
                  setError(null);
                }}
              >
              {STATUS_DISPLAY_OPTIONS.map((status) => (
                <MenuItem key={status} value={status}>{status}</MenuItem>
              ))}
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Notes (Optional)"
              multiline
              rows={3}
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleStatusUpdate}
            color="primary"
            variant="contained"
            disabled={updatingStatus || !newStatus}
          >
            {updatingStatus ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <OrderDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        orderNumber={order?.orderNumber || ''}
        orderCustomerName={order?.customer?.name}
        loading={deleting}
      />
    </Container>
  );
};

export default OrderDetailPage;
