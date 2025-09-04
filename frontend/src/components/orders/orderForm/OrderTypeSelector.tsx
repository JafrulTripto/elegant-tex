import React from 'react';
import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import { Field, FieldProps } from 'formik';
import { OrderType, ORDER_TYPE_OPTIONS } from '../../../types/orderType';

interface OrderTypeSelectorProps {
  touched: any;
  errors: any;
  setFieldValue: (field: string, value: any) => void;
}

const OrderTypeSelector: React.FC<OrderTypeSelectorProps> = ({
  touched,
  errors,
  setFieldValue
}) => {
  return (

      

        <Field name="orderType">
          {({ field }: FieldProps) => (
            <FormControl 
              fullWidth 
              error={touched.orderType && Boolean(errors.orderType)}
            >
              <InputLabel id="order-type-label">Order Type</InputLabel>
              <Select
                {...field}
                labelId="order-type-label"
                id="orderType"
                label="Order Type"
                onChange={(e) => {
                  // Update the orderType field
                  setFieldValue('orderType', e.target.value);
                  
                  // If changing to MERCHANT, clear the marketplaceId
                  if (e.target.value === OrderType.MERCHANT) {
                    setFieldValue('marketplaceId', undefined);
                  }
                }}
              >
                {ORDER_TYPE_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              {touched.orderType && errors.orderType && (
                <FormHelperText error>{errors.orderType}</FormHelperText>
              )}
            </FormControl>
          )}
        </Field>
  );
};

export default OrderTypeSelector;
