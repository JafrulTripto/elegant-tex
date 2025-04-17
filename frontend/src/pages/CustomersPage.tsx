import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Alert,
  CircularProgress,
  SelectChangeEvent,
  useTheme,
  alpha
} from '@mui/material';
import { layoutUtils } from '../theme/styleUtils';
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';
import { Customer, CustomerRequest } from '../types/customer';
import * as customerService from '../services/customer.service';
import { useCustomerFilters } from '../hooks/useCustomerFilters';
import { FilterChips, ConfirmationDialog, Pagination } from '../components/common';
import CustomerSearch from '../components/customers/CustomerSearch';
import CustomerTable from '../components/customers/CustomerTable';
import CustomerForm from '../components/customers/CustomerForm';

const CustomersPage: React.FC = () => {
  const theme = useTheme();
  
  // State
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);
  
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<CustomerRequest>({
    name: '',
    phone: '',
    address: '',
    alternativePhone: '',
    facebookId: ''
  });
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  // Use the customer filters hook
  const {
    filterParams,
    searchTerm,
    setSearchTerm,
    handleSearchSubmit,
    handlePageChange,
    handlePageSizeChange,
    handleSortChange,
    handleRemoveFilter,
    handleClearAllFilters,
    activeFilterChips,
    activeFilterCount
  } = useCustomerFilters({
    page: 0,
    size: 10,
    sortBy: 'id',
    sortDir: 'asc'
  });

  // Adapter for page size change
  const handlePageSizeChangeAdapter = (event: SelectChangeEvent) => {
    // Convert SelectChangeEvent to the format expected by handlePageSizeChange
    const adaptedEvent = {
      target: { value: parseInt(event.target.value, 10) }
    } as React.ChangeEvent<{ value: unknown }>;
    
    handlePageSizeChange(adaptedEvent);
  };

  // Load customers when filter params change
  useEffect(() => {
    loadCustomers();
  }, [filterParams]);

  // Load customers
  const loadCustomers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let result;
      if (filterParams.search) {
        result = await customerService.searchCustomers(
          filterParams.search,
          filterParams.page || 0,
          filterParams.size || 10
        );
      } else {
        result = await customerService.getCustomers(
          filterParams.page || 0,
          filterParams.size || 10
        );
      }
      
      setCustomers(result.content);
      // Calculate total pages based on total elements and page size
      const calculatedTotalPages = Math.ceil(result.totalElements / (filterParams.size || 10));
      setTotalPages(calculatedTotalPages);
      setTotalElements(result.totalElements);
    } catch (err) {
      console.error('Error loading customers:', err);
      setError('Failed to load customers. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Open create dialog
  const handleOpenCreateDialog = () => {
    setSelectedCustomer(null);
    setFormData({
      name: '',
      phone: '',
      address: '',
      alternativePhone: '',
      facebookId: ''
    });
    setFormError(null);
    setDialogOpen(true);
  };

  // Open edit dialog
  const handleOpenEditDialog = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
      alternativePhone: customer.alternativePhone || '',
      facebookId: customer.facebookId || ''
    });
    setFormError(null);
    setDialogOpen(true);
  };

  // Open delete dialog
  const handleOpenDeleteDialog = (customerId: number) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setCustomerToDelete(customer);
      setDeleteDialogOpen(true);
    }
  };

  // Handle form data change
  const handleFormDataChange = (data: CustomerRequest) => {
    setFormData(data);
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validate form
    if (!formData.name || !formData.phone || !formData.address) {
      setFormError('Please fill in all required fields');
      return;
    }
    
    setSubmitting(true);
    setFormError(null);
    
    try {
      if (selectedCustomer) {
        // Update existing customer
        await customerService.updateCustomer(selectedCustomer.id, formData);
      } else {
        // Create new customer
        await customerService.createCustomer(formData);
      }
      
      // Close dialog and reload customers
      setDialogOpen(false);
      loadCustomers();
    } catch (err) {
      console.error('Error saving customer:', err);
      setFormError('Failed to save customer. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete confirmation
  const handleConfirmDelete = async () => {
    if (!customerToDelete) return;
    
    setDeleting(true);
    
    try {
      await customerService.deleteCustomer(customerToDelete.id);
      setDeleteDialogOpen(false);
      loadCustomers();
    } catch (err) {
      console.error('Error deleting customer:', err);
      setError('Failed to delete customer. Please try again later.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ my: { xs: 2, sm: 3, md: 4 } }}>
        {/* Header */}
        <Box sx={{ 
          ...layoutUtils.spaceBetweenFlex, 
          mb: theme.customSpacing.section,
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: { xs: 1, sm: 0 }
        }}>
          <Typography 
            variant="h4" 
            component="h1"
            sx={{ 
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
              mb: { xs: 0.5, sm: 0 }
            }}
          >
            Customers
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
          >
            Add Customer
          </Button>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: theme.customSpacing.section }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {/* Search and Filter */}
        <Box sx={{ mb: theme.customSpacing.section }}>
          <CustomerSearch
            searchTerm={searchTerm}
            onSearchChange={(e) => setSearchTerm(e.target.value)}
            onSearchSubmit={handleSearchSubmit}
            activeFilterCount={activeFilterCount}
          />
          
          {/* Active Filter Chips */}
          {activeFilterCount > 0 && (
            <FilterChips
              filters={activeFilterChips}
              onRemoveFilter={handleRemoveFilter}
              onClearAll={handleClearAllFilters}
            />
          )}
        </Box>

        {/* Customer Table */}
        <CustomerTable
          customers={customers}
          loading={loading}
          onEdit={handleOpenEditDialog}
          onDelete={handleOpenDeleteDialog}
          sortBy={filterParams.sortBy || 'id'}
          sortDir={(filterParams.sortDir as 'asc' | 'desc') || 'asc'}
          onSort={handleSortChange}
        />
        
        {/* Pagination */}
        <Box sx={{ mt: theme.customSpacing.section }}>
          <Pagination
            page={filterParams.page || 0}
            size={filterParams.size || 10}
            totalPages={totalPages}
            totalElements={totalElements}
            itemsCount={customers.length}
            loading={loading}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChangeAdapter}
            pageSizeOptions={[5, 10, 25, 50]}
          />
        </Box>

        {/* Customer Form Dialog */}
        <Dialog 
          open={dialogOpen} 
          onClose={() => setDialogOpen(false)} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: { borderRadius: theme.shape.borderRadius }
          }}
        >
          <DialogTitle>
            {selectedCustomer ? 'Edit Customer' : 'Add Customer'}
            <IconButton
              aria-label="close"
              onClick={() => setDialogOpen(false)}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <CustomerForm
              initialData={formData}
              onDataChange={handleFormDataChange}
              isSubmitting={submitting}
              submitError={formError || undefined}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button 
              onClick={() => setDialogOpen(false)} 
              color="inherit"
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              color="primary"
              variant="contained"
              disabled={submitting}
              sx={{ 
                borderRadius: 1.25,
                background: submitting ? undefined : `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                '&:hover': {
                  background: submitting ? undefined : `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                  boxShadow: submitting ? undefined : `0 2px 8px ${alpha(theme.palette.primary.main, 0.25)}`
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              {submitting ? <CircularProgress size={24} /> : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Confirm Delete"
          message={`Are you sure you want to delete the customer "${customerToDelete?.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          confirmColor="error"
          loading={deleting}
        />
      </Box>
    </Container>
  );
};

export default CustomersPage;
