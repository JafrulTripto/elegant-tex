import React from 'react';
import { Typography, Box } from '@mui/material';
import { Customer } from '../../types/customer';

interface AddressDisplayProps {
  customer: Customer;
  variant?: 'body1' | 'body2' | 'caption';
  showLabel?: boolean;
}

const AddressDisplay: React.FC<AddressDisplayProps> = ({
  customer,
  variant = 'body1',
  showLabel = true
}) => {
  // Check if customer has geographical address information
  const hasGeographicalAddress = customer.address && 
    customer.division && 
    customer.district && 
    customer.upazila;

  const formatGeographicalAddress = () => {
    if (!hasGeographicalAddress) return customer.address;

    const parts = [];
    
    // Add address line if available
    if (customer.addressLine?.trim()) {
      parts.push(customer.addressLine.trim());
    }
    
    // Add geographical hierarchy (with null checks)
    if (customer.upazila?.name) {
      parts.push(customer.upazila.name);
    }
    if (customer.district?.name) {
      parts.push(customer.district.name);
    }
    if (customer.division?.name) {
      parts.push(customer.division.name);
    }
    
    // Add postal code if available
    if (customer.postalCode?.trim()) {
      parts.push(customer.postalCode.trim());
    }
    
    return parts.join(', ');
  };

  const displayAddress = hasGeographicalAddress 
    ? formatGeographicalAddress()
    : customer.address;

  return (
    <Box>
      {showLabel && (
        <Typography variant="body2" color="text.secondary">
          Address
        </Typography>
      )}
      <Typography variant={variant}>
        {displayAddress}
      </Typography>
      {hasGeographicalAddress && customer.landmark?.trim() && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          Landmark: {customer.landmark}
        </Typography>
      )}
    </Box>
  );
};

export default AddressDisplay;
