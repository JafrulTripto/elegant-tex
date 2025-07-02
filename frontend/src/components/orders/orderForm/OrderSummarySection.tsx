import React from 'react';
import {
  Box,
  Divider,
  Typography
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { OrderProductFormData } from '../../../types/order';
import TakaSymble from '@/components/common/TakaSymble';

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
      (sum, product) => sum + (product.price || 0) * (product.quantity || 0),
      0
    );
    
    return productsTotal + (deliveryCharge || 0);
  };

  return (
    <Box mt={3}>
      <Typography variant="h6" gutterBottom>
        Order Summary
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Grid container spacing={2}>
        <Grid size={{xs:12, sm:6}}>
          <Typography variant="body1">
            Products Subtotal: <TakaSymble/>  {products.reduce((sum, p) => sum + (p.price || 0) * (p.quantity || 0), 0).toFixed(2)}
          </Typography>
        </Grid>
        <Grid size={{xs:12, sm:6}}>
          <Typography variant="body1">
            Delivery Charge: <TakaSymble/>  {(deliveryCharge || 0).toFixed(2)}
          </Typography>
        </Grid>
        <Grid size={{xs:12}}>
          <Typography variant="h6">
            Total: <TakaSymble/>  {calculateTotal(products, deliveryCharge || 0).toFixed(2)}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OrderSummarySection;
