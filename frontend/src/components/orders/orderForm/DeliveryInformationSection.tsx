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
import TakaSymble from '@/components/common/TakaSymble';

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
    <Paper sx={{ p: 2.5 }}>
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        Delivery Information
      </Typography>
      <Divider sx={{ mb: 1.5 }} />

      <Grid container spacing={1.5}>
        <Grid size={{xs:12, sm:4}}>
          <FormControl 
            fullWidth
            size="small"
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
        <Grid size={{xs:12, sm:4}}>
          <Field name="deliveryCharge">
            {({ field, meta }: FieldProps) => (
              <TextField
                {...field}
                fullWidth
                size="small"
                label="Delivery Charge"
                type="number"
                slotProps={{
                  input: {
                    startAdornment:(<InputAdornment position="start"> <TakaSymble/>  </InputAdornment>),
                  }
                }}
                error={meta.touched && Boolean(meta.error)}
                helperText={meta.touched && meta.error}
                required
              />
            )}
          </Field>
        </Grid>
        <Grid size={{xs:12, sm:4}}>
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
                  size: 'small',
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
