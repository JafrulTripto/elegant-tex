import React, { useState } from 'react';
import {
  Box,
  IconButton,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from '@mui/material';
import {
  Delete as DeleteIcon,
  ZoomIn as ZoomInIcon,
  BrokenImage as BrokenImageIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import api from '../../services/api';

interface OrderImagePreviewProps {
  imageUrl?: string;
  imageName?: string;
  imageId?: number;
  width?: number | string;
  height?: number | string;
  onDelete?: () => void;
  onRemove?: () => void;  // Added for compatibility with OrderFormPage
  showDeleteButton?: boolean;
  showZoomButton?: boolean;
}

const ImageContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.grey[100],
  '&:hover .image-actions': {
    opacity: 1
  }
}));

const ImageActions = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  right: 0,
  padding: theme.spacing(0.5),
  display: 'flex',
  opacity: 0,
  transition: 'opacity 0.2s ease-in-out',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  borderBottomLeftRadius: theme.shape.borderRadius
}));

const OrderImagePreview: React.FC<OrderImagePreviewProps> = ({
  imageUrl,
  imageName,
  imageId,
  width = 150,
  height = 150,
  onDelete,
  onRemove,
  showDeleteButton = true,
  showZoomButton = true
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  // Determine the source URL
  const src = imageUrl || (imageId ? `/files/${imageId}` : '');

  const handleImageError = () => {
    setError(true);
    setLoading(false);
  };

  const handleImageLoad = () => {
    setLoading(false);
  };

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  return (
    <>
      <ImageContainer sx={{ width, height }}>
        {loading && (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            width="100%"
            height="100%"
          >
            <CircularProgress size={24} />
          </Box>
        )}
        
        {error ? (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            width="100%"
            height="100%"
            p={1}
          >
            <BrokenImageIcon color="error" />
            <Typography variant="caption" color="text.secondary" align="center">
              Failed to load image
            </Typography>
          </Box>
        ) : (
          <>
            <Box
              component="img"
              src={src}
              alt={imageName || 'Image preview'}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: loading ? 'none' : 'block'
              }}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
            
            <ImageActions className="image-actions">
              {showZoomButton && (
                <IconButton
                  size="small"
                  onClick={handleOpenDialog}
                  sx={{ color: 'white', p: 0.5 }}
                >
                  <ZoomInIcon fontSize="small" />
                </IconButton>
              )}
              
              {(showDeleteButton && (onDelete || onRemove)) && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent opening the dialog when clicking delete
                    if (onDelete) onDelete();
                    if (onRemove) onRemove();
                  }}
                  sx={{ color: 'white', p: 0.5 }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
            </ImageActions>
          </>
        )}
      </ImageContainer>
      
      {/* Full-size image dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="lg"
      >
        <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
          <Box
            component="img"
            src={src}
            alt={imageName || 'Image preview'}
            sx={{
              maxWidth: '100%',
              maxHeight: '80vh',
              display: 'block',
              margin: '0 auto'
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default OrderImagePreview;
