import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Alert,
  CircularProgress,
  Typography
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { Formik, Form, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { OrderFormData, OrderProductFormData } from '../types/order';
import { ProductType } from '../types/productType';
import { Marketplace } from '../types/marketplace';
import { OrderType } from '../types/orderType';
import { Fabric } from '../types/fabric';
import * as orderService from '../services/order.service';
import * as marketplaceService from '../services/marketplace.service';
import * as fabricService from '../services/fabric.service';
import * as productTypeService from '../services/productType.service';
import { getFileUrl } from '../services/fileStorage.service';
import useAuth from '../hooks/useAuth';
import { canViewAllOrders } from '../utils/permissionUtils';
import CustomerSelection from '../components/customers/CustomerSelection';
import MarketplaceSelector from '../components/orders/orderForm/MarketplaceSelector';
import OrderTypeSelector from '../components/orders/orderForm/OrderTypeSelector';
import DeliveryInformationSection from '../components/orders/orderForm/DeliveryInformationSection';
import ProductFormSection from '../components/orders/orderForm/ProductFormSection';
import OrderSummarySection from '../components/orders/orderForm/OrderSummarySection';

// Validation schema for order form
const OrderValidationSchema = Yup.object().shape({
  orderType: Yup.string()
    .required('Order type is required'),
    
  marketplaceId: Yup.number()
    .when('orderType', {
      is: OrderType.MARKETPLACE,
      then: (schema) => schema.required('Marketplace is required for marketplace orders').min(1, 'Please select a marketplace'),
      otherwise: (schema) => schema.notRequired()
    }),
  
  customerId: Yup.number().nullable(),
  
  customerData: Yup.object().nullable(),
  
  customerValidation: Yup.mixed().test(
    'customer-validation',
    'Please select a customer or fill in all required customer fields',
    function() {
      const { customerId, customerData } = this.parent;
      if (customerId) return true;

      if (customerData && 
          customerData.name && 
          customerData.phone && 
          customerData.address) {
        return true;
      }

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
  const hasViewAllOrdersPermission = authState.user?.permissions ? 
    canViewAllOrders(authState.user.permissions) : false;
  const [accessDenied, setAccessDenied] = useState<boolean>(false);

  // Initial form values
  const initialValues: OrderFormData = {
    orderType: OrderType.MARKETPLACE,
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
          try {
            const orderData = await orderService.getOrderById(parseInt(id));
            
            // Check if user has permission to edit this order
            if (!hasViewAllOrdersPermission && 
                authState.user && 
                orderData.createdBy.id !== authState.user.id) {
              setAccessDenied(true);
              setError('You do not have permission to edit this order. You can only edit orders created by you.');
              setLoading(false);
              return;
            }
            
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
              orderType: orderData.orderType as OrderType,
              marketplaceId: orderData.marketplace?.id || 0,
              customerId: orderData.customer.id,
              customerValidation: undefined, // Added for validation purposes
              deliveryChannel: orderData.deliveryChannel,
              deliveryCharge: orderData.deliveryCharge,
              deliveryDate: orderData.deliveryDate,
              products: transformedProducts
            });
          } catch (err: any) {
            console.error('Error loading order data:', err);
            if (err.response && err.response.status === 403) {
              setAccessDenied(true);
              setError('You do not have permission to edit this order.');
            } else {
              setError('Failed to load order data. Please try again later.');
            }
            setLoading(false);
            return;
          }
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }
  
  if (accessDenied) {
    return (
      <Container maxWidth="lg">
        <Box my={4}>
          <Alert severity="error">
            {error || 'You do not have permission to edit this order. You can only edit orders created by you.'}
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
                {/* Order Type Selection */}
                <Grid size={{xs:12}}>
                  <OrderTypeSelector
                    touched={touched}
                    errors={errors}
                    setFieldValue={setFieldValue}
                  />
                </Grid>
                
                {/* Marketplace Selection */}
                <Grid size={{xs:12}}>
                  <MarketplaceSelector 
                    marketplaces={marketplaces}
                    touched={touched}
                    errors={errors}
                  />
                </Grid>

                {/* Customer Selection */}
                <Grid size={{xs:12}}>
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
                <Grid size={{xs:12}}>
                  <DeliveryInformationSection
                    values={values}
                    touched={touched}
                    errors={errors}
                    setFieldValue={setFieldValue}
                  />
                </Grid>

                {/* Products */}
                <Grid size={{xs:12}}>
                  <ProductFormSection
                    products={values.products}
                    productTypes={productTypes}
                    fabrics={fabrics}
                    handleFabricListScroll={handleFabricListScroll}
                    loadingFabrics={loadingFabrics}
                    touched={touched}
                    errors={errors}
                    setFieldValue={setFieldValue}
                    createEmptyProduct={createEmptyProduct}
                  />
                  
                  {/* Order Summary */}
                  <OrderSummarySection
                    products={values.products}
                    deliveryCharge={values.deliveryCharge}
                  />
                </Grid>

                {/* Submit Button */}
                <Grid size={{xs:12}}>
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
