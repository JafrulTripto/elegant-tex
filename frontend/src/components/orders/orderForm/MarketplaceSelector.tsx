import React from 'react';
import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import { Field, useFormikContext } from 'formik';
import { Marketplace } from '../../../types/marketplace';
import { OrderType } from '../../../types/orderType';
import { OrderFormData } from '../../../types/order';

interface MarketplaceSelectorProps {
  marketplaces: Marketplace[];
  touched: any;
  errors: any;
}

const MarketplaceSelector: React.FC<MarketplaceSelectorProps> = ({
  marketplaces,
  touched,
  errors
}) => {
  const { values } = useFormikContext<OrderFormData>();
  const isMarketplaceOrder = values.orderType === OrderType.MARKETPLACE;
  
  if (!isMarketplaceOrder) {
    return null; // Don't render marketplace selector for merchant orders
  }
  
  return (
    <FormControl
      fullWidth
      error={touched.marketplaceId && Boolean(errors.marketplaceId)}
    >
      <InputLabel id="marketplace-label">Select Marketplace</InputLabel>
      <Field
        name="marketplaceId"
        as={Select}
        labelId="marketplace-label"
        id="marketplace"
        label="Select Marketplace"
        required
      >
        {marketplaces.map((marketplace) => (
          <MenuItem key={marketplace.id} value={marketplace.id}>
            {marketplace.name}
          </MenuItem>
        ))}
      </Field>
      {touched.marketplaceId && errors.marketplaceId && (
        <FormHelperText>{errors.marketplaceId as string}</FormHelperText>
      )}
    </FormControl>

  );
};

export default MarketplaceSelector;
