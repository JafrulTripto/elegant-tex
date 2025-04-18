import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  IconButton,
  Fade,
  useTheme,
  alpha,
  Tooltip,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ImagePreview from './ImagePreview';

interface ImageUploadAreaProps {
  imageId?: number | null;
  onFileSelected: (file: File) => void;
  onImageRemove?: () => void;
  accept?: string;
  maxSize?: number; // in bytes
  isLoading?: boolean;
  error?: string | null;
  previewUrl?: string | null;
  height?: number | string;
  width?: number | string;
  alt?: string;
  helperText?: string;
}

const ImageUploadArea: React.FC<ImageUploadAreaProps> = ({
  imageId,
  onFileSelected,
  onImageRemove,
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024, // 5MB default
  isLoading = false,
  error = null,
  previewUrl = null,
  height = 250,
  width = '100%',
  alt = 'Image',
  helperText,
}) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  // Set up drag and drop event listeners
  useEffect(() => {
    const dropArea = dropAreaRef.current;
    if (!dropArea) return;

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        handleFile(e.dataTransfer.files[0]);
      }
    };

    dropArea.addEventListener('dragover', handleDragOver);
    dropArea.addEventListener('dragenter', handleDragEnter);
    dropArea.addEventListener('dragleave', handleDragLeave);
    dropArea.addEventListener('drop', handleDrop);

    return () => {
      dropArea.removeEventListener('dragover', handleDragOver);
      dropArea.removeEventListener('dragenter', handleDragEnter);
      dropArea.removeEventListener('dragleave', handleDragLeave);
      dropArea.removeEventListener('drop', handleDrop);
    };
  }, []);

  const handleFile = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setFileError('Please upload an image file');
      return;
    }
    
    // Validate file size
    if (file.size > maxSize) {
      setFileError(`File size exceeds the maximum allowed size (${maxSize / (1024 * 1024)}MB)`);
      return;
    }

    setFileError(null);
    onFileSelected(file);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    handleFile(files[0]);
    
    // Reset the input value so the same file can be selected again if needed
    event.target.value = '';
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveImage = () => {
    if (onImageRemove) {
      onImageRemove();
    }
  };

  // Determine if we have an image to display (either from imageId or previewUrl)
  const hasImage = !!imageId || !!previewUrl;

  // Empty state - no image
  const renderEmptyState = () => (
    <Box
      ref={dropAreaRef}
      onClick={handleButtonClick}
      sx={{
        height,
        width,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px dashed',
        borderColor: isDragging 
          ? theme.palette.primary.main 
          : isHovering 
            ? alpha(theme.palette.primary.main, 0.7)
            : alpha(theme.palette.divider, 0.7),
        borderRadius: 2,
        backgroundColor: isDragging 
          ? alpha(theme.palette.primary.main, 0.05)
          : isHovering 
            ? alpha(theme.palette.background.paper, 0.8)
            : theme.palette.background.paper,
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        p: 3,
        '&:hover': {
          borderColor: alpha(theme.palette.primary.main, 0.7),
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
        },
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <CloudUploadIcon 
        sx={{ 
          fontSize: 48, 
          color: isDragging || isHovering 
            ? theme.palette.primary.main 
            : alpha(theme.palette.text.secondary, 0.5),
          mb: 2,
          transition: 'color 0.2s ease-in-out',
        }} 
      />
      <Typography 
        variant="body1" 
        align="center"
        sx={{ 
          color: isDragging || isHovering 
            ? theme.palette.primary.main 
            : theme.palette.text.secondary,
          fontWeight: 'medium',
        }}
      >
        Drag image here or click to upload
      </Typography>
      <Typography 
        variant="body2" 
        align="center" 
        color="textSecondary"
        sx={{ mt: 1 }}
      >
        {helperText || `Supported formats: JPEG, PNG, GIF (max ${maxSize / (1024 * 1024)}MB)`}
      </Typography>
    </Box>
  );

  // Image preview state
  const renderImagePreview = () => (
    <Box
      ref={dropAreaRef}
      sx={{
        position: 'relative',
        height,
        width,
        borderRadius: 2,
        overflow: 'hidden',
        '&:hover .image-overlay': {
          opacity: 1,
        },
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {previewUrl ? (
        <Box
          component="img"
          src={previewUrl}
          alt={alt}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      ) : (
        <ImagePreview
          imageId={imageId}
          alt={alt}
          width="100%"
          height="100%"
        />
      )}
      
      {/* Overlay with actions */}
      <Fade in={isHovering}>
        <Box
          className="image-overlay"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            opacity: 0,
            transition: 'opacity 0.2s ease-in-out',
          }}
        >
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Replace image">
              <IconButton
                onClick={handleButtonClick}
                sx={{
                  backgroundColor: alpha(theme.palette.common.white, 0.9),
                  '&:hover': {
                    backgroundColor: theme.palette.common.white,
                  },
                }}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            
            {onImageRemove && (
              <Tooltip title="Remove image">
                <IconButton
                  onClick={handleRemoveImage}
                  sx={{
                    backgroundColor: alpha(theme.palette.common.white, 0.9),
                    '&:hover': {
                      backgroundColor: theme.palette.common.white,
                    },
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
      </Fade>
    </Box>
  );

  // Loading state overlay
  const renderLoadingOverlay = () => (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        zIndex: 1,
        borderRadius: 2,
      }}
    >
      <CircularProgress size={40} />
      <Typography variant="body2" sx={{ mt: 2 }}>
        Uploading image...
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ position: 'relative' }}>
      <input
        type="file"
        accept={accept}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        ref={fileInputRef}
      />
      
      {hasImage ? renderImagePreview() : renderEmptyState()}
      
      {isLoading && renderLoadingOverlay()}
      
      {(fileError || error) && (
        <Typography 
          color="error" 
          variant="body2" 
          sx={{ 
            mt: 1, 
            p: 1, 
            borderRadius: 1, 
            bgcolor: alpha(theme.palette.error.main, 0.1) 
          }}
        >
          {fileError || error}
        </Typography>
      )}
    </Box>
  );
};

export default ImageUploadArea;
