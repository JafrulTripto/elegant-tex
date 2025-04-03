import React from 'react';
import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography,
  Divider
} from '@mui/material';
import { Field } from 'formik';
import { Marketplace } from '../../../types/marketplace';

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
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Marketplace
      </Typography>
      <Divider sx={{ mb: 2 }} />

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
    </Paper>
  );
};

export default MarketplaceSelector;
