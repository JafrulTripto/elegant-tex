import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
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
  DialogTitle
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  PictureAsPdf as PdfIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { Order, OrderStatus } from '../types/order';
import * as orderService from '../services/order.service';
import ImagePreview from '../components/common/ImagePreview';

const ORDER_STATUS_STEPS: OrderStatus[] = [
  'Created',
  'In Progress',
  'In QA',
  'Delivered'
];

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // State
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState<boolean>(false);
  const [newStatus, setNewStatus] = useState<OrderStatus | ''>('');
  const [statusNotes, setStatusNotes] = useState<string>('');
  const [updatingStatus, setUpdatingStatus] = useState<boolean>(false);
  const [generatingPdf, setGeneratingPdf] = useState<boolean>(false);
  
  // Load order data
  useEffect(() => {
    if (!id) return;
    
    const fetchOrder = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const orderData = await orderService.getOrderById(parseInt(id));
        setOrder(orderData);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to load order details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
  }, [id]);
  
  // Get active step for stepper
  const getActiveStep = (status: string): number => {
    const index = ORDER_STATUS_STEPS.indexOf(status as OrderStatus);
    if (status === 'Returned') return -1; // Special case for returned orders
    return index >= 0 ? index : 0;
  };
  
  // Get status chip color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Created':
        return 'info';
      case 'In Progress':
        return 'warning';
      case 'In QA':
        return 'secondary';
      case 'Delivered':
        return 'success';
      case 'Returned':
        return 'error';
      default:
        return 'default';
    }
  };
  
  // Handle status dialog open
  const handleStatusDialogOpen = () => {
    if (order) {
      setNewStatus(order.status as OrderStatus);
      setStatusNotes('');
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
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update order status. Please try again later.');
    } finally {
      setUpdatingStatus(false);
    }
  };
  
  // Handle PDF generation
  const handleGeneratePdf = async () => {
    if (!id) return;
    
    setGeneratingPdf(true);
    try {
      const pdfBlob = await orderService.generateOrderPdf(parseInt(id));
      orderService.downloadBlob(pdfBlob, `order-${id}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError('Failed to generate PDF. Please try again later.');
    } finally {
      setGeneratingPdf(false);
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
          <Alert severity="error">{error || 'Order not found'}</Alert>
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
              Order #{order.id}
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
              label={order.status}
              color={getStatusColor(order.status) as any}
              sx={{ fontWeight: 'bold' }}
            />
          </Box>
          
          {order.status !== 'Returned' ? (
            <Stepper activeStep={getActiveStep(order.status)} alternativeLabel>
              {ORDER_STATUS_STEPS.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          ) : (
            <Alert severity="error" sx={{ mt: 2 }}>
              This order has been returned.
            </Alert>
          )}
          
          <Box mt={3}>
            <Typography variant="subtitle1" gutterBottom>
              Status History
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {order.statusHistory.map((history) => (
              <Box key={history.id} mb={1}>
                <Grid container spacing={2}>
                  <Grid item xs={3} sm={2}>
                    <Typography variant="body2" color="textSecondary">
                      {format(new Date(history.timestamp), 'PP p')}
                    </Typography>
                  </Grid>
                  <Grid item xs={4} sm={2}>
                    <Chip
                      label={history.status}
                      color={getStatusColor(history.status) as any}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={5} sm={3}>
                    <Typography variant="body2">
                      {history.updatedBy.firstName} {history.updatedBy.lastName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={5}>
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

        {/* Order Details */}
        <Grid container spacing={3}>
          {/* Left Column */}
          <Grid item xs={12} md={6}>
            {/* Customer Information */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Customer Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="body2" color="textSecondary">
                    Name
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1">
                    {order.customerName}
                  </Typography>
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="body2" color="textSecondary">
                    Phone
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1">
                    {order.customerPhone}
                  </Typography>
                </Grid>
                
                {order.customerAlternativePhone && (
                  <>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="textSecondary">
                        Alternative Phone
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body1">
                        {order.customerAlternativePhone}
                      </Typography>
                    </Grid>
                  </>
                )}
                
                {order.customerFacebookId && (
                  <>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="textSecondary">
                        Facebook ID
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body1">
                        {order.customerFacebookId}
                      </Typography>
                    </Grid>
                  </>
                )}
                
                <Grid item xs={4}>
                  <Typography variant="body2" color="textSecondary">
                    Address
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1">
                    {order.customerAddress}
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
                <Grid item xs={4}>
                  <Typography variant="body2" color="textSecondary">
                    Marketplace
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1">
                    {order.marketplace.name}
                  </Typography>
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="body2" color="textSecondary">
                    Delivery Channel
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1">
                    {order.deliveryChannel}
                  </Typography>
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="body2" color="textSecondary">
                    Delivery Charge
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1">
                    ${order.deliveryCharge.toFixed(2)}
                  </Typography>
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="body2" color="textSecondary">
                    Delivery Date
                  </Typography>
                </Grid>
                <Grid item xs={8}>
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
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Products Subtotal
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1" align="right">
                    ${order.products.reduce((sum, p) => sum + p.price * p.quantity, 0).toFixed(2)}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Delivery Charge
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1" align="right">
                    ${order.deliveryCharge.toFixed(2)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Total
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle1" fontWeight="bold" align="right">
                    ${calculateTotal().toFixed(2)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
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
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Products
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {order.products.map((product, index) => (
                <Card key={product.id} sx={{ mb: 3, border: '1px solid #e0e0e0' }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Product #{index + 1}: {product.productType}
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="textSecondary">
                          Fabric
                        </Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <Typography variant="body1">
                          {product.fabric.name}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={4}>
                        <Typography variant="body2" color="textSecondary">
                          Quantity
                        </Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <Typography variant="body1">
                          {product.quantity}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={4}>
                        <Typography variant="body2" color="textSecondary">
                          Price
                        </Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <Typography variant="body1">
                          ${product.price.toFixed(2)} per unit
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={4}>
                        <Typography variant="body2" color="textSecondary">
                          Subtotal
                        </Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <Typography variant="body1" fontWeight="bold">
                          ${(product.price * product.quantity).toFixed(2)}
                        </Typography>
                      </Grid>
                      
                      {product.description && (
                        <>
                          <Grid item xs={12}>
                            <Typography variant="body2" color="textSecondary">
                              Description
                            </Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="body2">
                              {product.description}
                            </Typography>
                          </Grid>
                        </>
                      )}
                      
                      {product.images.length > 0 && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            Images
                          </Typography>
                          <Box display="flex" flexWrap="wrap" gap={1}>
                            {product.images.map((image) => (
                              <ImagePreview
                                key={image.id}
                                imageId={image.imageId}
                                width={100}
                                height={100}
                              />
                            ))}
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Paper>
          </Grid>
        </Grid>
      </Box>
      
      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)}>
        <DialogTitle>Update Order Status</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label"
                id="status"
                value={newStatus}
                label="Status"
                onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
              >
                <MenuItem value="Created">Created</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="In QA">In QA</MenuItem>
                <MenuItem value="Delivered">Delivered</MenuItem>
                <MenuItem value="Returned">Returned</MenuItem>
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
    </Container>
  );
};

export default OrderDetailPage;
