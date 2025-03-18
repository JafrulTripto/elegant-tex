import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import ProductTypeList from '../productTypes/ProductTypeList';
import ProductTypeForm from '../productTypes/ProductTypeForm';
import { ProductType, ProductTypeFormData } from '../../types/productType';
import * as productTypeService from '../../services/productType.service';

const ProductTypeManagement: React.FC = () => {
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [selectedProductType, setSelectedProductType] = useState<ProductType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Load product types
  const loadProductTypes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productTypeService.getAllProductTypes();
      setProductTypes(data);
      setTotalCount(data.length);
    } catch (err) {
      console.error('Error loading product types:', err);
      setError('Failed to load product types. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProductTypes();
  }, []);

  // Handle form open for create
  const handleAddClick = () => {
    setSelectedProductType(null);
    setFormOpen(true);
  };

  // Handle form open for edit
  const handleEditClick = (id: number) => {
    const productType = productTypes.find(pt => pt.id === id);
    if (productType) {
      setSelectedProductType(productType);
      setFormOpen(true);
    }
  };

  // Handle form close
  const handleFormClose = () => {
    setFormOpen(false);
    setSelectedProductType(null);
  };

  // Handle form submit
  const handleFormSubmit = async (values: ProductTypeFormData) => {
    try {
      if (selectedProductType) {
        // Update existing product type
        await productTypeService.updateProductType(selectedProductType.id, values);
      } else {
        // Create new product type
        await productTypeService.createProductType(values);
      }
      // Reload product types
      await loadProductTypes();
    } catch (err) {
      console.error('Error saving product type:', err);
      setError('Failed to save product type. Please try again later.');
    }
  };

  // Handle delete dialog open
  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  // Handle delete dialog close
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setDeleteId(null);
  };

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    if (deleteId !== null) {
      try {
        await productTypeService.deleteProductType(deleteId);
        await loadProductTypes();
        handleDeleteDialogClose();
      } catch (err) {
        console.error('Error deleting product type:', err);
        setError('Failed to delete product type. Please try again later.');
        handleDeleteDialogClose();
      }
    }
  };

  // Handle toggle active
  const handleToggleActive = async (id: number) => {
    try {
      await productTypeService.toggleProductTypeActive(id);
      await loadProductTypes();
    } catch (err) {
      console.error('Error toggling product type active status:', err);
      setError('Failed to update product type status. Please try again later.');
    }
  };

  // Handle page change
  const handlePageChange = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Get paginated product types
  const getPaginatedProductTypes = () => {
    return productTypes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Product Types</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
        >
          Add Product Type
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <ProductTypeList
          productTypes={getPaginatedProductTypes()}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          onToggleActive={handleToggleActive}
          page={page}
          totalCount={totalCount}
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      )}

      {/* Product Type Form Dialog */}
      <ProductTypeForm
        open={formOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        initialValues={selectedProductType || undefined}
        title={selectedProductType ? 'Edit Product Type' : 'Add Product Type'}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this product type? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductTypeManagement;
