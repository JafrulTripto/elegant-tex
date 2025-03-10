import React, { useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, FormControl, InputLabel, Select,
  MenuItem, FormControlLabel, Checkbox, Grid, CircularProgress,
  FormHelperText, Typography, Divider, Tooltip, IconButton,
  Alert,
  Box
} from '@mui/material';
import { WorkOrder, WorkOrderRequest } from '../../types/workOrder';
import { User } from '../../types';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Formik, Form, Field, FieldProps, FormikHelpers } from 'formik';
import { Info as InfoIcon } from '@mui/icons-material';
import * as Yup from 'yup';

interface WorkOrderDialogProps {
  open: boolean;
  workOrder: WorkOrder | null;
  users?: User[];
  loading?: boolean;
  onClose: () => void;
  onSave: (workOrder: WorkOrderRequest) => void;
}

const initialValues: WorkOrderRequest = {
  woNumber: '',
  workType: '',
  client: '',
  photoCount: 0,
  state: '',
  clientDueDate: new Date().toISOString().split('T')[0],
  updater: '',
  orderStatus: 'Submitted',
  remarkCategory: '',
  isRush: false,
  userId: undefined
};

// Validation schema for Formik using Yup
const WorkOrderSchema = Yup.object().shape({
  woNumber: Yup.string()
    .required('Work Order Number is required')
    .matches(/^[A-Za-z0-9-]+$/, 'Only alphanumeric characters and hyphens are allowed'),
  
  workType: Yup.string()
    .required('Work Type is required'),
  
  client: Yup.string()
    .required('Client is required'),
  
  photoCount: Yup.number()
    .min(0, 'Photo count must be positive')
    .nullable(),
  
  clientDueDate: Yup.date()
    .required('Due date is required'),
  
  orderStatus: Yup.string()
    .required('Status is required'),
  
  bidAmount: Yup.number()
    .min(0, 'Bid amount must be positive')
    .nullable(),
  
  numberOfBids: Yup.number()
    .min(0, 'Number of bids must be positive')
    .integer('Number of bids must be an integer')
    .nullable()
});

// Work order status options
const statusOptions = [
  { value: 'Submitted', label: 'Submitted' },
  { value: 'RTV Fixed', label: 'RTV Fixed' },
  { value: 'QC Done', label: 'QC Done' },
  { value: 'Saved', label: 'Saved' },
  { value: 'Follow Up', label: 'Follow Up' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Cancelled', label: 'Cancelled' }
];

// Work type options
const workTypeOptions = [
  { value: 'Repair', label: 'Repair' },
  { value: 'Installation', label: 'Installation' },
  { value: 'Maintenance', label: 'Maintenance' },
  { value: 'Inspection', label: 'Inspection' },
  { value: 'Consultation', label: 'Consultation' }
];

// US States
const stateOptions = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' }
];

