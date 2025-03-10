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
} from '@mui/material';
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';
import FabricList from '../components/fabrics/FabricList';
import FabricForm from '../components/fabrics/FabricForm';
import { getFabrics, createFabric, updateFabric, deleteFabric, getFabricById } from '../services/fabric.service';
import { Fabric, FabricFormData } from '../types/fabric';

const FabricsPage: React.FC = () => {
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(9);
  const [totalPages, setTotalPages] = useState(0);
  const [sortBy, setSortBy] = useState('id');
  const [sortDir, setSortDir] = useState('asc');
  
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedFabricId, setSelectedFabricId] = useState<number | null>(null);
  const [initialFormData, setInitialFormData] = useState<Partial<FabricFormData>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fabricToDelete, setFabricToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadFabrics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getFabrics(page, size, sortBy, sortDir);
      setFabrics(response.content);
      setTotalPages(response.totalPages);
      
      setLoading(false);
    } catch (err) {
      console.error('Error loading fabrics:', err);
      setError('Failed to load fabrics. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFabrics();
  }, [page, size, sortBy, sortDir]);

  const handleCreateClick = () => {
    setDialogMode('create');
    setSelectedFabricId(null);
    setInitialFormData({});
    setOpenDialog(true);
  };

  const handleEditClick = async (id: number) => {
    try {
      setLoading(true);
      const fabric = await getFabricById(id);
      
      setDialogMode('edit');
      setSelectedFabricId(id);
      setInitialFormData({
        name: fabric.name,
        imageId: fabric.imageId,
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

  const handleDeleteClick = (id: number) => {
    setFabricToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSubmitError(null);
  };

  const handleFormSubmit = async (data: FabricFormData) => {
    try {
      setSubmitting(true);
      setSubmitError(null);
      
      if (dialogMode === 'create') {
        await createFabric(data);
      } else {
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

  const handleConfirmDelete = async () => {
    if (!fabricToDelete) return;
    
    try {
      setDeleting(true);
      await deleteFabric(fabricToDelete);
      setDeleteDialogOpen(false);
      loadFabrics();
      setDeleting(false);
    } catch (err) {
      console.error('Error deleting fabric:', err);
      setError('Failed to delete fabric. Please try again.');
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

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Fabrics
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateClick}
        >
          Add Fabric
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
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
              <InputLabel>Items Per Page</InputLabel>
              <Select
                value={size}
                label="Items Per Page"
                onChange={handleSizeChange as any}
              >
                <MenuItem value={6}>6</MenuItem>
                <MenuItem value={9}>9</MenuItem>
                <MenuItem value={12}>12</MenuItem>
                <MenuItem value={24}>24</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      ) : fabrics.length === 0 ? (
        <Box sx={{ textAlign: 'center', my: 5 }}>
          <Typography variant="body1">No fabrics found.</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateClick}
            sx={{ mt: 2 }}
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
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
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
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this fabric? This action cannot be undone.
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

export default FabricsPage;
