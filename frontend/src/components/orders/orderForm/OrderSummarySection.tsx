import React from 'react';
import {
  Box,
  Divider,
  Grid,
  Typography
} from '@mui/material';
import { OrderProductFormData } from '../../../types/order';

interface OrderSummarySectionProps {
  products: OrderProductFormData[];
  deliveryCharge: number;
}

const OrderSummarySection: React.FC<OrderSummarySectionProps> = ({
  products,
  deliveryCharge
}) => {
  // Calculate total price
  const calculateTotal = (products: OrderProductFormData[], deliveryCharge: number) => {
    const productsTotal = products.reduce(
      (sum, product) => sum + product.price * product.quantity,
      0
    );
    
    return productsTotal + deliveryCharge;
  };

  return (
    <Box mt={3}>
      <Typography variant="h6" gutterBottom>
        Order Summary
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography variant="body1">
            Products Subtotal: ${products.reduce((sum, p) => sum + p.price * p.quantity, 0).toFixed(2)}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body1">
            Delivery Charge: ${deliveryCharge.toFixed(2)}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6">
            Total: ${calculateTotal(products, deliveryCharge).toFixed(2)}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OrderSummarySection;
