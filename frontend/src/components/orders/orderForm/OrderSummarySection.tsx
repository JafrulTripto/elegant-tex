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
    <Box 
      sx={{ 
        p: 2, 
        backgroundColor: 'primary.main', 
        color: 'primary.contrastText',
        borderRadius: 1
      }}
    >
      <Grid container spacing={2} alignItems="center">
        <Grid size={{xs:6, sm:4}}>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Products Subtotal
          </Typography>
          <Typography variant="h6" fontWeight={600}>
            <TakaSymble/>  {products.reduce((sum, p) => sum + (p.price || 0) * (p.quantity || 0), 0).toFixed(2)}
          </Typography>
        </Grid>
        <Grid size={{xs:6, sm:4}}>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Delivery Charge
          </Typography>
          <Typography variant="h6" fontWeight={600}>
            <TakaSymble/>  {(deliveryCharge || 0).toFixed(2)}
          </Typography>
        </Grid>
        <Grid size={{xs:12, sm:4}}>
          <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.3)', display: { xs: 'block', sm: 'none' } }} />
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Total Amount
          </Typography>
          <Typography variant="h5" fontWeight={700}>
            <TakaSymble/>  {calculateTotal(products, deliveryCharge || 0).toFixed(2)}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OrderSummarySection;
