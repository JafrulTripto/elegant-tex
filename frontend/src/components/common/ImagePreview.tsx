import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { getFileUrl } from '../../services/fileStorage.service';


interface ImagePreviewProps {
  imageId?: number | null;
  alt?: string;
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  fallbackText?: string;
  fallbackImage?: string;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  imageId,
  alt = 'Image',
  width = '100%',
  height = 200,
  borderRadius = 2,
  fallbackText = 'No image available',
  fallbackImage,
}) => {
  const [loading, setLoading] = useState<boolean>(!!imageId);
  const [error, setError] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (imageId) {
      setLoading(true);
      setError(false);
      
      // Get the image URL using the getFileUrl function
      const url = getFileUrl(imageId);
      setImageUrl(url);
      setLoading(false);
    } else {
      setLoading(false);
      setImageUrl(null);
    }
  }, [imageId]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width,
          height,
          bgcolor: 'background.paper',
          borderRadius,
        }}
      >
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (error || !imageUrl) {
    if (fallbackImage) {
      return (
        <Box
          component="img"
          src={fallbackImage}
          alt={alt}
          sx={{
            width,
            height,
            objectFit: 'cover',
            borderRadius,
          }}
        />
      );
    }
    
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width,
          height,
          bgcolor: 'background.paper',
          borderRadius,
          border: '1px dashed',
          borderColor: 'divider',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {fallbackText}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      component="img"
      src={imageUrl}
      alt={alt}
      onError={() => setError(true)}
      sx={{
        width,
        height,
        objectFit: 'cover',
        borderRadius,
      }}
    />
  );
};

export default ImagePreview;
