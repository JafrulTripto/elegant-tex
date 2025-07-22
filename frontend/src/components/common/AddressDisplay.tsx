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
  return (
    <Box>
      {showLabel && (
        <Typography variant="body2" color="text.secondary">
          Address
        </Typography>
      )}
      <Typography variant={variant}>
        {customer.address? customer.address.formattedAddress : "No address provided"}
      </Typography>
    </Box>
  );
};

export default AddressDisplay;
