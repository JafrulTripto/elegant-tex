import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Alert,
  CircularProgress,
  SelectChangeEvent,
  useTheme,
  Container,
} from '@mui/material';
import { layoutUtils } from '../theme/styleUtils';
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';
import MarketplaceList from '../components/marketplaces/MarketplaceList';
import MarketplaceForm from '../components/marketplaces/MarketplaceForm';
import MarketplaceSearch from '../components/marketplaces/MarketplaceSearch';
import MarketplaceFilterDialog from '../components/marketplaces/MarketplaceFilterDialog';
import { getMarketplaces, createMarketplace, updateMarketplace, deleteMarketplace, getMarketplaceById, uploadMarketplaceImage, toggleMarketplaceActive } from '../services/marketplace.service';
import { Marketplace, MarketplaceFormData } from '../types/marketplace';
import { useMarketplaceFilters } from '../hooks/useMarketplaceFilters';
import { FilterChips, ConfirmationDialog, Pagination } from '../components/common';

const MarketplacesPage: React.FC = () => {
  const theme = useTheme();
  
  // State
  const [marketplaces, setMarketplaces] = useState<Marketplace[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);
  
  // Dialog state
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedMarketplaceId, setSelectedMarketplaceId] = useState<number | null>(null);
  const [initialFormData, setInitialFormData] = useState<Partial<MarketplaceFormData>>({});
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [marketplaceToDelete, setMarketplaceToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  // Filter dialog state
  const [filterDialogOpen, setFilterDialogOpen] = useState<boolean>(false);

  // Use the marketplace filters hook
  const {
    filterParams,
    searchTerm,
    setSearchTerm,
    handleSearchSubmit,
    handlePageChange,
    handlePageSizeChange,
    handleFilterApply,
    handleRemoveFilter,
    handleClearAllFilters,
    activeFilterChips,
    activeFilterCount
  } = useMarketplaceFilters({
    page: 0,
    size: 8,
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

  // Load marketplaces when filter params change
  useEffect(() => {
    loadMarketplaces();
  }, [filterParams]);

  // Load marketplaces
  const loadMarketplaces = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getMarketplaces(
        filterParams.page || 0,
        filterParams.size || 8,
        filterParams.sortBy || 'id',
        filterParams.sortDir || 'asc',
        filterParams.search,
        filterParams.active
      );
      
      setMarketplaces(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements || 0);
      
      setLoading(false);
    } catch (err) {
      console.error('Error loading marketplaces:', err);
      setError('Failed to load marketplaces. Please try again.');
      setLoading(false);
    }
  };

  // Open dialog for creating a new marketplace
  const handleCreateClick = () => {
    setDialogMode('create');
    setSelectedMarketplaceId(null);
    setInitialFormData({});
    setOpenDialog(true);
  };

  // Open dialog for editing a marketplace
  const handleEditClick = async (id: number) => {
    try {
      setLoading(true);
      const marketplace = await getMarketplaceById(id);
      
      setDialogMode('edit');
      setSelectedMarketplaceId(id);
      setInitialFormData({
        name: marketplace.name,
        pageUrl: marketplace.pageUrl,
        imageId: marketplace.imageId,
        active: marketplace.active,
        memberIds: marketplace.members.map(member => member.id),
      });
      setOpenDialog(true);
      setLoading(false);
    } catch (err) {
      console.error('Error loading marketplace details:', err);
      setError('Failed to load marketplace details. Please try again.');
      setLoading(false);
    }
  };

  // Open delete confirmation dialog
  const handleDeleteClick = (id: number) => {
    setMarketplaceToDelete(id);
    setDeleteDialogOpen(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSubmitError(null);
  };

  // Handle form submission
  const handleFormSubmit = async (data: MarketplaceFormData, tempImageFile?: File) => {
    try {
      setSubmitting(true);
      setSubmitError(null);
      
      if (dialogMode === 'create') {
        // Create the marketplace first
        const response = await createMarketplace(data);
        const newMarketplaceId = response.id;
        
        // If there's a temporary image file, upload it now
        if (tempImageFile && newMarketplaceId) {
          try {
            await uploadMarketplaceImage(newMarketplaceId, tempImageFile);
          } catch (imageError) {
            console.error('Error uploading image after marketplace creation:', imageError);
            // Show a warning but don't block the flow since marketplace was created successfully
            setError('Marketplace created successfully, but image upload failed. You can try uploading the image again by editing the marketplace.');
          }
        }
      } else {
        // For edits, the image handling is already taken care of by the MarketplaceForm component
        await updateMarketplace(selectedMarketplaceId!, data);
      }
      
      setOpenDialog(false);
      loadMarketplaces();
      setSubmitting(false);
    } catch (err) {
      console.error('Error saving marketplace:', err);
      setSubmitError('Failed to save marketplace. Please try again.');
      setSubmitting(false);
    }
  };

  // Handle delete confirmation
  const handleConfirmDelete = async () => {
    if (!marketplaceToDelete) return;
    
    try {
      setDeleting(true);
      await deleteMarketplace(marketplaceToDelete);
      setDeleteDialogOpen(false);
      loadMarketplaces();
      setDeleting(false);
    } catch (err: any) {
      console.error('Error deleting marketplace:', err);
      
      // Check if this is the foreign key constraint error
      if (err.response?.data?.message?.includes('referenced by one or more orders')) {
        setError('This marketplace cannot be deleted because it is being used in one or more orders. Please remove the marketplace from all orders before deleting.');
      } else {
        setError('Failed to delete marketplace. Please try again.');
      }
      
      setDeleteDialogOpen(false);
      setDeleting(false);
    }
  };

  // Handle toggle active status
  const handleToggleActiveStatus = async (marketplace: Marketplace) => {
    try {
      await toggleMarketplaceActive(marketplace.id);
      // Refresh the list
      loadMarketplaces();
    } catch (err) {
      console.error('Error toggling marketplace status:', err);
      setError('Failed to update marketplace status. Please try again.');
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
            Marketplaces
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateClick}
          >
            Add Marketplace
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
          <MarketplaceSearch
            searchTerm={searchTerm}
            onSearchChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
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
        
        {/* Marketplace List */}
        {loading ? (
          <Box sx={{ ...layoutUtils.centeredFlex, my: theme.customSpacing.section * 2 }}>
            <CircularProgress />
          </Box>
        ) : marketplaces.length === 0 ? (
          <Box sx={{ textAlign: 'center', my: theme.customSpacing.section * 2 }}>
            <Typography variant="body1">No marketplaces found.</Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleCreateClick}
              sx={{ mt: theme.customSpacing.element }}
            >
              Add Your First Marketplace
            </Button>
          </Box>
        ) : (
          <>
            <MarketplaceList
              marketplaces={marketplaces}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              onToggleActive={handleToggleActiveStatus}
            />
            
            {/* Pagination */}
            <Box sx={{ mt: theme.customSpacing.section }}>
              <Pagination
                page={filterParams.page || 0}
                size={filterParams.size || 8}
                totalPages={totalPages}
                totalElements={totalElements}
                itemsCount={marketplaces.length}
                loading={loading}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChangeAdapter}
                pageSizeOptions={[4, 8, 12, 20]}
              />
            </Box>
          </>
        )}
        
        {/* Create/Edit Dialog */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { borderRadius: theme.shape.borderRadius }
          }}
        >
          <DialogTitle>
            {dialogMode === 'create' ? 'Create Marketplace' : 'Edit Marketplace'}
            <IconButton
              aria-label="close"
              onClick={handleCloseDialog}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <MarketplaceForm
              initialData={initialFormData}
              marketplaceId={selectedMarketplaceId || undefined}
              onSubmit={handleFormSubmit}
              isSubmitting={submitting}
              submitError={submitError || undefined}
            />
          </DialogContent>
        </Dialog>
        
        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Confirm Delete"
          message="Are you sure you want to delete this marketplace? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          confirmColor="error"
          loading={deleting}
        />
        
        {/* Filter Dialog */}
        <MarketplaceFilterDialog
          open={filterDialogOpen}
          onClose={() => setFilterDialogOpen(false)}
          onApplyFilter={handleFilterApply}
          currentFilters={filterParams}
          loading={loading}
        />
      </Box>
    </Container>
  );
};

export default MarketplacesPage;
