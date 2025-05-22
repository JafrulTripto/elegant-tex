import React, { useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Tooltip,
  Stack,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Delete as DeleteIcon,
  ZoomIn as ZoomInIcon,
  BrokenImage as BrokenImageIcon,
  ZoomOut as ZoomOutIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { getFileUrl } from '../../services/fileStorage.service';

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  // State for image URL
  const [src, setSrc] = useState<string>('');
  
  // Set up the image URL
  useEffect(() => {
    setLoading(true);
    setError(false);
    
    if (imageUrl) {
      // Check if this is an object URL (starts with blob:)
      setSrc(imageUrl);
    } else if (imageId) {
      const url = getFileUrl(imageId);
      if (url) {
        setSrc(url);
      } else {
        setError(true);
        setLoading(false);
      }
    } else {
      setError(true);
      setLoading(false);
    }
    
    // Cleanup function to revoke object URL if we created one
    return () => {
      // We don't revoke object URLs that were passed as props
      // as they are managed by the parent component
    };
  }, [imageUrl, imageId]);

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

  // set the box image if the src is present
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
        
        {error || !src ? (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            width="100%"
            height="100%"
            p={1}
          >
            <BrokenImageIcon color="error" sx={{ fontSize: isMobile ? '1rem' : '1.25rem' }} />
            <Typography 
              variant="caption" 
              color="text.secondary" 
              align="center"
              sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
            >
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
                  sx={{ 
                    color: 'white', 
                    p: 0.5,
                    width: isMobile ? 28 : 32,
                    height: isMobile ? 28 : 32
                  }}
                >
                  <ZoomInIcon fontSize={isMobile ? "inherit" : "small"} sx={{ fontSize: isMobile ? '0.9rem' : '1.25rem' }} />
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
                  sx={{ 
                    color: 'white', 
                    p: 0.5,
                    width: isMobile ? 28 : 32,
                    height: isMobile ? 28 : 32
                  }}
                >
                  <DeleteIcon fontSize={isMobile ? "inherit" : "small"} sx={{ fontSize: isMobile ? '0.9rem' : '1.25rem' }} />
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
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: {
            height: isMobile ? '100vh' : '90vh',
            maxHeight: isMobile ? '100vh' : '90vh',
            width: isMobile ? '100%' : undefined,
            margin: isMobile ? 0 : undefined,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: isMobile ? 0 : undefined
          }
        }}
      >
        <DialogContent 
          sx={{ 
            p: 0, 
            overflow: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            flexGrow: 1
          }}
        >
          {/* Image viewer controls */}
          <Box
            sx={{
              position: 'absolute',
              top: isMobile ? 16 : 8,
              right: isMobile ? 16 : 8,
              zIndex: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              borderRadius: 1,
              p: isMobile ? 0.75 : 0.5
            }}
          >
            <Stack direction="row" spacing={1}>
              <ViewerControls src={src} />
            </Stack>
          </Box>
          
          <ImageViewer src={src} alt={imageName || 'Image preview'} />
        </DialogContent>
        <DialogActions sx={{ p: isMobile ? 2 : 1 }}>
          <Button 
            onClick={handleCloseDialog} 
            variant={isMobile ? "contained" : "text"}
            size={isMobile ? "large" : "medium"}
            fullWidth={isMobile}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

// Image viewer with original size support
const ImageViewer = ({ src, alt }: { src: string, alt: string }) => {
  const [originalSize, setOriginalSize] = useState(false);
  
  return (
    <Box
      component="img"
      src={src}
      alt={alt}
      sx={{
        display: 'block',
        margin: '0 auto',
        ...(originalSize 
          ? { 
              width: 'auto', 
              height: 'auto', 
              maxWidth: 'none', 
              maxHeight: 'none' 
            } 
          : { 
              maxWidth: '100%', 
              maxHeight: '100%', 
              objectFit: 'contain' 
            }
        )
      }}
      onClick={() => setOriginalSize(!originalSize)}
    />
  );
};

// Controls for the image viewer
const ViewerControls = ({ src }: { src: string }) => {
  const [originalSize, setOriginalSize] = useState(false);
  
  const handleToggleSize = () => {
    setOriginalSize(!originalSize);
    
    // Find the image element and update its style
    const imageElement = document.querySelector('.MuiDialog-root img') as HTMLImageElement;
    if (imageElement) {
      if (!originalSize) {
        // Switch to original size
        imageElement.style.maxWidth = 'none';
        imageElement.style.maxHeight = 'none';
        imageElement.style.width = 'auto';
        imageElement.style.height = 'auto';
      } else {
        // Switch to fit screen
        imageElement.style.maxWidth = '100%';
        imageElement.style.maxHeight = '100%';
        imageElement.style.width = 'auto';
        imageElement.style.height = 'auto';
      }
    }
  };
  
  const handleOpenInNewTab = () => {
    window.open(src, '_blank');
  };
  
  return (
    <>
      <Tooltip title={originalSize ? "Fit to screen" : "Original size"}>
        <IconButton 
          size="small" 
          onClick={handleToggleSize}
          sx={{ 
            color: 'white',
            width: { xs: 36, sm: 32 },
            height: { xs: 36, sm: 32 }
          }}
        >
          {originalSize ? <FullscreenExitIcon /> : <FullscreenIcon />}
        </IconButton>
      </Tooltip>
      
      <Tooltip title="Open in new tab">
        <IconButton 
          size="small" 
          onClick={handleOpenInNewTab}
          sx={{ 
            color: 'white',
            width: { xs: 36, sm: 32 },
            height: { xs: 36, sm: 32 }
          }}
        >
          <ZoomOutIcon />
        </IconButton>
      </Tooltip>
    </>
  );
};

export default OrderImagePreview;
