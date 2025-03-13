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
  InputAdornment,
  Autocomplete,
  Avatar
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
import { getFileUrl } from '../services/fileStorage.service';
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
  
  // Fabric pagination state
  const [fabricPage, setFabricPage] = useState<number>(0);
  const [fabricPageSize] = useState<number>(50);
  const [hasMoreFabrics, setHasMoreFabrics] = useState<boolean>(true);
  const [loadingFabrics, setLoadingFabrics] = useState<boolean>(false);
  const [fabricSearch, setFabricSearch] = useState<string>('');

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Check if user is authenticated
        if (!authState.user) {
          setError('User not authenticated. Please log in again.');
          setLoading(false);
          return;
        }
        
        // Load active marketplaces associated with the current user
        const userMarketplaces = await marketplaceService.getUserMarketplaces(authState.user.id);
        // Filter only active marketplaces
        const activeMarketplaces = userMarketplaces.filter(marketplace => marketplace.active);
        setMarketplaces(activeMarketplaces);
        
        // Load initial active fabrics with pagination
        await loadFabrics(0);
        
        // If edit mode, load order data
        if (isEditMode && id) {
          const orderData = await orderService.getOrderById(parseInt(id));
          
          // Transform order data to form data
          const transformedProducts = orderData.products.map(product => ({
            id: product.id, // Include the product ID for updates
            productType: product.productType,
            fabricId: product.fabric.id,
            quantity: product.quantity,
            price: product.price,
            description: product.description || '',
            imageIds: product.images.map(img => img.imageId),
            tempImages: [],
            existingImages: product.images.map(img => ({
              id: img.id,
              imageId: img.imageId,
              imageUrl: `/files/${img.imageId}`
            }))
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
        } else if (userMarketplaces.length > 0) {
          // Set default marketplace if available
          setFormData(prev => ({
            ...prev,
            marketplaceId: userMarketplaces[0].id
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
  
  // Function to load fabrics with pagination
  const loadFabrics = async (page: number) => {
    if (!hasMoreFabrics && page > 0) return;
    
    setLoadingFabrics(true);
    try {
      const response = await fabricService.getFabrics(page, fabricPageSize);
      
      // Filter only active fabrics
      const activeFabrics = response.content.filter((fabric: Fabric) => fabric.active);
      
      if (page === 0) {
        setFabrics(activeFabrics);
      } else {
        setFabrics(prev => [...prev, ...activeFabrics]);
      }
      
      // If we filtered out some fabrics, we might need to load more to fill the page
      const filteredOutCount = response.content.length - activeFabrics.length;
      if (filteredOutCount > 0 && !response.last) {
        // Load more fabrics to compensate for filtered out inactive ones
        const nextPage = page + 1;
        const nextResponse = await fabricService.getFabrics(nextPage, filteredOutCount);
        const nextActiveFabrics = nextResponse.content.filter((fabric: Fabric) => fabric.active);
        setFabrics(prev => [...prev, ...nextActiveFabrics]);
        setHasMoreFabrics(!nextResponse.last);
        setFabricPage(nextPage);
      } else {
        setHasMoreFabrics(!response.last);
        setFabricPage(page);
      }
    } catch (error) {
      console.error('Error loading fabrics:', error);
    } finally {
      setLoadingFabrics(false);
    }
  };
  
  // Handle scroll event to load more fabrics
  const handleFabricListScroll = (event: React.UIEvent<HTMLUListElement>) => {
    const listboxNode = event.currentTarget;
    
    if (
      !loadingFabrics &&
      hasMoreFabrics &&
      listboxNode.scrollTop + listboxNode.clientHeight >= listboxNode.scrollHeight - 100
    ) {
      loadFabrics(fabricPage + 1);
    }
  };
  
  // Function to render fabric option with image
  const renderFabricOption = (props: React.HTMLAttributes<HTMLLIElement>, fabric: Fabric) => (
    <li {...props}>
      <Box display="flex" alignItems="center" gap={1}>
        {fabric.imageId ? (
          <Avatar 
            src={getFileUrl(fabric.imageId) || undefined}
            alt={fabric.name}
            variant="rounded"
            sx={{ width: 40, height: 40 }}
          >
            {fabric.name.charAt(0)}
          </Avatar>
        ) : (
          <Avatar 
            variant="rounded"
            sx={{ width: 40, height: 40 }}
          >
            {fabric.name.charAt(0)}
          </Avatar>
        )}
        <Typography>{fabric.name}</Typography>
      </Box>
    </li>
  );

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
      
      // Replace the tempImages array with the new files array
      // This is important because OrderFileUpload is passing the complete list of files
      updatedProducts[index] = {
        ...updatedProducts[index],
        tempImages: files // Use the files directly, don't append to existing
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
      // Create a new array for tempImages
      const tempImages = [...(updatedProducts[productIndex].tempImages || [])];
      // Remove the image at the specified index
      tempImages.splice(imageIndex, 1);
      // Update the product with the new tempImages array
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
      // Submit form with the current formData (no need to convert to base64)
      if (isEditMode && id) {
        await orderService.updateOrder(parseInt(id), formData);
      } else {
        await orderService.createOrder(formData);
      }
      
      // Navigate to orders page
      navigate('/orders');
    } catch (err: any) {
      console.error('Error submitting form:', err);
      
      // Display specific error message if available
      if (err.message) {
        setError(err.message);
      } else {
        setError('Failed to save order. Please try again later.');
      }
      
      // If it's a file size error, scroll to the top to make sure the error is visible
      if (err.message && err.message.includes('file size')) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
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
                          <Autocomplete
                            id={`fabric-${index}`}
                            options={fabrics}
                            getOptionLabel={(option) => option.name}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            value={fabrics.find(f => f.id === product.fabricId) || null}
                            onChange={(_, newValue) => handleProductChange(index, 'fabricId', newValue?.id || 0)}
                            renderInput={(params) => (
                              <TextField {...params} label="Fabric" required />
                            )}
                            renderOption={renderFabricOption}
                            ListboxProps={{
                              onScroll: handleFabricListScroll
                            }}
                            loading={loadingFabrics}
                            loadingText="Loading fabrics..."
                          />
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
                          
                          {/* Display existing images if any */}
                          {product.existingImages && product.existingImages.length > 0 && (
                            <Box mb={2}>
                              <Typography variant="body2" color="textSecondary" gutterBottom>
                                Existing Images:
                              </Typography>
                              <Box display="flex" flexWrap="wrap" gap={1}>
                                {product.existingImages.map((image, imgIndex) => (
                                  <OrderImagePreview
                                    key={`existing-${imgIndex}-${image.imageId}`}
                                    imageId={image.imageId}
                                    width={100}
                                    height={100}
                                    showDeleteButton={true}
                                    onDelete={() => {
                                      // Remove from imageIds
                                      const updatedProducts = [...formData.products];
                                      const updatedImageIds = [...(updatedProducts[index].imageIds || [])];
                                      const idIndex = updatedImageIds.indexOf(image.imageId);
                                      if (idIndex !== -1) {
                                        updatedImageIds.splice(idIndex, 1);
                                      }
                                      
                                      // Remove from existingImages
                                      const updatedExistingImages = [...(updatedProducts[index].existingImages || [])];
                                      updatedExistingImages.splice(imgIndex, 1);
                                      
                                      // Update the product
                                      updatedProducts[index] = {
                                        ...updatedProducts[index],
                                        imageIds: updatedImageIds,
                                        existingImages: updatedExistingImages
                                      };
                                      
                                      setFormData(prev => ({
                                        ...prev,
                                        products: updatedProducts
                                      }));
                                    }}
                                  />
                                ))}
                              </Box>
                            </Box>
                          )}
                          
                          {/* Upload new images */}
                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            {product.existingImages && product.existingImages.length > 0 ? 'Add New Images:' : 'Upload Images:'}
                          </Typography>
                          <OrderFileUpload
                            onFileSelect={(files: File[]) => handleImageUpload(index, files)}
                            selectedFiles={product.tempImages || []}
                            onRemoveFile={(imgIndex) => handleRemoveImage(index, imgIndex)}
                            accept="image/*"
                            multiple
                            maxFileSize={5} // 5MB max file size
                          />
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
