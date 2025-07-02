import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Dialog,
  DialogContent,
  Snackbar,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import { spacing, layoutUtils } from '../theme/styleUtils';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import { Marketplace } from '../types/marketplace';
import { getMarketplaceById, updateMarketplace, deleteMarketplace, toggleMarketplaceActive } from '../services/marketplace.service';
import MarketplaceForm from '../components/marketplaces/MarketplaceForm';
import ImagePreview from '../components/common/ImagePreview';
import { getFileUrl } from '../services/fileStorage.service';

const MarketplaceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [marketplace, setMarketplace] = useState<Marketplace | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | undefined>();
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    const fetchMarketplace = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await getMarketplaceById(parseInt(id));
        setMarketplace(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching marketplace:', err);
        setError('Failed to load marketplace details');
        setLoading(false);
      }
    };

    fetchMarketplace();
  }, [id]);

  const handleEditClick = () => {
    setOpenEditDialog(true);
  };

  const handleDeleteClick = () => {
    setOpenDeleteDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSubmitError(undefined);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const handleUpdateSubmit = async (data: any) => {
    if (!id || !marketplace) return;
    
    try {
      setIsSubmitting(true);
      setSubmitError(undefined);
      
      // Update the marketplace
      const updatedMarketplace = await updateMarketplace(parseInt(id), data);
      
      // Update local state
      setMarketplace(updatedMarketplace);
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Marketplace updated successfully!',
        severity: 'success',
      });
      
      // Close the dialog
      setOpenEditDialog(false);
      
      setIsSubmitting(false);
    } catch (err) {
      console.error('Error updating marketplace:', err);
      setSubmitError('Failed to update marketplace. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!id) return;
    
    try {
      setIsSubmitting(true);
      
      // Delete the marketplace
      await deleteMarketplace(parseInt(id));
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Marketplace deleted successfully!',
        severity: 'success',
      });
      
      // Close the dialog
      setOpenDeleteDialog(false);
      
      // Navigate back to marketplaces list
      navigate('/marketplaces');
      
      setIsSubmitting(false);
    } catch (err) {
      console.error('Error deleting marketplace:', err);
      setSnackbar({
        open: true,
        message: 'Failed to delete marketplace. Please try again.',
        severity: 'error',
      });
      setIsSubmitting(false);
      setOpenDeleteDialog(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const theme = useTheme();

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ ...layoutUtils.centeredFlex, my: theme.customSpacing.section * 3 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !marketplace) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', my: theme.customSpacing.section * 3 }}>
          <Typography color="error" variant="h6">
            {error || 'Marketplace not found'}
          </Typography>
          <Button
            variant="outlined"
            onClick={() => navigate('/marketplaces')}
            sx={{ mt: theme.customSpacing.element }}
            startIcon={<ArrowBackIcon />}
          >
            Back to Marketplaces
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: theme.customSpacing.section * 1.5 }}>
        <Box sx={{ ...layoutUtils.spaceBetweenFlex, mb: theme.customSpacing.section }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/marketplaces')}
          >
            Back to Marketplaces
          </Button>
          
          <Box>
            <Tooltip title={marketplace.active ? "Set Inactive" : "Set Active"}>
              <IconButton 
                color={marketplace.active ? "success" : "default"} 
                onClick={async () => {
                  try {
                    const updatedMarketplace = await toggleMarketplaceActive(parseInt(id!));
                    setMarketplace(updatedMarketplace);
                    setSnackbar({
                      open: true,
                      message: `Marketplace is now ${updatedMarketplace.active ? 'active' : 'inactive'}`,
                      severity: 'success',
                    });
                  } catch (err) {
                    console.error('Error toggling marketplace status:', err);
                    setSnackbar({
                      open: true,
                      message: 'Failed to update marketplace status',
                      severity: 'error',
                    });
                  }
                }}
                sx={{ mr: 1 }}
              >
                {marketplace.active ? <ToggleOnIcon /> : <ToggleOffIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit Marketplace">
              <IconButton color="primary" onClick={handleEditClick} sx={{ mr: 1 }}>
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Marketplace">
              <IconButton color="error" onClick={handleDeleteClick}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Paper elevation={2} sx={{ ...spacing.container(theme), mb: theme.customSpacing.section * 1.5 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <ImagePreview
                imageId={marketplace.imageId}
                alt={marketplace.name}
                height={300}
                width="100%"
                borderRadius={2}
                fallbackImage="/vite.svg"
              />
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: theme.customSpacing.item }}>
                <Typography variant="h4" component="h1">
                  {marketplace.name}
                </Typography>
                <Chip 
                  label={marketplace.active ? "Active" : "Inactive"} 
                  color={marketplace.active ? "success" : "default"}
                  size="small"
                  sx={{ ml: 2 }}
                />
              </Box>
              
              <Box sx={{ mb: theme.customSpacing.section }}>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  Page URL
                </Typography>
                <Typography
                  component="a"
                  href={marketplace.pageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: 'primary.main', textDecoration: 'none' }}
                >
                  {marketplace.pageUrl}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  Created
                </Typography>
                <Typography>
                  {new Date(marketplace.createdAt).toLocaleDateString()} at{' '}
                  {new Date(marketplace.createdAt).toLocaleTimeString()}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  Last Updated
                </Typography>
                <Typography>
                  {new Date(marketplace.updatedAt).toLocaleDateString()} at{' '}
                  {new Date(marketplace.updatedAt).toLocaleTimeString()}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
        
        <Paper elevation={2} sx={{ ...spacing.container(theme) }}>
          <Typography variant="h6" gutterBottom>
            Members ({marketplace.members.length})
          </Typography>
          
          <Divider sx={{ mb: theme.customSpacing.element }} />
          
          {marketplace.members.length === 0 ? (
            <Typography color="text.secondary">No members yet</Typography>
          ) : (
            <List>
              {marketplace.members.map(member => (
                <ListItem key={member.id}>
                  <ListItemAvatar>
                    <Avatar src={member.profileImageId ? getFileUrl(member.profileImageId) || undefined : undefined}>
                      {member.firstName?.[0] || member.email[0].toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${member.firstName || ''} ${member.lastName || ''}`.trim() || member.email}
                    secondary={member.email}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      </Box>
      
      {/* Edit Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={handleCloseEditDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          <MarketplaceForm
            initialData={{
              name: marketplace.name,
              pageUrl: marketplace.pageUrl,
              imageId: marketplace.imageId,
              active: marketplace.active,
              memberIds: marketplace.members.map(member => member.id),
            }}
            marketplaceId={parseInt(id!)}
            onSubmit={handleUpdateSubmit}
            isSubmitting={isSubmitting}
            submitError={submitError}
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            Delete Marketplace
          </Typography>
          
          <Typography variant="body1" paragraph>
            Are you sure you want to delete the marketplace "{marketplace.name}"? This action cannot be undone.
          </Typography>
          
          <Box sx={{ ...layoutUtils.endFlex, mt: theme.customSpacing.section, gap: theme.customSpacing.element }}>
            <Button
              variant="outlined"
              onClick={handleCloseDeleteDialog}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDeleteConfirm}
              disabled={isSubmitting}
            >
              {isSubmitting ? <CircularProgress size={24} /> : 'Delete'}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default MarketplaceDetailPage;
