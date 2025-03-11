import React, { useState } from 'react';
import { Container, Box, Typography, Button, Dialog, DialogContent, Snackbar, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MarketplaceList from '../components/marketplaces/MarketplaceList';
import MarketplaceForm from '../components/marketplaces/MarketplaceForm';
import { MarketplaceFormData } from '../types/marketplace';
import { createMarketplace, uploadMarketplaceImage } from '../services/marketplace.service';

const MarketplacesPage: React.FC = () => {
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | undefined>();
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleCreateClick = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSubmitError(undefined);
  };

  const handleSubmit = async (data: MarketplaceFormData, tempImageFile?: File) => {
    try {
      setIsSubmitting(true);
      setSubmitError(undefined);
      
      // Create the marketplace
      const createdMarketplace = await createMarketplace(data);
      
      // If there's a temporary image file, upload it now
      if (tempImageFile && createdMarketplace.id) {
        try {
          await uploadMarketplaceImage(createdMarketplace.id, tempImageFile);
        } catch (imageError) {
          console.error('Error uploading image after marketplace creation:', imageError);
          // Show a warning but don't block the flow since marketplace was created successfully
          setSnackbar({
            open: true,
            message: 'Marketplace created successfully, but image upload failed. You can try uploading the image again by editing the marketplace.',
            severity: 'warning'
          });
          
          // Close the dialog and navigate anyway
          setOpenDialog(false);
          navigate(`/marketplaces/${createdMarketplace.id}`);
          setIsSubmitting(false);
          return;
        }
      }
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Marketplace created successfully!',
        severity: 'success',
      });
      
      // Close the dialog
      setOpenDialog(false);
      
      // Navigate to the marketplace detail page
      navigate(`/marketplaces/${createdMarketplace.id}`);
      
      setIsSubmitting(false);
    } catch (err) {
      console.error('Error creating marketplace:', err);
      setSubmitError('Failed to create marketplace. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Marketplaces
        </Typography>
        
        <MarketplaceList onCreateClick={handleCreateClick} />
        
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogContent>
            <MarketplaceForm
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              submitError={submitError}
            />
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
      </Box>
    </Container>
  );
};

export default MarketplacesPage;
