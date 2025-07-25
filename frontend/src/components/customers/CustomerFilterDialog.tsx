import React, { useState, useEffect } from 'react';
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
  Box,
  Typography,
  Divider
} from '@mui/material';
import { CustomerType } from '../../types/customer';
import { CustomerFilterParams } from '../../hooks/useCustomerFilters';

interface CustomerFilterDialogProps {
  open: boolean;
  onClose: () => void;
  onApply: (filters: Partial<CustomerFilterParams>) => void;
  currentFilters: CustomerFilterParams;
}

const CustomerFilterDialog: React.FC<CustomerFilterDialogProps> = ({
  open,
  onClose,
  onApply,
  currentFilters
}) => {
  const [filters, setFilters] = useState<Partial<CustomerFilterParams>>({
    customerType: currentFilters.customerType
  });

  useEffect(() => {
    if (open) {
      setFilters({
        customerType: currentFilters.customerType
      });
    }
  }, [open, currentFilters]);

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      customerType: undefined
    });
  };

  const hasActiveFilters = filters.customerType !== undefined;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" component="div">
          Filter Customers
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Customer Type
          </Typography>
          
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="customer-type-filter-label">Customer Type</InputLabel>
            <Select
              labelId="customer-type-filter-label"
              value={filters.customerType || ''}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                customerType: e.target.value as CustomerType || undefined
              }))}
              label="Customer Type"
            >
              <MenuItem value="">
                <em>All Types</em>
              </MenuItem>
              <MenuItem value={CustomerType.MARKETPLACE}>Marketplace</MenuItem>
              <MenuItem value={CustomerType.MERCHANT}>Merchant</MenuItem>
            </Select>
          </FormControl>

          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {hasActiveFilters ? 'Filters applied' : 'No filters applied'}
            </Typography>
            
            {hasActiveFilters && (
              <Button
                size="small"
                onClick={handleReset}
                color="secondary"
              >
                Reset All
              </Button>
            )}
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleApply} variant="contained" color="primary">
          Apply Filters
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomerFilterDialog;
