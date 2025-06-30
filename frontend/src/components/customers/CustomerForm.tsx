import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';
import { CustomerRequest } from '../../types/customer';

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
        if (!value.trim()) {
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
        <Grid item xs={12}>
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
        </Grid>
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
