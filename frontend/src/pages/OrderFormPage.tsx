import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  IconButton,
  Alert,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { DELIVERY_CHANNELS, OrderFormData, OrderProductFormData } from '../types/order';
import { Marketplace } from '../types/marketplace';
import { Fabric } from '../types/fabric';
import * as orderService from '../services/order.service';
import * as marketplaceService from '../services/marketplace.service';
import * as fabricService from '../services/fabric.service';
import useAuth from '../hooks/useAuth';
import OrderFileUpload from '../components/orders/OrderFileUpload';
import OrderImagePreview from '../components/orders/OrderImagePreview';

const PRODUCT_TYPES = [
  'T-Shirt',
  'Polo Shirt',
  'Hoodie',
  'Sweatshirt',
  'Jacket',
  'Pants',
  'Shorts',
  'Dress',
  'Skirt',
  'Other'
];

const OrderFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { authState } = useAuth();
  const isEditMode = Boolean(id);

  // Form state
  const [formData, setFormData] = useState<OrderFormData>({
    marketplaceId: 0,
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    customerAlternativePhone: '',
    customerFacebookId: '',
    deliveryChannel: '',
    deliveryCharge: 0,
    deliveryDate: new Date().toISOString().split('T')[0],
    products: [createEmptyProduct()]
  });

  // UI state
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [marketplaces, setMarketplaces] = useState<Marketplace[]>([]);
  const [fabrics, setFabrics] = useState<Fabric[]>([]);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Load marketplaces
        const marketplacesResponse = await marketplaceService.getMarketplaces();
        setMarketplaces(marketplacesResponse.content);
        
        // Load fabrics
        const fabricsResponse = await fabricService.getFabrics();
        setFabrics(fabricsResponse.content);
        
        // If edit mode, load order data
        if (isEditMode && id) {
          const orderData = await orderService.getOrderById(parseInt(id));
          
          // Transform order data to form data
          const transformedProducts = orderData.products.map(product => ({
            productType: product.productType,
            fabricId: product.fabric.id,
            quantity: product.quantity,
            price: product.price,
            description: product.description || '',
            imageIds: product.images.map(img => img.imageId),
            tempImages: []
          }));
          
          setFormData({
            marketplaceId: orderData.marketplace.id,
            customerName: orderData.customerName,
            customerPhone: orderData.customerPhone,
            customerAddress: orderData.customerAddress,
            customerAlternativePhone: orderData.customerAlternativePhone || '',
            customerFacebookId: orderData.customerFacebookId || '',
            deliveryChannel: orderData.deliveryChannel,
            deliveryCharge: orderData.deliveryCharge,
            deliveryDate: orderData.deliveryDate,
            products: transformedProducts
          });
        } else if (marketplacesResponse.content.length > 0) {
          // Set default marketplace if available
          setFormData(prev => ({
            ...prev,
            marketplaceId: marketplacesResponse.content[0].id
          }));
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load necessary data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id, isEditMode]);

  // Create empty product
  function createEmptyProduct(): OrderProductFormData {
    return {
      productType: '',
      fabricId: 0,
      quantity: 1,
      price: 0,
      description: '',
      imageIds: [],
      tempImages: []
    };
  }

  // Handle form field changes
  const handleChange = (field: keyof OrderFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle product field changes
  const handleProductChange = (index: number, field: keyof OrderProductFormData, value: any) => {
    setFormData(prev => {
      const updatedProducts = [...prev.products];
      updatedProducts[index] = {
        ...updatedProducts[index],
        [field]: value
      };
      return {
        ...prev,
        products: updatedProducts
      };
    });
  };

  // Handle date change
  const handleDateChange = (date: Date | null) => {
    if (date) {
      const formattedDate = date.toISOString().split('T')[0];
      handleChange('deliveryDate', formattedDate);
    }
  };

  // Add new product
  const handleAddProduct = () => {
    setFormData(prev => ({
      ...prev,
      products: [...prev.products, createEmptyProduct()]
    }));
  };

  // Remove product
  const handleRemoveProduct = (index: number) => {
    setFormData(prev => {
      const updatedProducts = [...prev.products];
      updatedProducts.splice(index, 1);
      return {
        ...prev,
        products: updatedProducts.length ? updatedProducts : [createEmptyProduct()]
      };
    });
  };

  // Handle image upload
  const handleImageUpload = (index: number, files: File[]) => {
    setFormData(prev => {
      const updatedProducts = [...prev.products];
      updatedProducts[index] = {
        ...updatedProducts[index],
        tempImages: [...(updatedProducts[index].tempImages || []), ...files]
      };
      return {
        ...prev,
        products: updatedProducts
      };
    });
  };

  // Remove uploaded image
  const handleRemoveImage = (productIndex: number, imageIndex: number) => {
    setFormData(prev => {
      const updatedProducts = [...prev.products];
      const tempImages = [...(updatedProducts[productIndex].tempImages || [])];
      tempImages.splice(imageIndex, 1);
      updatedProducts[productIndex] = {
        ...updatedProducts[productIndex],
        tempImages
      };
      return {
        ...prev,
        products: updatedProducts
      };
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.marketplaceId) {
      setError('Please select a marketplace');
      return;
    }
    
    if (!formData.customerName || !formData.customerPhone || !formData.customerAddress) {
      setError('Please fill in all required customer fields');
      return;
    }
    
    if (!formData.deliveryChannel || !formData.deliveryDate) {
      setError('Please fill in all required delivery fields');
      return;
    }
    
    const invalidProducts = formData.products.some(
      p => !p.productType || !p.fabricId || p.quantity < 1 || p.price <= 0
    );
    
    if (invalidProducts) {
      setError('Please fill in all required product fields');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      // Convert tempImages to base64 strings
      const productsWithBase64 = await Promise.all(
        formData.products.map(async product => {
          const tempImageBase64 = await Promise.all(
            (product.tempImages || []).map(async file => {
              return new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
              });
            })
          );
          
          return {
            ...product,
            tempImageBase64
          };
        })
      );
      
      // Prepare request data
      const requestData = {
        ...formData,
        products: productsWithBase64.map(p => ({
          productType: p.productType,
          fabricId: p.fabricId,
          quantity: p.quantity,
          price: p.price,
          description: p.description,
          imageIds: p.imageIds,
          tempImageBase64: p.tempImageBase64
        }))
      };
      
      // Submit form
      if (isEditMode && id) {
        await orderService.updateOrder(parseInt(id), requestData);
      } else {
        await orderService.createOrder(requestData);
      }
      
      // Navigate to orders page
      navigate('/orders');
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('Failed to save order. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate total price
  const calculateTotal = () => {
    const productsTotal = formData.products.reduce(
      (sum, product) => sum + product.price * product.quantity,
      0
    );
    
    return productsTotal + formData.deliveryCharge;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Box display="flex" alignItems="center" mb={3}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/orders')}
            sx={{ mr: 2 }}
          >
            Back to Orders
          </Button>
          <Typography variant="h4" component="h1">
            {isEditMode ? 'Edit Order' : 'Create New Order'}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Marketplace Selection */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Marketplace
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <FormControl fullWidth>
                  <InputLabel id="marketplace-label">Select Marketplace</InputLabel>
                  <Select
                    labelId="marketplace-label"
                    id="marketplace"
                    value={formData.marketplaceId || ''}
                    label="Select Marketplace"
                    onChange={(e) => handleChange('marketplaceId', e.target.value)}
                    required
                  >
                    {marketplaces.map((marketplace) => (
                      <MenuItem key={marketplace.id} value={marketplace.id}>
                        {marketplace.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Paper>
            </Grid>

            {/* Customer Information */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Customer Information
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Customer Name"
                      value={formData.customerName}
                      onChange={(e) => handleChange('customerName', e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={formData.customerPhone}
                      onChange={(e) => handleChange('customerPhone', e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Alternative Phone (Optional)"
                      value={formData.customerAlternativePhone}
                      onChange={(e) => handleChange('customerAlternativePhone', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Facebook ID (Optional)"
                      value={formData.customerFacebookId}
                      onChange={(e) => handleChange('customerFacebookId', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Address"
                      multiline
                      rows={3}
                      value={formData.customerAddress}
                      onChange={(e) => handleChange('customerAddress', e.target.value)}
                      required
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Delivery Information */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Delivery Information
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel id="delivery-channel-label">Delivery Channel</InputLabel>
                      <Select
                        labelId="delivery-channel-label"
                        id="deliveryChannel"
                        value={formData.deliveryChannel}
                        label="Delivery Channel"
                        onChange={(e) => handleChange('deliveryChannel', e.target.value)}
                        required
                      >
                        {DELIVERY_CHANNELS.map((channel) => (
                          <MenuItem key={channel} value={channel}>
                            {channel}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Delivery Charge"
                      type="number"
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                      value={formData.deliveryCharge}
                      onChange={(e) => handleChange('deliveryCharge', parseFloat(e.target.value) || 0)}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        label="Delivery Date"
                        value={formData.deliveryDate ? new Date(formData.deliveryDate) : null}
                        onChange={handleDateChange}
                        slotProps={{ textField: { fullWidth: true, required: true } }}
                      />
                    </LocalizationProvider>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Products */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">Products</Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleAddProduct}
                  >
                    Add Product
                  </Button>
                </Box>
                <Divider sx={{ mb: 2 }} />

                {formData.products.map((product, index) => (
                  <Card key={index} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0' }}>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="subtitle1">Product #{index + 1}</Typography>
                        {formData.products.length > 1 && (
                          <IconButton
                            color="error"
                            onClick={() => handleRemoveProduct(index)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </Box>

                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth>
                            <InputLabel id={`product-type-label-${index}`}>Product Type</InputLabel>
                            <Select
                              labelId={`product-type-label-${index}`}
                              id={`productType-${index}`}
                              value={product.productType}
                              label="Product Type"
                              onChange={(e) => handleProductChange(index, 'productType', e.target.value)}
                              required
                            >
                              {PRODUCT_TYPES.map((type) => (
                                <MenuItem key={type} value={type}>
                                  {type}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth>
                            <InputLabel id={`fabric-label-${index}`}>Fabric</InputLabel>
                            <Select
                              labelId={`fabric-label-${index}`}
                              id={`fabric-${index}`}
                              value={product.fabricId || ''}
                              label="Fabric"
                              onChange={(e) => handleProductChange(index, 'fabricId', e.target.value)}
                              required
                            >
                              {fabrics.map((fabric) => (
                                <MenuItem key={fabric.id} value={fabric.id}>
                                  {fabric.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Quantity"
                            type="number"
                            value={product.quantity}
                            onChange={(e) => handleProductChange(index, 'quantity', parseInt(e.target.value) || 1)}
                            InputProps={{ inputProps: { min: 1 } }}
                            required
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Price"
                            type="number"
                            InputProps={{
                              startAdornment: <InputAdornment position="start">$</InputAdornment>,
                              inputProps: { min: 0, step: 0.01 }
                            }}
                            value={product.price}
                            onChange={(e) => handleProductChange(index, 'price', parseFloat(e.target.value) || 0)}
                            required
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Description (Optional)"
                            multiline
                            rows={2}
                            value={product.description}
                            onChange={(e) => handleProductChange(index, 'description', e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" gutterBottom>
                            Product Images (Optional)
                          </Typography>
                          <OrderFileUpload
                            onFileSelect={(files: File[]) => handleImageUpload(index, files)}
                            accept="image/*"
                            multiple
                          />
                          {product.tempImages && product.tempImages.length > 0 && (
                            <Box mt={2} display="flex" flexWrap="wrap" gap={1}>
                              {product.tempImages.map((file, imgIndex) => (
                                <OrderImagePreview
                                  key={imgIndex}
                                  imageUrl={URL.createObjectURL(file)}
                                  imageName={file.name}
                                  onRemove={() => handleRemoveImage(index, imgIndex)}
                                />
                              ))}
                            </Box>
                          )}
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}

                {/* Order Summary */}
                <Box mt={3}>
                  <Typography variant="h6" gutterBottom>
                    Order Summary
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1">
                        Products Subtotal: ${formData.products.reduce((sum, p) => sum + p.price * p.quantity, 0).toFixed(2)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1">
                        Delivery Charge: ${formData.deliveryCharge.toFixed(2)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="h6">
                        Total: ${calculateTotal().toFixed(2)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end">
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : isEditMode ? 'Update Order' : 'Create Order'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Container>
  );
};

export default OrderFormPage;
