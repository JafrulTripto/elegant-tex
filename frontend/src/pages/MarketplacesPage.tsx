import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  IconButton,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  TextField,
  InputAdornment,
  useTheme,
} from '@mui/material';
import { spacing, layoutUtils } from '../theme/styleUtils';
import { Add as AddIcon, Close as CloseIcon, Search as SearchIcon } from '@mui/icons-material';
import MarketplaceList from '../components/marketplaces/MarketplaceList';
import MarketplaceForm from '../components/marketplaces/MarketplaceForm';
import { getMarketplaces, createMarketplace, updateMarketplace, deleteMarketplace, getMarketplaceById, uploadMarketplaceImage, toggleMarketplaceActive } from '../services/marketplace.service';
import { Marketplace, MarketplaceFormData } from '../types/marketplace';

const MarketplacesPage: React.FC = () => {
  const [marketplaces, setMarketplaces] = useState<Marketplace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(8);
  const [totalPages, setTotalPages] = useState(0);
  const [sortBy, setSortBy] = useState('id');
  const [sortDir, setSortDir] = useState('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [activeOnly, setActiveOnly] = useState(false);
  
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedMarketplaceId, setSelectedMarketplaceId] = useState<number | null>(null);
  const [initialFormData, setInitialFormData] = useState<Partial<MarketplaceFormData>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [marketplaceToDelete, setMarketplaceToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadMarketplaces = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getMarketplaces(page, size, sortBy, sortDir, debouncedSearchQuery, activeOnly);
      setMarketplaces(response.content);
      setTotalPages(response.totalPages);
      
      setLoading(false);
    } catch (err) {
      console.error('Error loading marketplaces:', err);
      setError('Failed to load marketplaces. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMarketplaces();
  }, [page, size, sortBy, sortDir, debouncedSearchQuery, activeOnly]);
  
  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPage(0); // Reset to first page when search changes
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleCreateClick = () => {
    setDialogMode('create');
    setSelectedMarketplaceId(null);
    setInitialFormData({});
    setOpenDialog(true);
  };

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

  const handleDeleteClick = (id: number) => {
    setMarketplaceToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSubmitError(null);
  };

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

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value - 1);
  };

  const handleSizeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSize(event.target.value as number);
    setPage(0);
  };

  const handleSortByChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSortBy(event.target.value as string);
  };

  const handleSortDirChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSortDir(event.target.value as string);
  };

  const theme = useTheme();

  return (
    <Box sx={{ ...spacing.container(theme) }}>
      <Box sx={{ ...layoutUtils.spaceBetweenFlex, mb: theme.customSpacing.section }}>
        <Typography variant="h4" component="h1">
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
      
      {error && (
        <Alert severity="error" sx={{ mb: theme.customSpacing.section }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ mb: theme.customSpacing.section }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              placeholder="Search marketplaces by name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setSearchQuery('')}
                      edge="end"
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={8}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={sortBy}
                    label="Sort By"
                    onChange={handleSortByChange as any}
                  >
                    <MenuItem value="id">ID</MenuItem>
                    <MenuItem value="name">Name</MenuItem>
                    <MenuItem value="createdAt">Created Date</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Direction</InputLabel>
                  <Select
                    value={sortDir}
                    label="Direction"
                    onChange={handleSortDirChange as any}
                  >
                    <MenuItem value="asc">Ascending</MenuItem>
                    <MenuItem value="desc">Descending</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={activeOnly ? "active" : "all"}
                    label="Status"
                    onChange={(e) => setActiveOnly(e.target.value === "active")}
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="active">Active Only</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Items Per Page</InputLabel>
                  <Select
                    value={size}
                    label="Items Per Page"
                    onChange={handleSizeChange as any}
                  >
                    <MenuItem value={4}>4</MenuItem>
                    <MenuItem value={8}>8</MenuItem>
                    <MenuItem value={12}>12</MenuItem>
                    <MenuItem value={20}>20</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
      
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
            onToggleActive={async (marketplace) => {
              try {
                await toggleMarketplaceActive(marketplace.id);
                // Refresh the list
                loadMarketplaces();
              } catch (err) {
                console.error('Error toggling marketplace status:', err);
                setError('Failed to update marketplace status. Please try again.');
              }
            }}
          />
          
          <Box sx={{ ...layoutUtils.centeredFlex, mt: theme.customSpacing.section * 1.5 }}>
            <Pagination
              count={totalPages}
              page={page + 1}
              onChange={handlePageChange}
              color="primary"
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
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this marketplace? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleting}
          >
            {deleting ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MarketplacesPage;
