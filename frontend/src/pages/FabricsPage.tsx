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
  useTheme,
  Container,
  alpha
} from '@mui/material';
import { layoutUtils } from '../theme/styleUtils';
import { 
  Add as AddIcon, 
  Close as CloseIcon, 
  Delete as DeleteIcon,
  Layers as FabricIcon
} from '@mui/icons-material';
import FabricList from '../components/fabrics/FabricList';
import FabricForm from '../components/fabrics/FabricForm';
import FabricFilterDialog from '../components/fabrics/FabricFilterDialog';
import { getFabrics, createFabric, updateFabric, deleteFabric, getFabricById, uploadFabricImage, toggleFabricActive } from '../services/fabric.service';
import { Fabric, FabricFormData } from '../types/fabric';
import { SearchBar, FilterChips, Pagination, ConfirmationDialog } from '../components/common';
import { useFabricFilters, FabricFilterParams } from '../hooks/useFabricFilters';

const FabricsPage: React.FC = () => {
  const theme = useTheme();
  
  // State for fabrics data
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // State for fabric form dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedFabricId, setSelectedFabricId] = useState<number | null>(null);
  const [initialFormData, setInitialFormData] = useState<Partial<FabricFormData>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // State for delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fabricToDelete, setFabricToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  // State for filter dialog
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [tags, setTags] = useState<{id: number, name: string}[]>([]);

  // Use the fabric filters hook
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
  } = useFabricFilters({
    page: 0,
    size: 8,
    sortBy: 'id',
    sortDir: 'asc'
  });

  // Load fabrics when filter params change
  useEffect(() => {
    loadFabrics();
  }, [filterParams]);

  // Load fabrics from API
  const loadFabrics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getFabrics(
        filterParams.page || 0, 
        filterParams.size || 8, 
        filterParams.sortBy || 'id', 
        filterParams.sortDir || 'asc', 
        filterParams.search, 
        filterParams.activeOnly
      );
      
      setFabrics(response.content);
      setTotalElements(response.totalElements || 0);
      setTotalPages(response.totalPages);
      
      // Extract unique tags from fabrics for filter dialog
      const allTags = response.content.flatMap((fabric: Fabric) => fabric.tags);
      const uniqueTags = Array.from(
        new Map(allTags.map((tag: {id: number, name: string}) => [tag.id, tag])).values()
      ) as {id: number, name: string}[];
      setTags(uniqueTags);
      
      setLoading(false);
    } catch (err) {
      console.error('Error loading fabrics:', err);
      setError('Failed to load fabrics. Please try again.');
      setLoading(false);
    }
  };

  // Create new fabric
  const handleCreateClick = () => {
    setDialogMode('create');
    setSelectedFabricId(null);
    setInitialFormData({});
    setOpenDialog(true);
  };

  // Edit existing fabric
  const handleEditClick = async (id: number) => {
    try {
      setLoading(true);
      const fabric = await getFabricById(id);
      
      setDialogMode('edit');
      setSelectedFabricId(id);
      setInitialFormData({
        name: fabric.name,
        fabricCode: fabric.fabricCode,
        imageId: fabric.imageId,
        active: fabric.active,
        tagNames: fabric.tags.map(tag => tag.name),
      });
      setOpenDialog(true);
      setLoading(false);
    } catch (err) {
      console.error('Error loading fabric details:', err);
      setError('Failed to load fabric details. Please try again.');
      setLoading(false);
    }
  };

  // Delete fabric
  const handleDeleteClick = (id: number) => {
    setFabricToDelete(id);
    setDeleteDialogOpen(true);
  };

  // Close fabric form dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSubmitError(null);
  };

  // Submit fabric form
  const handleFormSubmit = async (data: FabricFormData, tempImageFile?: File) => {
    try {
      setSubmitting(true);
      setSubmitError(null);
      
      if (dialogMode === 'create') {
        // Create the fabric first
        const response = await createFabric(data);
        const newFabricId = response.id;
        
        // If there's a temporary image file, upload it now
        if (tempImageFile && newFabricId) {
          try {
            await uploadFabricImage(newFabricId, tempImageFile);
          } catch (imageError) {
            console.error('Error uploading image after fabric creation:', imageError);
            // Show a warning but don't block the flow since fabric was created successfully
            setError('Fabric created successfully, but image upload failed. You can try uploading the image again by editing the fabric.');
          }
        }
      } else {
        // For edits, the image handling is already taken care of by the FabricForm component
        await updateFabric(selectedFabricId!, data);
      }
      
      setOpenDialog(false);
      loadFabrics();
      setSubmitting(false);
    } catch (err) {
      console.error('Error saving fabric:', err);
      setSubmitError('Failed to save fabric. Please try again.');
      setSubmitting(false);
    }
  };

  // Confirm delete fabric
  const handleConfirmDelete = async () => {
    if (!fabricToDelete) return;
    
    try {
      setDeleting(true);
      await deleteFabric(fabricToDelete);
      setDeleteDialogOpen(false);
      loadFabrics();
      setDeleting(false);
    } catch (err: any) {
      console.error('Error deleting fabric:', err);
      
      // Check if this is the foreign key constraint error
      if (err.response?.data?.message?.includes('referenced by one or more orders')) {
        setError('This fabric cannot be deleted because it is being used in one or more orders. Please remove the fabric from all orders before deleting.');
      } else {
        setError('Failed to delete fabric. Please try again.');
      }
      
      setDeleteDialogOpen(false);
      setDeleting(false);
    }
  };

  // Toggle fabric active status
  const handleToggleActive = async (fabric: Fabric) => {
    try {
      await toggleFabricActive(fabric.id);
      // Refresh the list
      loadFabrics();
    } catch (err) {
      console.error('Error toggling fabric status:', err);
      setError('Failed to update fabric status. Please try again.');
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
              <FabricIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography 
                variant="h5" 
                component="h1"
                sx={{ fontWeight: 500 }}
              >
                Fabrics
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleCreateClick}
              sx={{ 
                height: { xs: 36, sm: 40 },
                px: { xs: 1.5, sm: 2 }
              }}
            >
              Add Fabric
            </Button>
          </Box>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ ml: { sm: 4 } }}
          >
            Manage your fabric inventory and materials
          </Typography>
        </Box>
        
        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: theme.customSpacing.section }}>
            {error}
          </Alert>
        )}
        
        {/* Search and Filter */}
        <Box sx={{ mb: theme.customSpacing.section }}>
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={(e) => setSearchTerm(e.target.value)}
            onSearchSubmit={handleSearchSubmit}
            placeholder="Search fabrics by name or tag"
            onFilterClick={() => setFilterDialogOpen(true)}
            activeFilterCount={activeFilterCount}
            showFilterButton={true}
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
        
        {/* Fabric List */}
        {loading && fabrics.length === 0 ? (
          <Box sx={{ ...layoutUtils.centeredFlex, my: theme.customSpacing.section * 2 }}>
            <CircularProgress />
          </Box>
        ) : fabrics.length === 0 ? (
          <Box sx={{ textAlign: 'center', my: theme.customSpacing.section * 2 }}>
            <Typography variant="body1">No fabrics found.</Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleCreateClick}
              sx={{ 
                mt: theme.customSpacing.element, 
                borderRadius: 1.25,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                '&:hover': {
                  background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                  boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.25)}`
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              Add Your First Fabric
            </Button>
          </Box>
        ) : (
          <>
            <FabricList
              fabrics={fabrics}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              onToggleActive={handleToggleActive}
              sortBy={filterParams.sortBy || 'id'}
              sortDir={filterParams.sortDir || 'asc'}
              onSort={handleSortChange}
            />
            
            {/* Pagination */}
            <Box sx={{ mt: theme.customSpacing.section * 1.5 }}>
              <Pagination
                page={filterParams.page || 0}
                size={filterParams.size || 8}
                totalPages={totalPages}
                totalElements={totalElements}
                itemsCount={fabrics.length}
                loading={loading}
                onPageChange={handlePageChange}
                onPageSizeChange={(e) => handlePageSizeChange(e as any)}
                pageSizeOptions={[4, 8, 12, 20]}
                variant="enhanced"
                elevation={1}
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
        >
          <DialogTitle
          sx={{
            background: (theme) => 
              `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.primary.main} 90%)`,
            color: 'white',
            borderRadius: '4px 4px 0 0',
            position: 'relative',
            padding: 2
          }}
          >
            {dialogMode === 'create' ? 'Create Fabric' : 'Edit Fabric'}
            <IconButton
              aria-label="close"
              onClick={handleCloseDialog}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <FabricForm
              initialData={initialFormData}
              fabricId={selectedFabricId || undefined}
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
          message="Are you sure you want to delete this fabric? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          confirmColor="error"
          loading={deleting}
          icon={<DeleteIcon />}
        />
        
        {/* Filter Dialog */}
        <FabricFilterDialog
          open={filterDialogOpen}
          onClose={() => setFilterDialogOpen(false)}
          onApplyFilter={handleFilterApply}
          currentFilters={filterParams as FabricFilterParams}
          tags={tags}
          loading={loading}
        />
      </Box>
    </Container>
  );
};

export default FabricsPage;
