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
  Paper,
  Tabs,
  Tab,
  useMediaQuery,
  Tooltip,
} from '@mui/material';
import { layoutUtils } from '../theme/styleUtils';
import { 
  Add as AddIcon, 
  Close as CloseIcon,
  Storefront as StorefrontIcon,
  FilterList as FilterListIcon,
  ViewModule as GridViewIcon,
  ViewList as ListViewIcon,
  Sort as SortIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
} from '@mui/icons-material';
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
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

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
  
  // View mode state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Tab state
  const [activeTab, setActiveTab] = useState<number>(0);

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

  // Load marketplaces when filter params change or tab changes
  useEffect(() => {
    loadMarketplaces();
  }, [filterParams, activeTab]);

  // Handle tab change
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    
    // Update active filter based on tab
    let activeFilter: boolean | undefined = undefined;
    if (newValue === 1) activeFilter = true;
    if (newValue === 2) activeFilter = false;
    
    // Apply the filter
    handleFilterApply({ ...filterParams, active: activeFilter });
  };
  
  // Toggle view mode
  const toggleViewMode = () => {
    setViewMode(viewMode === 'grid' ? 'list' : 'grid');
  };

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
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <StorefrontIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography 
              variant="h5" 
              component="h1"
              sx={{ fontWeight: 500 }}
            >
              Marketplaces
            </Typography>
          </Box>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ ml: { sm: 4 } }}
          >
            Manage your marketplace connections and settings
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

        {/* Stats Summary */}
        <Box 
          sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 2, 
            mb: theme.customSpacing.section,
            '& > *': {
              flex: { xs: '1 1 100%', sm: '1 1 calc(33% - 16px)' }
            }
          }}
        >
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              borderRadius: 2, 
              border: '1px solid',
              borderColor: 'divider',
              background: 'linear-gradient(to right, rgba(0,0,0,0.01), rgba(0,0,0,0.03))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box>
              <Typography variant="body2" color="text.secondary">Total Marketplaces</Typography>
              <Typography variant="h4" sx={{ fontWeight: 500, mt: 0.5 }}>{totalElements}</Typography>
            </Box>
            <StorefrontIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.8 }} />
          </Paper>
          
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              borderRadius: 2, 
              border: '1px solid',
              borderColor: 'divider',
              background: 'linear-gradient(to right, rgba(46,125,50,0.01), rgba(46,125,50,0.05))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box>
              <Typography variant="body2" color="text.secondary">Active Marketplaces</Typography>
              <Typography variant="h4" sx={{ fontWeight: 500, mt: 0.5, color: 'success.main' }}>
                {marketplaces.filter(m => m.active).length}
              </Typography>
            </Box>
            <ActiveIcon sx={{ fontSize: 40, color: 'success.main', opacity: 0.8 }} />
          </Paper>
          
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              borderRadius: 2, 
              border: '1px solid',
              borderColor: 'divider',
              background: 'linear-gradient(to right, rgba(211,47,47,0.01), rgba(211,47,47,0.05))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box>
              <Typography variant="body2" color="text.secondary">Inactive Marketplaces</Typography>
              <Typography variant="h4" sx={{ fontWeight: 500, mt: 0.5, color: 'error.main' }}>
                {marketplaces.filter(m => !m.active).length}
              </Typography>
            </Box>
            <InactiveIcon sx={{ fontSize: 40, color: 'error.main', opacity: 0.8 }} />
          </Paper>
        </Box>
        
        {/* Action Bar with Tabs and Buttons */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          mb: theme.customSpacing.section,
          gap: 2
        }}>
          {/* Left side - Tabs */}
          <Paper 
            elevation={0} 
            sx={{ 
              borderRadius: 2, 
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'divider',
              flex: { sm: '1 1 auto' },
              maxWidth: { sm: '60%' }
            }}
          >
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              variant={isSmallScreen ? "fullWidth" : "scrollable"}
              scrollButtons="auto"
              sx={{
                minHeight: 48,
                '& .MuiTab-root': {
                  minHeight: 48,
                  textTransform: 'none',
                  fontSize: '0.875rem'
                }
              }}
            >
              <Tab label="All Marketplaces" />
              <Tab label="Active" />
              <Tab label="Inactive" />
            </Tabs>
          </Paper>

          {/* Right side - Actions */}
          <Box sx={{ 
            display: 'flex', 
            gap: 1,
            justifyContent: { xs: 'flex-end', sm: 'flex-end' },
            flex: { sm: '0 0 auto' }
          }}>
            <IconButton 
              onClick={toggleViewMode}
              size="small"
              sx={{ 
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1
              }}
            >
              {viewMode === 'grid' ? <ListViewIcon /> : <GridViewIcon />}
            </IconButton>
            <IconButton 
              onClick={() => setFilterDialogOpen(true)}
              size="small"
              color={activeFilterCount > 0 ? "primary" : "default"}
              sx={{ 
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1
              }}
            >
              <FilterListIcon />
            </IconButton>
            <Tooltip title="Sort by name">
              <IconButton 
                size="small"
                onClick={() => {
                  const newSortDir = filterParams.sortDir === 'asc' ? 'desc' : 'asc';
                  handleFilterApply({ 
                    ...filterParams, 
                    sortBy: 'name', 
                    sortDir: newSortDir 
                  });
                }}
                sx={{ 
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  position: 'relative',
                  '&::after': filterParams.sortBy === 'name' ? {
                    content: '""',
                    position: 'absolute',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: 'primary.main',
                    top: '2px',
                    right: '2px'
                  } : {}
                }}
              >
                <SortIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleCreateClick}
              sx={{ 
                borderRadius: 1,
                boxShadow: 1,
                textTransform: 'none'
              }}
            >
              Add Marketplace
            </Button>
          </Box>
        </Box>

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

        {/* Marketplace List with Animation */}
        <Box sx={{ 
          position: 'relative',
          minHeight: '200px',
          animation: viewMode === 'grid' ? 'fadeIn 0.3s ease-in-out' : 'slideIn 0.3s ease-in-out',
          '@keyframes fadeIn': {
            '0%': { opacity: 0 },
            '100%': { opacity: 1 }
          },
          '@keyframes slideIn': {
            '0%': { opacity: 0, transform: 'translateX(-10px)' },
            '100%': { opacity: 1, transform: 'translateX(0)' }
          }
        }}>
          {loading ? (
            <Box sx={{ ...layoutUtils.centeredFlex, my: theme.customSpacing.section * 2 }}>
              <CircularProgress />
            </Box>
          ) : marketplaces.length === 0 ? (
            <Paper 
              elevation={0}
              sx={{ 
                textAlign: 'center', 
                my: theme.customSpacing.section * 2,
                py: 6,
                px: 3,
                borderRadius: 2,
                border: '1px dashed',
                borderColor: 'divider',
                backgroundColor: 'rgba(0,0,0,0.01)'
              }}
            >
              <StorefrontIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>No marketplaces found</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Get started by adding your first marketplace connection
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleCreateClick}
                sx={{ borderRadius: 1 }}
              >
                Add Your First Marketplace
              </Button>
            </Paper>
          ) : (
            <>
              <MarketplaceList
                marketplaces={marketplaces}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                onToggleActive={handleToggleActiveStatus}
                viewMode={viewMode}
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
                  variant="enhanced"
                  elevation={1}
                />
              </Box>
            </>
          )}
        </Box>

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
                `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.primary.light} 90%)`,
              color: 'white',
              borderRadius: '4px 4px 0 0',
              position: 'relative',
              padding: 2
            }}>
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
