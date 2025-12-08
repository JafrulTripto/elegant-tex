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
  CircularProgress,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  Grid,
  SelectChangeEvent
} from '@mui/material';
import { 
  Add as AddIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Style as StyleIcon
} from '@mui/icons-material';
import StyleCodeList from '../styleCodes/StyleCodeList';
import StyleCodeForm from '../styleCodes/StyleCodeForm';
import { StyleCode, StyleCodeFormData } from '../../types/styleCode';
import * as styleCodeService from '../../services/styleCode.service';

const StyleCodeManagement: React.FC = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [styleCodes, setStyleCodes] = useState<StyleCode[]>([]);
  const [selectedStyleCode, setSelectedStyleCode] = useState<StyleCode | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Load style codes
  const loadStyleCodes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await styleCodeService.getAllStyleCodes();      
      const filteredData = searchTerm 
        ? data.filter(sc => 
            sc.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (sc.name && sc.name.toLowerCase().includes(searchTerm.toLowerCase()))
          )
        : data;
        
      setStyleCodes(filteredData);
      setTotalCount(filteredData.length);
    } catch (err) {
      console.error('Error loading style codes:', err);
      setError('Failed to load style codes. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStyleCodes();
  }, []);

  // Handle form open for create
  const handleAddClick = () => {
    setSelectedStyleCode(null);
    setFormOpen(true);
  };

  // Handle form open for edit
  const handleEditClick = (id: number) => {
    const styleCode = styleCodes.find(sc => sc.id === id);
    if (styleCode) {
      setSelectedStyleCode(styleCode);
      setFormOpen(true);
    }
  };

  // Handle form close
  const handleFormClose = () => {
    setFormOpen(false);
    setSelectedStyleCode(null);
  };

  // Handle form submit
  const handleFormSubmit = async (values: StyleCodeFormData) => {
    try {
      if (selectedStyleCode) {
        // Update existing style code
        await styleCodeService.updateStyleCode(selectedStyleCode.id, values);
      } else {
        // Create new style code
        await styleCodeService.createStyleCode(values);
      }
      // Reload style codes
      await loadStyleCodes();
    } catch (err) {
      console.error('Error saving style code:', err);
      setError('Failed to save style code. Please try again later.');
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
        await styleCodeService.deleteStyleCode(deleteId);
        await loadStyleCodes();
        handleDeleteDialogClose();
      } catch (err) {
        console.error('Error deleting style code:', err);
        setError('Failed to delete style code. Please try again later.');
        handleDeleteDialogClose();
      }
    }
  };

  // Handle toggle active
  const handleToggleActive = async (id: number) => {
    try {
      await styleCodeService.toggleStyleCodeActive(id);
      await loadStyleCodes();
    } catch (err) {
      console.error('Error toggling style code active status:', err);
      setError('Failed to update style code status. Please try again later.');
    }
  };

  // Handle page change
  const handlePageChange = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (event: SelectChangeEvent<number>) => {
    setRowsPerPage(Number(event.target.value));
    setPage(0);
  };
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  // Handle search form submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadStyleCodes();
  };

  // Get paginated style codes
  const getPaginatedStyleCodes = () => {
    return styleCodes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  };

  return (
    <Box>
      {/* Header and Action Buttons */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', mb: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 0.5 
          }}>
            <Typography variant="h5" sx={{ fontWeight: 500 }}>Style Codes</Typography>
            <Button
              variant="contained"
              startIcon={!isSmallScreen && <AddIcon />}
              onClick={handleAddClick}
              size={isSmallScreen ? "small" : "medium"}
              sx={{ 
                height: isSmallScreen ? 36 : 40,
                px: isSmallScreen ? 1.5 : 2,
                boxShadow: 2
              }}
            >
              {isSmallScreen ? <AddIcon fontSize="small" /> : "Add Style Code"}
            </Button>
          </Box>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ mb: 2 }}
          >
            Manage style codes for product customization
          </Typography>
        </Box>
        
        {/* Search and filter UI */}
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={9}>
            <form onSubmit={handleSearchSubmit}>
              <TextField
                fullWidth
                placeholder="Search by style code or name"
                value={searchTerm}
                onChange={handleSearchChange}
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.1)'
                    },
                    '&.Mui-focused': {
                      boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)'
                    }
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button 
                        type="submit" 
                        variant="contained" 
                        size="small"
                        sx={{ 
                          height: 32,
                          minWidth: 'auto',
                          px: 1.5,
                          boxShadow: 1
                        }}
                      >
                        Search
                      </Button>
                    </InputAdornment>
                  )
                }}
              />
            </form>
          </Grid>
          <Grid item xs={12} md={3} sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
            <Tooltip title="Refresh style codes">
              <IconButton 
                color="primary" 
                onClick={loadStyleCodes}
                size={isSmallScreen ? "small" : "medium"}
                sx={{ border: '1px solid', borderColor: 'divider' }}
              >
                <RefreshIcon fontSize={isSmallScreen ? "small" : "medium"} />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            borderRadius: 2
          }}
        >
          {error}
        </Alert>
      )}

      <StyleCodeList
        styleCodes={getPaginatedStyleCodes()}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        onToggleActive={handleToggleActive}
        page={page}
        totalCount={totalCount}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        loading={loading}
      />

      {/* Style Code Form Dialog */}
      <StyleCodeForm
        open={formOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        initialValues={selectedStyleCode || undefined}
        title={selectedStyleCode ? 'Edit Style Code' : 'Add Style Code'}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: 24
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <StyleIcon color="error" />
            <Typography variant="h6">
              Confirm Delete
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <DialogContentText>
            Are you sure you want to delete this style code? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={handleDeleteDialogClose} 
            color="inherit"
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StyleCodeManagement;
