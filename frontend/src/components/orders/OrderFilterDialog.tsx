import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  Divider,
  Box,
  IconButton,
  SelectChangeEvent
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Close as CloseIcon, FilterList as FilterIcon } from '@mui/icons-material';
import { OrderFilterParams, STATUS_OPTIONS } from '../../types/order';
import { Marketplace } from '../../types/marketplace';
import { format, parse } from 'date-fns';

interface OrderFilterDialogProps {
  open: boolean;
  onClose: () => void;
  onApplyFilter: (filters: OrderFilterParams) => void;
  marketplaces: Marketplace[];
  currentFilters: OrderFilterParams;
  loading?: boolean;
}

const OrderFilterDialog: React.FC<OrderFilterDialogProps> = ({
  open,
  onClose,
  onApplyFilter,
  marketplaces,
  currentFilters,
  loading = false
}) => {
  const [filters, setFilters] = useState<OrderFilterParams>({
    status: '',
    startDate: '',
    endDate: '',
    marketplaceId: undefined,
    createdById: undefined
  });

  const [startDateValue, setStartDateValue] = useState<Date | null>(null);
  const [endDateValue, setEndDateValue] = useState<Date | null>(null);

  // Initialize filters from props
  useEffect(() => {
    setFilters(currentFilters);
    
    // Set date pickers
    if (currentFilters.startDate) {
      setStartDateValue(parse(currentFilters.startDate, 'yyyy-MM-dd', new Date()));
    }
    
    if (currentFilters.endDate) {
      setEndDateValue(parse(currentFilters.endDate, 'yyyy-MM-dd', new Date()));
    }
  }, [currentFilters, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string | number>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleStartDateChange = (date: Date | null) => {
    setStartDateValue(date);
    setFilters(prev => ({
      ...prev,
      startDate: date ? format(date, 'yyyy-MM-dd') : ''
    }));
  };

  const handleEndDateChange = (date: Date | null) => {
    setEndDateValue(date);
    setFilters(prev => ({
      ...prev,
      endDate: date ? format(date, 'yyyy-MM-dd') : ''
    }));
  };

  const handleApplyFilter = () => {
    onApplyFilter(filters);
    onClose();
  };

  const handleClearFilter = () => {
    const clearedFilters = {
      status: '',
      startDate: '',
      endDate: '',
      marketplaceId: undefined,
      createdById: undefined
    };
    setFilters(clearedFilters);
    setStartDateValue(null);
    setEndDateValue(null);
    onApplyFilter(clearedFilters);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <FilterIcon sx={{ mr: 1 }} />
            <Typography variant="h6">Filter Orders</Typography>
          </Box>
          <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <Divider />
      
      <DialogContent>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  id="status"
                  name="status"
                  value={filters.status || ''}
                  onChange={handleSelectChange}
                  label="Status"
                  disabled={loading}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  {STATUS_OPTIONS.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="marketplace-label">Marketplace</InputLabel>
                <Select
                  labelId="marketplace-label"
                  id="marketplaceId"
                  name="marketplaceId"
                  value={filters.marketplaceId || ''}
                  onChange={handleSelectChange}
                  label="Marketplace"
                  disabled={loading}
                >
                  <MenuItem value="">All Marketplaces</MenuItem>
                  {marketplaces.map((marketplace) => (
                    <MenuItem key={marketplace.id} value={marketplace.id}>
                      {marketplace.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Start Date"
                value={startDateValue}
                onChange={handleStartDateChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    margin: 'normal',
                    disabled: loading
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="End Date"
                value={endDateValue}
                onChange={handleEndDateChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    margin: 'normal',
                    disabled: loading
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                margin="normal"
                id="createdById"
                name="createdById"
                label="Created By (User ID)"
                type="number"
                value={filters.createdById || ''}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
          </Grid>
        </LocalizationProvider>
      </DialogContent>
      
      <Divider />
      
      <DialogActions>
        <Button onClick={handleClearFilter} color="inherit" disabled={loading}>
          Clear Filters
        </Button>
        <Button onClick={onClose} color="inherit" disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleApplyFilter} color="primary" variant="contained" disabled={loading}>
          Apply Filters
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderFilterDialog;
