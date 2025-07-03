import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  CircularProgress,
  FormHelperText,
  SelectChangeEvent
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { OrderType } from '../../types/orderType';
import { OrderStatus, STATUS_OPTIONS } from '../../types/order';

interface OrderExcelExportDialogProps {
  open: boolean;
  onClose: () => void;
  onExport: (status: OrderStatus | null, orderType: OrderType | null, startDate: Date | null, endDate: Date | null) => void;
  loading: boolean;
}

const OrderExcelExportDialog: React.FC<OrderExcelExportDialogProps> = ({
  open,
  onClose,
  onExport,
  loading
}) => {
  const [status, setStatus] = useState<OrderStatus | null>(null);
  const [orderType, setOrderType] = useState<OrderType | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [dateError, setDateError] = useState<string>('');

  const handleStatusChange = (event: SelectChangeEvent<string>) => {
    setStatus(event.target.value as OrderStatus || null);
  };

  const handleOrderTypeChange = (event: SelectChangeEvent<string>) => {
    setOrderType(event.target.value as OrderType || null);
  };

  const handleStartDateChange = (date: Date | null) => {
    setStartDate(date);
    validateDates(date, endDate);
  };

  const handleEndDateChange = (date: Date | null) => {
    setEndDate(date);
    validateDates(startDate, date);
  };

  const validateDates = (start: Date | null, end: Date | null) => {
    if (start && end && start > end) {
      setDateError('Start date must be before end date');
    } else {
      setDateError('');
    }
  };

  const handleExport = () => {
    if (dateError) return;
    onExport(status, orderType, startDate, endDate);
  };

  const handleClose = () => {
    setStatus(null);
    setOrderType(null);
    setStartDate(null);
    setEndDate(null);
    setDateError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Export Orders to Excel</DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Select filters to apply to the exported orders. Leave fields empty to include all orders.
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="status-select-label">Status</InputLabel>
              <Select
                labelId="status-select-label"
                id="status-select"
                value={status || ''}
                label="Status"
                onChange={handleStatusChange}
              >
                <MenuItem value="">
                  <em>All Statuses</em>
                </MenuItem>
                {STATUS_OPTIONS.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="order-type-select-label">Order Type</InputLabel>
              <Select
                labelId="order-type-select-label"
                id="order-type-select"
                value={orderType || ''}
                label="Order Type"
                onChange={handleOrderTypeChange}
              >
                <MenuItem value="">
                  <em>All Order Types</em>
                </MenuItem>
                <MenuItem value={OrderType.MARKETPLACE}>Marketplace</MenuItem>
                <MenuItem value={OrderType.MERCHANT}>Merchant</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Date Range
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={handleStartDateChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!dateError
                  }
                }}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={handleEndDateChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!dateError
                  }
                }}
              />
            </LocalizationProvider>
            {dateError && (
              <FormHelperText error>{dateError}</FormHelperText>
            )}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button 
          onClick={handleExport} 
          color="primary" 
          variant="contained"
          disabled={!!dateError || loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Exporting...' : 'Export'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderExcelExportDialog;
