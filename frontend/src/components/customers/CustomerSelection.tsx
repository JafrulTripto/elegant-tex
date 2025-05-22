import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  TextField,
  Typography,
  Paper,
  Grid,
  Button,
  CircularProgress,
  Autocomplete,
  Divider
} from '@mui/material';
import { debounce } from 'lodash';
import { Customer, CustomerRequest } from '../../types/customer';
import * as customerService from '../../services/customer.service';

interface CustomerSelectionProps {
  onCustomerSelected: (customer: Customer | null) => void;
  onCustomerDataChange: (customerData: CustomerRequest) => void;
  initialCustomerId?: number;
}

const CustomerSelection: React.FC<CustomerSelectionProps> = ({
  onCustomerSelected,
  onCustomerDataChange,
  initialCustomerId
}) => {
  // State
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [customerData, setCustomerData] = useState<CustomerRequest>({
    name: '',
    phone: '',
    address: '',
    alternativePhone: '',
    facebookId: ''
  });

  // Track previous initialCustomerId to prevent unnecessary API calls
  const [prevCustomerId, setPrevCustomerId] = useState<number | undefined>(undefined);

  // Load initial customer if ID is provided and has changed
  useEffect(() => {
    const loadInitialCustomer = async () => {
      // Only load if initialCustomerId is defined and different from previous
      if (initialCustomerId && initialCustomerId !== prevCustomerId) {
        try {
          setLoading(true);
          const customer = await customerService.getCustomerById(initialCustomerId);
          setSelectedCustomer(customer);
          // Don't call onCustomerSelected here to avoid potential loops
          setPrevCustomerId(initialCustomerId);
        } catch (error) {
          console.error('Error loading initial customer:', error);
        } finally {
          setLoading(false);
        }
      } else if (!initialCustomerId) {
        // If initialCustomerId is undefined/null, reset the previous ID
        setPrevCustomerId(undefined);
      }
    };

    loadInitialCustomer();
  }, [initialCustomerId, prevCustomerId]);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (term: string) => {
      if (!term || term.length < 3) {
        setCustomers([]);
        return;
      }

      try {
        setLoading(true);
        const result = await customerService.searchCustomers(term);
        setCustomers(result.content);
      } catch (error) {
        console.error('Error searching customers:', error);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  // Handle search term change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    debouncedSearch(value);
  };

  // Handle customer selection
  const handleCustomerSelect = (customer: Customer | null) => {
    if (customer) {
      setSelectedCustomer(customer);
      onCustomerSelected(customer);
      
      // Also update the phone in the new customer form
      // This helps if the user wants to create a new customer with the same phone
      setCustomerData(prev => ({
        ...prev,
        phone: customer.phone
      }));
    } else {
      // If customer is null, reset the selection
      setSelectedCustomer(null);
      onCustomerSelected(null);
    }
  };

  // Handle new customer form changes
  const handleCustomerDataChange = (field: keyof CustomerRequest, value: string) => {
    setCustomerData(prev => {
      const updated = { ...prev, [field]: value };
      onCustomerDataChange(updated);
      return updated;
    });
  };

  // Handle phone search
  const handlePhoneSearch = async () => {
    if (!customerData.phone || customerData.phone.length < 3) {
      return;
    }

    try {
      setLoading(true);
      const customer = await customerService.findCustomerByPhone(customerData.phone);
      
      if (customer) {
        setSelectedCustomer(customer);
        onCustomerSelected(customer);
      } else {
        // No customer found with this phone, keep the form open
        setSelectedCustomer(null);
      }
    } catch (error) {
      console.error('Error finding customer by phone:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Customer Information
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {!selectedCustomer ? (
        <>
          {/* Customer Search */}
          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              Search for Existing Customer
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  options={customers}
                  getOptionLabel={(option) => `${option.phone} - ${option.name}`}
                  loading={loading}
                  onChange={(_, value) => handleCustomerSelect(value)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Search by name or phone"
                      variant="outlined"
                      onChange={handleSearchChange}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loading ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props}>
                      <Box>
                        <Typography variant="body1">{option.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {option.phone}
                        </Typography>
                      </Box>
                    </li>
                  )}
                />
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* New Customer Form */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              New Customer
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={customerData.phone}
                  onChange={(e) => handleCustomerDataChange('phone', e.target.value)}
                  required
                  InputProps={{
                    endAdornment: (
                      <Button
                        onClick={handlePhoneSearch}
                        disabled={!customerData.phone || customerData.phone.length < 3 || loading}
                        size="small"
                      >
                        {loading ? <CircularProgress size={20} /> : 'Search'}
                      </Button>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Name"
                  value={customerData.name}
                  onChange={(e) => handleCustomerDataChange('name', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  value={customerData.address}
                  onChange={(e) => handleCustomerDataChange('address', e.target.value)}
                  multiline
                  rows={2}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Alternative Phone"
                  value={customerData.alternativePhone}
                  onChange={(e) => handleCustomerDataChange('alternativePhone', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Facebook ID"
                  value={customerData.facebookId}
                  onChange={(e) => handleCustomerDataChange('facebookId', e.target.value)}
                />
              </Grid>
            </Grid>
          </Box>
        </>
      ) : (
        /* Selected Customer Display */
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Selected Customer
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Name
                </Typography>
                <Typography variant="body1">{selectedCustomer.name}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Phone
                </Typography>
                <Typography variant="body1">{selectedCustomer.phone}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Address
                </Typography>
                <Typography variant="body1">{selectedCustomer.address}</Typography>
              </Grid>
              {selectedCustomer.alternativePhone && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Alternative Phone
                  </Typography>
                  <Typography variant="body1">{selectedCustomer.alternativePhone}</Typography>
                </Grid>
              )}
              {selectedCustomer.facebookId && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Facebook ID
                  </Typography>
                  <Typography variant="body1">{selectedCustomer.facebookId}</Typography>
                </Grid>
              )}
            </Grid>
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                setSelectedCustomer(null);
                // Reset the customer ID in the parent component
                onCustomerSelected(null);
                // Reset the form data
                const resetData = {
                  name: '',
                  phone: '',
                  address: '',
                  alternativePhone: '',
                  facebookId: ''
                };
                setCustomerData(resetData);
                onCustomerDataChange(resetData);
              }}
              sx={{ mt: 2 }}
            >
              Change Customer
            </Button>
          </Paper>
        </Box>
      )}
    </Paper>
  );
};

export default CustomerSelection;
