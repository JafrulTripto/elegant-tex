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
import { 
  Add as AddIcon, 
  Close as CloseIcon,
  People as PeopleIcon 
} from '@mui/icons-material';
import { Customer, CustomerRequest } from '../types/customer';
import * as customerService from '../services/customer.service';
import { useCustomerFilters, CustomerFilterParams } from '../hooks/useCustomerFilters';
import { FilterChips, ConfirmationDialog, Pagination } from '../components/common';
import CustomerSearch from '../components/customers/CustomerSearch';
import CustomerTable from '../components/customers/CustomerTable';
import CustomerForm from '../components/customers/CustomerForm';
import CustomerFilterDialog from '../components/customers/CustomerFilterDialog';

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
    divisionId: 0,
    districtId: 0,
    upazilaId: 0,
    addressLine: '',
    postalCode: '',
    alternativePhone: '',
    facebookId: ''
  });
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  // Filter dialog
  const [filterDialogOpen, setFilterDialogOpen] = useState<boolean>(false);

  // Use the customer filters hook
  const {
    filterParams,
    searchTerm,
    setSearchTerm,
    handleSearchSubmit,
    handlePageChange,
    handlePageSizeChange,
    handleSortChange,
    handleFilterApply,
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
          filterParams.size || 10,
          filterParams.customerType
        );
      } else {
        result = await customerService.getCustomers(
          filterParams.page || 0,
          filterParams.size || 10,
          filterParams.customerType
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

  // Handle filter apply
  const handleFilterApplyWrapper = (filters: Partial<CustomerFilterParams>) => {
    handleFilterApply(filters);
    setFilterDialogOpen(false);
  };

  // Open create dialog
  const handleOpenCreateDialog = () => {
    setSelectedCustomer(null);
    setFormData({
      name: '',
      phone: '',
      divisionId: 0,
      districtId: 0,
      upazilaId: 0,
      addressLine: '',
      postalCode: '',
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
      divisionId: customer.address?.divisionId || 0,
      districtId: customer.address?.districtId || 0,
      upazilaId: customer.address?.upazilaId || 0,
      addressLine: customer.address?.addressLine || '',
      postalCode: customer.address?.postalCode || '',
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
    if (!formData.name || !formData.phone || !formData.addressLine || !formData.divisionId || !formData.districtId || !formData.upazilaId) {
      setFormError('Please fill in all required fields');
      return;
    }
    
    setSubmitting(true);
    setFormError(null);
    
   try {
      const isUpdate = selectedCustomer?.id !== undefined;

      if (isUpdate) {
        await customerService.updateCustomer(selectedCustomer.id!, formData);
      } else {
        await customerService.createCustomer(formData);
      }

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
        {/* Header Section - Similar to Settings Page */}
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            mb: 2,
            pb: 1,
            borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <PeopleIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography 
                variant="h5" 
                component="h1"
                sx={{ fontWeight: 500 }}
              >
                Customers
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenCreateDialog}
              sx={{ 
                height: { xs: 36, sm: 40 },
                px: { xs: 1.5, sm: 2 }
              }}
            >
              Add Customer
            </Button>
          </Box>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ ml: { sm: 4 } }}
          >
            Manage your customer database and information
          </Typography>
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
            onFilterClick={() => setFilterDialogOpen(true)}
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
            variant="enhanced"
            elevation={1}
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
          <DialogTitle
            sx={{
              background: (theme) => `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.primary.main} 90%)`,
              color: 'white',
              borderRadius: '4px 4px 0 0',
              position: 'relative',
              padding: 2
            }}
          >
            {selectedCustomer ? 'Edit Customer' : 'Add Customer'}
            <IconButton
              aria-label="close"
              onClick={() => setDialogOpen(false)}
              sx={{ position: 'absolute', right: 8, top: 8, color: 'white' }}
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

        {/* Customer Filter Dialog */}
        <CustomerFilterDialog
          open={filterDialogOpen}
          onClose={() => setFilterDialogOpen(false)}
          onApply={handleFilterApplyWrapper}
          currentFilters={filterParams}
        />
      </Box>
    </Container>
  );
};

export default CustomersPage;
