import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Grid,
  Alert,
  CircularProgress,
  FormControlLabel,
  Switch,
  Divider
} from '@mui/material';
import { CustomerRequest } from '../../types/customer';
import { AddressFormData, AddressType } from '../../types/geographical';
import AddressSelector from '../common/AddressSelector';

interface CustomerFormProps {
  initialData: CustomerRequest;
  onDataChange: (data: CustomerRequest) => void;
  isSubmitting?: boolean;
  submitError?: string;
}

const CustomerForm: React.FC<CustomerFormProps> = ({
  initialData,
  onDataChange,
  isSubmitting = false,
  submitError
}) => {
  const [formData, setFormData] = useState<CustomerRequest>(initialData);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [useNewAddressSystem, setUseNewAddressSystem] = useState(false);
  const [addressData, setAddressData] = useState<AddressFormData>({
    divisionId: null,
    districtId: null,
    upazilaId: null,
    addressLine: '',
    postalCode: '',
    landmark: '',
    addressType: AddressType.PRIMARY
  });

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (field: keyof CustomerRequest, value: string) => {
    const updatedData = {
      ...formData,
      [field]: value
    };
    
    setFormData(updatedData);
    validateField(field, value);
    onDataChange(updatedData);
  };

  // Handle address data change
  const handleAddressChange = (newAddressData: AddressFormData) => {
    setAddressData(newAddressData);
    // For now, we'll still update the legacy address field for backward compatibility
    // In the future, this will be handled differently when we have full address entity support
    if (newAddressData.addressLine && newAddressData.divisionId && newAddressData.districtId && newAddressData.upazilaId) {
      const formattedAddress = `${newAddressData.addressLine}${newAddressData.landmark ? ', ' + newAddressData.landmark : ''}${newAddressData.postalCode ? ', ' + newAddressData.postalCode : ''}`;
      handleChange('address', formattedAddress);
    }
  };

  // Handle address system toggle
  const handleAddressSystemToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUseNewAddressSystem(event.target.checked);
    if (!event.target.checked) {
      // Reset address data when switching back to legacy system
      setAddressData({
        divisionId: null,
        districtId: null,
        upazilaId: null,
        addressLine: '',
        postalCode: '',
        landmark: '',
        addressType: AddressType.PRIMARY
      });
    }
  };

  // Validate a single field
  const validateField = (field: keyof CustomerRequest, value: string) => {
    const errors = { ...validationErrors };
    
    switch (field) {
      case 'name':
        if (!value.trim()) {
          errors.name = 'Name is required';
        } else {
          delete errors.name;
        }
        break;
        
      case 'phone':
        if (!value.trim()) {
          errors.phone = 'Phone is required';
        } else if (!/^[0-9+\-\s()]{7,15}$/.test(value)) {
          errors.phone = 'Please enter a valid phone number';
        } else {
          delete errors.phone;
        }
        break;
        
      case 'address':
        if (!useNewAddressSystem && !value.trim()) {
          errors.address = 'Address is required';
        } else {
          delete errors.address;
        }
        break;
      default:
        break;
    }
    
    setValidationErrors(errors);
  };

  // Validate new address system
  const validateNewAddress = () => {
    const errors = { ...validationErrors };
    
    if (useNewAddressSystem) {
      if (!addressData.divisionId) {
        errors.divisionId = 'Division is required';
      } else {
        delete errors.divisionId;
      }
      
      if (!addressData.districtId) {
        errors.districtId = 'District is required';
      } else {
        delete errors.districtId;
      }
      
      if (!addressData.upazilaId) {
        errors.upazilaId = 'Upazila is required';
      } else {
        delete errors.upazilaId;
      }
      
      if (!addressData.addressLine.trim()) {
        errors.addressLine = 'Address line is required';
      } else {
        delete errors.addressLine;
      }
    }
    
    setValidationErrors(errors);
  };

  // Validate new address when address data changes
  useEffect(() => {
    if (useNewAddressSystem) {
      validateNewAddress();
    }
  }, [addressData, useNewAddressSystem]);

  return (
    <Box sx={{ pt: 2 }}>
      {submitError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {submitError}
        </Alert>
      )}
      
      {Object.keys(validationErrors).length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Please fix the validation errors before submitting.
        </Alert>
      )}
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={!!validationErrors.name}
            helperText={validationErrors.name}
            required
            disabled={isSubmitting}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Phone"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            error={!!validationErrors.phone}
            helperText={validationErrors.phone}
            required
            disabled={isSubmitting}
          />
        </Grid>
        {/* Address System Toggle */}
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={useNewAddressSystem}
                onChange={handleAddressSystemToggle}
                disabled={isSubmitting}
              />
            }
            label="Use detailed address system (Division, District, Upazila)"
          />
        </Grid>

        {/* Address Input */}
        <Grid item xs={12}>
          {useNewAddressSystem ? (
            <AddressSelector
              value={addressData}
              onChange={handleAddressChange}
              error={{
                divisionId: validationErrors.divisionId,
                districtId: validationErrors.districtId,
                upazilaId: validationErrors.upazilaId,
                addressLine: validationErrors.addressLine
              }}
              disabled={isSubmitting}
              required={true}
            />
          ) : (
            <TextField
              fullWidth
              label="Address"
              multiline
              rows={3}
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              error={!!validationErrors.address}
              helperText={validationErrors.address}
              required
              disabled={isSubmitting}
            />
          )}
        </Grid>

        {useNewAddressSystem && (
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
          </Grid>
        )}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Alternative Phone (Optional)"
            value={formData.alternativePhone}
            onChange={(e) => handleChange('alternativePhone', e.target.value)}
            disabled={isSubmitting}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Facebook ID (Optional)"
            value={formData.facebookId}
            onChange={(e) => handleChange('facebookId', e.target.value)}
            disabled={isSubmitting}
          />
        </Grid>
      </Grid>
      
      {isSubmitting && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}
    </Box>
  );
};

export default CustomerForm;
