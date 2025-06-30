import React from 'react';
import {
  Divider,
  FormControl,
  FormHelperText,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Field, FieldProps } from 'formik';
import { DELIVERY_CHANNELS } from '../../../types/order';

interface DeliveryInformationSectionProps {
  values: {
    deliveryDate: string;
  };
  touched: any;
  errors: any;
  setFieldValue: (field: string, value: any) => void;
}

const DeliveryInformationSection: React.FC<DeliveryInformationSectionProps> = ({
  values,
  touched,
  errors,
  setFieldValue
}) => {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Delivery Information
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Grid container spacing={2}>
        <Grid size={{xs:12, sm:6}}>
          <FormControl 
            fullWidth
            error={touched.deliveryChannel && Boolean(errors.deliveryChannel)}
          >
            <InputLabel id="delivery-channel-label">Delivery Channel</InputLabel>
            <Field
              name="deliveryChannel"
              as={Select}
              labelId="delivery-channel-label"
              id="deliveryChannel"
              label="Delivery Channel"
              required
            >
              {DELIVERY_CHANNELS.map((channel) => (
                <MenuItem key={channel} value={channel}>
                  {channel}
                </MenuItem>
              ))}
            </Field>
            {touched.deliveryChannel && errors.deliveryChannel && (
              <FormHelperText>{errors.deliveryChannel as string}</FormHelperText>
            )}
          </FormControl>
        </Grid>
        <Grid size={{xs:12, sm:6}}>
          <Field name="deliveryCharge">
            {({ field, meta }: FieldProps) => (
              <TextField
                {...field}
                fullWidth
                label="Delivery Charge"
                type="number"
                slotProps={{
                  input: {
                    startAdornment:(<InputAdornment position="start"> ৳</InputAdornment>),
                  }
                }}
                error={meta.touched && Boolean(meta.error)}
                helperText={meta.touched && meta.error}
                required
              />
            )}
          </Field>
        </Grid>
        <Grid size={{xs:12, sm:6}}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Delivery Date"
              value={values.deliveryDate ? new Date(values.deliveryDate) : null}
              onChange={(date) => {
                if (date) {
                  setFieldValue('deliveryDate', date.toISOString().split('T')[0]);
                }
              }}
              slotProps={{ 
                textField: { 
                  fullWidth: true, 
                  required: true,
                  error: touched.deliveryDate && Boolean(errors.deliveryDate),
                  helperText: touched.deliveryDate && (errors.deliveryDate as string)
                } 
              }}
            />
          </LocalizationProvider>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default DeliveryInformationSection;