const WorkOrderDialog: React.FC<WorkOrderDialogProps> = ({
  open,
  workOrder,
  users = [],
  loading = false,
  onClose,
  onSave
}) => {
  const isNewWorkOrder = !workOrder;
  
  const handleSubmit = (values: WorkOrderRequest, { setSubmitting }: FormikHelpers<WorkOrderRequest>) => {
    onSave(values);
    setSubmitting(false);
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6">
          {workOrder ? 'Edit Work Order' : 'Create Work Order'}
        </Typography>
        {workOrder && (
          <Typography variant="subtitle2" color="text.secondary">
            ID: {workOrder.id} | Created: {new Date(workOrder.createdAt).toLocaleDateString()}
          </Typography>
        )}
      </DialogTitle>
      <Formik
        initialValues={workOrder ? {
          woNumber: workOrder.woNumber,
          workType: workOrder.workType,
          client: workOrder.client,
          photoCount: workOrder.photoCount || 0,
          state: workOrder.state || '',
          clientDueDate: workOrder.clientDueDate,
          updater: workOrder.updater || '',
          orderStatus: workOrder.orderStatus,
          remarkCategory: workOrder.remarkCategory || '',
          startTime: workOrder.startTime,
          endTime: workOrder.endTime,
          numberOfBids: workOrder.numberOfBids,
          bidAmount: workOrder.bidAmount,
          isRush: workOrder.isRush,
          userId: workOrder.user?.id
        } : initialValues}
        validationSchema={WorkOrderSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, errors, touched, handleChange, handleBlur, setFieldValue, isSubmitting }) => (
          <Form>
            <DialogContent>
              {isNewWorkOrder && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Creating a new work order. Fill in all required fields marked with *.
                </Alert>
              )}
            
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Field name="woNumber">
                    {({ field, meta }: FieldProps) => (
                      <TextField
                        {...field}
                        fullWidth
                        required
                        label="Work Order Number"
                        error={meta.touched && Boolean(meta.error)}
                        helperText={meta.touched && meta.error}
                        disabled={loading}
                      />
                    )}
                  </Field>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required error={touched.workType && Boolean(errors.workType)}>
                    <InputLabel>Work Type</InputLabel>
                    <Field
                      name="workType"
                      as={Select}
                      label="Work Type"
                      disabled={loading}
                    >
                      {workTypeOptions.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Field>
                    {touched.workType && errors.workType && (
                      <FormHelperText>{errors.workType}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Field name="client">
                    {({ field, meta }: FieldProps) => (
                      <TextField
                        {...field}
                        fullWidth
                        required
                        label="Client"
                        error={meta.touched && Boolean(meta.error)}
                        helperText={meta.touched && meta.error}
                        disabled={loading}
                      />
                    )}
                  </Field>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Field name="photoCount">
                    {({ field, meta }: FieldProps) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Photo Count"
                        type="number"
                        error={meta.touched && Boolean(meta.error)}
                        helperText={meta.touched && meta.error}
                        disabled={loading}
                      />
                    )}
                  </Field>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={touched.state && Boolean(errors.state)}>
                    <InputLabel>State</InputLabel>
                    <Field
                      name="state"
                      as={Select}
                      label="State"
                      disabled={loading}
                    >
                      <MenuItem value="">None</MenuItem>
                      {stateOptions.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.value} - {option.label}
                        </MenuItem>
                      ))}
                    </Field>
                    {touched.state && errors.state && (
                      <FormHelperText>{errors.state}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Client Due Date"
                      value={new Date(values.clientDueDate)}
                      onChange={(date) => {
                        if (date) {
                          setFieldValue('clientDueDate', date.toISOString().split('T')[0]);
                        }
                      }}
                      disabled={loading}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          required: true,
                          error: touched.clientDueDate && Boolean(errors.clientDueDate),
                          helperText: touched.clientDueDate && errors.clientDueDate
                        }
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Field name="updater">
                    {({ field, meta }: FieldProps) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Updater"
                        error={meta.touched && Boolean(meta.error)}
                        helperText={meta.touched && meta.error}
                        disabled={loading}
                      />
                    )}
                  </Field>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required error={touched.orderStatus && Boolean(errors.orderStatus)}>
                    <InputLabel>Order Status</InputLabel>
                    <Field
                      name="orderStatus"
                      as={Select}
                      label="Order Status"
                      disabled={loading}
                    >
                      {statusOptions.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Field>
                    {touched.orderStatus && errors.orderStatus && (
                      <FormHelperText>{errors.orderStatus}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Field name="remarkCategory">
                    {({ field, meta }: FieldProps) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Remark/Category"
                        error={meta.touched && Boolean(meta.error)}
                        helperText={meta.touched && meta.error}
                        disabled={loading}
                      />
                    )}
                  </Field>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Field name="bidAmount">
                    {({ field, meta }: FieldProps) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Bid Amount"
                        type="number"
                        error={meta.touched && Boolean(meta.error)}
                        helperText={meta.touched && meta.error}
                        disabled={loading}
                      />
                    )}
                  </Field>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={touched.userId && Boolean(errors.userId)}>
                    <InputLabel>Assigned User</InputLabel>
                    <Field
                      name="userId"
                      as={Select}
                      label="Assigned User"
                      disabled={loading}
                    >
                      <MenuItem value="">None</MenuItem>
                      {users.map((user) => (
                        <MenuItem key={user.id} value={user.id}>
                          {user.firstName} {user.lastName} ({user.email})
                        </MenuItem>
                      ))}
                    </Field>
                    {touched.userId && errors.userId && (
                      <FormHelperText>{errors.userId}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Additional Options</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Field
                            name="isRush"
                            as={Checkbox}
                            checked={values.isRush}
                            disabled={loading}
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            Rush Order
                            <Tooltip title="Mark this order as high priority">
                              <IconButton size="small">
                                <InfoIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        }
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={onClose} disabled={loading || isSubmitting}>
                Cancel
              </Button>
              <Button 
                type="submit"
                variant="contained" 
                color="primary"
                disabled={loading || isSubmitting}
              >
                {loading || isSubmitting ? <CircularProgress size={24} /> : 'Save'}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default WorkOrderDialog;
