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
  Avatar,
  FormHelperText
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { Formik, Form, Field, FieldProps, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { DELIVERY_CHANNELS, OrderFormData, OrderProductFormData } from '../types/order';
import { ProductType } from '../types/productType';
import { Marketplace } from '../types/marketplace';
import { Fabric } from '../types/fabric';
import * as orderService from '../services/order.service';
import * as marketplaceService from '../services/marketplace.service';
import * as fabricService from '../services/fabric.service';
import * as productTypeService from '../services/productType.service';
import { getFileUrl } from '../services/fileStorage.service';
import useAuth from '../hooks/useAuth';
import OrderFileUpload from '../components/orders/OrderFileUpload';
import OrderImagePreview from '../components/orders/OrderImagePreview';
import CustomerSelection from '../components/customers/CustomerSelection';

// Validation schema for order form
const OrderValidationSchema = Yup.object().shape({
  marketplaceId: Yup.number()
    .required('Marketplace is required')
    .min(1, 'Please select a marketplace'),
  
  customerId: Yup.number().nullable(),
  
  customerData: Yup.object().nullable(),
  
  // Custom test to validate customer information
  // Either customerId must be provided OR customerData must be complete
  customerValidation: Yup.mixed().test(
    'customer-validation',
    'Please select a customer or fill in all required customer fields',
    function() {
      const { customerId, customerData } = this.parent;
      
      // If customerId is provided, we're good
      if (customerId) return true;
      
      // If no customerId, then customerData must be complete
      if (customerData && 
          customerData.name && 
          customerData.phone && 
          customerData.address) {
        return true;
      }
      
      // Neither condition met, validation fails
      return false;
    }
  ),
  
  deliveryChannel: Yup.string()
    .required('Delivery channel is required'),
  
  deliveryCharge: Yup.number()
    .required('Delivery charge is required')
    .min(0, 'Delivery charge must be a positive number'),
  
  deliveryDate: Yup.date()
    .required('Delivery date is required'),
  
  products: Yup.array().of(
    Yup.object().shape({
      productType: Yup.string()
        .required('Product type is required'),
      
      fabricId: Yup.number()
        .required('Fabric is required')
        .min(1, 'Please select a fabric'),
      
      quantity: Yup.number()
        .required('Quantity is required')
        .min(1, 'Quantity must be at least 1'),
      
      price: Yup.number()
        .required('Price is required')
        .min(0.01, 'Price must be greater than 0'),
      
      description: Yup.string()
        .notRequired(),
      
      imageIds: Yup.array()
        .notRequired(),
      
      tempImages: Yup.array()
        .notRequired()
    })
  ).min(1, 'At least one product is required')
});

const OrderFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { authState } = useAuth();
  const isEditMode = Boolean(id);

  // Initial form values
  const initialValues: OrderFormData = {
    marketplaceId: 0,
    customerId: undefined,
    customerData: {
      name: '',
      phone: '',
      address: '',
      alternativePhone: '',
      facebookId: ''
    },
    customerValidation: undefined, // Added for validation purposes
    deliveryChannel: '',
    deliveryCharge: 0,
    deliveryDate: new Date().toISOString().split('T')[0],
    products: [createEmptyProduct()]
  };

  // UI state
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [marketplaces, setMarketplaces] = useState<Marketplace[]>([]);
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [formValues, setFormValues] = useState<OrderFormData>(initialValues);
  
  // Fabric pagination state
  const [fabricPage, setFabricPage] = useState<number>(0);
  const [fabricPageSize] = useState<number>(50);
  const [hasMoreFabrics, setHasMoreFabrics] = useState<boolean>(true);
  const [loadingFabrics, setLoadingFabrics] = useState<boolean>(false);

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
        
        // Load active product types
        const productTypesData = await productTypeService.getActiveProductTypes();
        setProductTypes(productTypesData);
        
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
              imageUrl: getFileUrl(img.imageId) || ''
            }))
          }));
          
          setFormValues({
            marketplaceId: orderData.marketplace.id,
            customerId: orderData.customer.id,
            customerValidation: undefined, // Added for validation purposes
            deliveryChannel: orderData.deliveryChannel,
            deliveryCharge: orderData.deliveryCharge,
            deliveryDate: orderData.deliveryDate,
            products: transformedProducts
          });
        } else if (userMarketplaces.length > 0) {
          // Set default marketplace if available
          setFormValues(prev => ({
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
  }, [id, isEditMode, authState.user]);
  
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
  const renderFabricOption = (props: React.ComponentPropsWithRef<'li'>, fabric: Fabric) => {
    const { key, ...otherProps } = props;
    return (
      <li key={key} {...otherProps}>
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
  };

  // Handle form submission
  const handleSubmit = async (values: OrderFormData, { setSubmitting }: FormikHelpers<OrderFormData>) => {
    setError(null);
    
    try {
      // Submit form with the current values
      if (isEditMode && id) {
        await orderService.updateOrder(parseInt(id), values);
      } else {
        await orderService.createOrder(values);
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
  const calculateTotal = (products: OrderProductFormData[], deliveryCharge: number) => {
    const productsTotal = products.reduce(
      (sum, product) => sum + product.price * product.quantity,
      0
    );
    
    return productsTotal + deliveryCharge;
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

        <Formik
          initialValues={formValues}
          validationSchema={OrderValidationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, errors, touched, setFieldValue, isSubmitting }) => (
            <Form noValidate>
              <Grid container spacing={3}>
                {/* Marketplace Selection */}
                <Grid item xs={12}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Marketplace
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    <FormControl 
                      fullWidth 
                      error={touched.marketplaceId && Boolean(errors.marketplaceId)}
                    >
                      <InputLabel id="marketplace-label">Select Marketplace</InputLabel>
                      <Field
                        name="marketplaceId"
                        as={Select}
                        labelId="marketplace-label"
                        id="marketplace"
                        label="Select Marketplace"
                        required
                      >
                        {marketplaces.map((marketplace) => (
                          <MenuItem key={marketplace.id} value={marketplace.id}>
                            {marketplace.name}
                          </MenuItem>
                        ))}
                      </Field>
                      {touched.marketplaceId && errors.marketplaceId && (
                        <FormHelperText>{errors.marketplaceId as string}</FormHelperText>
                      )}
                    </FormControl>
                  </Paper>
                </Grid>

                {/* Customer Selection */}
                <Grid item xs={12}>
                  <CustomerSelection
                    onCustomerSelected={(customer) => {
                      setFieldValue('customerId', customer?.id);
                      setFieldValue('customerData', customer ? undefined : {
                        name: '',
                        phone: '',
                        address: '',
                        alternativePhone: '',
                        facebookId: ''
                      });
                    }}
                    onCustomerDataChange={(customerData) => {
                      setFieldValue('customerId', undefined);
                      setFieldValue('customerData', customerData);
                    }}
                    initialCustomerId={values.customerId}
                  />
                  {errors.customerValidation && (
                    <Alert severity="error" sx={{ mt: 1 }}>
                      {errors.customerValidation as string}
                    </Alert>
                  )}
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
                        <FormControl 
                          fullWidth
                          error={touched.deliveryChannel && Boolean(errors.deliveryChannel)}
                        >
                          <InputLabel id="delivery-channel-label">Delivery Channel</InputLabel>
                          <Field
                            name="deliveryChannel"
                            as={Select}
                            labelId="delivery-channel-label"
                            id="deliveryChannel"
                            label="Delivery Channel"
                            required
                          >
                            {DELIVERY_CHANNELS.map((channel) => (
                              <MenuItem key={channel} value={channel}>
                                {channel}
                              </MenuItem>
                            ))}
                          </Field>
                          {touched.deliveryChannel && errors.deliveryChannel && (
                            <FormHelperText>{errors.deliveryChannel as string}</FormHelperText>
                          )}
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Field name="deliveryCharge">
                          {({ field, meta }: FieldProps) => (
                            <TextField
                              {...field}
                              fullWidth
                              label="Delivery Charge"
                              type="number"
                              InputProps={{
                                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                inputProps: { step: 0.01 } // Remove min to use Formik/Yup validation instead
                              }}
                              error={meta.touched && Boolean(meta.error)}
                              helperText={meta.touched && meta.error}
                              required
                            />
                          )}
                        </Field>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <DatePicker
                            label="Delivery Date"
                            value={values.deliveryDate ? new Date(values.deliveryDate) : null}
                            onChange={(date) => {
                              if (date) {
                                setFieldValue('deliveryDate', date.toISOString().split('T')[0]);
                              }
                            }}
                            slotProps={{ 
                              textField: { 
                                fullWidth: true, 
                                required: true,
                                error: touched.deliveryDate && Boolean(errors.deliveryDate),
                                helperText: touched.deliveryDate && (errors.deliveryDate as string)
                              } 
                            }}
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
                        onClick={() => {
                          const updatedProducts = [...values.products, createEmptyProduct()];
                          setFieldValue('products', updatedProducts);
                        }}
                      >
                        Add Product
                      </Button>
                    </Box>
                    <Divider sx={{ mb: 2 }} />

                    {values.products.map((product, index) => (
                      <Card key={index} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0' }}>
                        <CardContent>
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="subtitle1">Product #{index + 1}</Typography>
                            {values.products.length > 1 && (
                              <IconButton
                                color="error"
                                onClick={() => {
                                  const updatedProducts = [...values.products];
                                  updatedProducts.splice(index, 1);
                                  setFieldValue('products', updatedProducts.length ? updatedProducts : [createEmptyProduct()]);
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            )}
                          </Box>

                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <FormControl 
                                fullWidth
                                error={
                                  touched.products && 
                                  Array.isArray(touched.products) &&
                                  touched.products[index] && 
                                  touched.products[index]?.productType && 
                                  Boolean(errors.products && 
                                  Array.isArray(errors.products) &&
                                  errors.products[index] && 
                                  typeof errors.products[index] === 'object' &&
                                  'productType' in errors.products[index])
                                }
                              >
                                <InputLabel id={`product-type-label-${index}`}>Product Type</InputLabel>
                                <Field
                                  name={`products[${index}].productType`}
                                  as={Select}
                                  labelId={`product-type-label-${index}`}
                                  id={`productType-${index}`}
                                  label="Product Type"
                                  required
                                >
                                  {productTypes.map((type) => (
                                    <MenuItem key={type.id} value={type.name}>
                                      {type.name}
                                    </MenuItem>
                                  ))}
                                </Field>
                                {touched.products && 
                                 Array.isArray(touched.products) &&
                                 touched.products[index] && 
                                 touched.products[index]?.productType && 
                                 errors.products && 
                                 Array.isArray(errors.products) &&
                                 errors.products[index] && 
                                 typeof errors.products[index] === 'object' &&
                                 'productType' in errors.products[index] && (
                                  <FormHelperText>{(errors.products[index] as any).productType}</FormHelperText>
                                )}
                              </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Autocomplete
                                id={`fabric-${index}`}
                                options={fabrics}
                                getOptionLabel={(option) => option.name}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                value={fabrics.find(f => f.id === product.fabricId) || null}
                                onChange={(_, newValue) => {
                                  setFieldValue(`products[${index}].fabricId`, newValue?.id || 0);
                                }}
                                renderInput={(params) => (
                                  <TextField 
                                    {...params} 
                                    label="Fabric" 
                                    required
                                    error={
                                      touched.products && 
                                      Array.isArray(touched.products) &&
                                      touched.products[index] && 
                                      touched.products[index]?.fabricId && 
                                      Boolean(errors.products && 
                                      Array.isArray(errors.products) &&
                                      errors.products[index] && 
                                      typeof errors.products[index] === 'object' &&
                                      'fabricId' in errors.products[index])
                                    }
                                    helperText={
                                      touched.products && 
                                      Array.isArray(touched.products) &&
                                      touched.products[index] && 
                                      touched.products[index]?.fabricId && 
                                      errors.products && 
                                      Array.isArray(errors.products) &&
                                      errors.products[index] && 
                                      typeof errors.products[index] === 'object' &&
                                      'fabricId' in errors.products[index] ?
                                      (errors.products[index] as any).fabricId : undefined
                                    }
                                  />
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
                              <Field name={`products[${index}].quantity`}>
                                {({ field, meta }: FieldProps) => (
                                  <TextField
                                    {...field}
                                    fullWidth
                                    label="Quantity"
                                    type="number"
                                    InputProps={{ 
                                      inputProps: { min: 0 } // Use Formik/Yup validation instead of browser validation
                                    }}
                                    error={meta.touched && Boolean(meta.error)}
                                    helperText={meta.touched && meta.error}
                                    required
                                  />
                                )}
                              </Field>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Field name={`products[${index}].price`}>
                                {({ field, meta }: FieldProps) => (
                                  <TextField
                                    {...field}
                                    fullWidth
                                    label="Price"
                                    type="number"
                                    InputProps={{
                                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                      inputProps: { step: 0.01 } // Remove min to use Formik/Yup validation instead
                                    }}
                                    error={meta.touched && Boolean(meta.error)}
                                    helperText={meta.touched && meta.error}
                                    required
                                  />
                                )}
                              </Field>
                            </Grid>
                            <Grid item xs={12}>
                              <Field name={`products[${index}].description`}>
                                {({ field, meta }: FieldProps) => (
                                  <TextField
                                    {...field}
                                    fullWidth
                                    label="Description (Optional)"
                                    multiline
                                    rows={2}
                                    error={meta.touched && Boolean(meta.error)}
                                    helperText={meta.touched && meta.error}
                                  />
                                )}
                              </Field>
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
                                          const updatedImageIds = [...(product.imageIds || [])];
                                          const idIndex = updatedImageIds.indexOf(image.imageId);
                                          if (idIndex !== -1) {
                                            updatedImageIds.splice(idIndex, 1);
                                          }
                                          
                                          // Remove from existingImages
                                          const updatedExistingImages = [...(product.existingImages || [])];
                                          updatedExistingImages.splice(imgIndex, 1);
                                          
                                          // Update the product
                                          setFieldValue(`products[${index}].imageIds`, updatedImageIds);
                                          setFieldValue(`products[${index}].existingImages`, updatedExistingImages);
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
                                onFileSelect={(files: File[]) => {
                                  setFieldValue(`products[${index}].tempImages`, files);
                                }}
                                selectedFiles={product.tempImages || []}
                                onRemoveFile={(imgIndex) => {
                                  const tempImages = [...(product.tempImages || [])];
                                  tempImages.splice(imgIndex, 1);
                                  setFieldValue(`products[${index}].tempImages`, tempImages);
                                }}
                                accept="image/*"
                                multiple
                                maxFileSize={5} // 5MB max file size
                              />
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    ))}

                    {errors.products && typeof errors.products === 'string' && (
                      <Alert severity="error" sx={{ mt: 1, mb: 2 }}>
                        {errors.products}
                      </Alert>
                    )}

                    {/* Order Summary */}
                    <Box mt={3}>
                      <Typography variant="h6" gutterBottom>
                        Order Summary
                      </Typography>
                      <Divider sx={{ mb: 2 }} />

                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body1">
                            Products Subtotal: ${values.products.reduce((sum, p) => sum + p.price * p.quantity, 0).toFixed(2)}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body1">
                            Delivery Charge: ${values.deliveryCharge.toFixed(2)}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="h6">
                            Total: ${calculateTotal(values.products, values.deliveryCharge).toFixed(2)}
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
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Saving...' : isEditMode ? 'Update Order' : 'Create Order'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </Box>
    </Container>
  );
};

export default OrderFormPage;
