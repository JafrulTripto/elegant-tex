import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';
import { CustomerRequest } from '../../types/customer';
import { AddressFormData } from '../../types/geographical';
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
  const [addressData, setAddressData] = useState<AddressFormData>({
    divisionId: initialData.divisionId || null,
    districtId: initialData.districtId || null,
    upazilaId: initialData.upazilaId || null,
    addressLine: initialData.addressLine || '',
    postalCode: initialData.postalCode || ''
  });

  useEffect(() => {
    setFormData(initialData);
    setAddressData({
      divisionId: initialData.divisionId || null,
      districtId: initialData.districtId || null,
      upazilaId: initialData.upazilaId || null,
      addressLine: initialData.addressLine || '',
      postalCode: initialData.postalCode || ''
    });
  }, [initialData]);

  const handleChange = (field: keyof CustomerRequest, value: string | number) => {
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
    
    // Update form data with address fields
    const updatedData = {
      ...formData,
      divisionId: newAddressData.divisionId || 0,
      districtId: newAddressData.districtId || 0,
      upazilaId: newAddressData.upazilaId || 0,
      addressLine: newAddressData.addressLine,
      postalCode: newAddressData.postalCode || ''
    };
    
    setFormData(updatedData);
    validateAddressFields(newAddressData);
    onDataChange(updatedData);
  };

  // Validate a single field
  const validateField = (field: keyof CustomerRequest, value: string | number) => {
    const errors = { ...validationErrors };
    
    switch (field) {
      case 'name':
        if (!String(value).trim()) {
          errors.name = 'Name is required';
        } else {
          delete errors.name;
        }
        break;
        
      case 'phone':
        if (!String(value).trim()) {
          errors.phone = 'Phone is required';
        } else if (!/^[0-9+\-\s()]{7,15}$/.test(String(value))) {
          errors.phone = 'Please enter a valid phone number';
        } else {
          delete errors.phone;
        }
        break;
        
      default:
        break;
    }
    
    setValidationErrors(errors);
  };

  // Validate address fields
  const validateAddressFields = (addressData: AddressFormData) => {
    const errors = { ...validationErrors };
    
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
    
    setValidationErrors(errors);
  };

  // Validate address when address data changes
  useEffect(() => {
    validateAddressFields(addressData);
  }, [addressData]);

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

        {/* Address Input - Always use AddressSelector */}
        <Grid item xs={12}>
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
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Alternative Phone (Optional)"
            value={formData.alternativePhone || ''}
            onChange={(e) => handleChange('alternativePhone', e.target.value)}
            disabled={isSubmitting}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Facebook ID (Optional)"
            value={formData.facebookId || ''}
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
