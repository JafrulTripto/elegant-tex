import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  IconButton,
  Paper,
  CircularProgress,
  Alert,
  Grid
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import OrderImagePreview from './OrderImagePreview';

interface OrderFileUploadProps {
  onFileSelect: (files: File[]) => void;
  selectedFiles: File[]; // Make selectedFiles a prop instead of internal state
  onRemoveFile: (index: number) => void; // Add callback for removing files
  maxFiles?: number;
  maxFileSize?: number;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  loading?: boolean;
  error?: string;
  helperText?: string;
}

const OrderFileUpload: React.FC<OrderFileUploadProps> = ({
  onFileSelect,
  selectedFiles,
  onRemoveFile,
  maxFiles = 5,
  maxFileSize = 5, // Default max file size: 5MB
  accept = 'image/*',
  multiple = true,
  disabled = false,
  loading = false,
  error,
  helperText
}) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [sizeError, setSizeError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;
    
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled || !e.target.files) return;
    
    handleFiles(Array.from(e.target.files));
    
    // Reset the input value so the same file can be selected again if removed
    e.target.value = '';
  };

  const handleFiles = (files: File[]) => {
    // Reset size error
    setSizeError(null);
    
    // Filter for accepted file types and size
    const validFiles = files.filter(file => {
      const fileType = file.type;
      const isValidType = accept === '*' || accept.includes('*') ? true : accept.includes(fileType);
      
      // Check file size (convert maxFileSize from MB to bytes)
      const isValidSize = file.size <= maxFileSize * 1024 * 1024;
      
      if (!isValidSize) {
        setSizeError(`File "${file.name}" exceeds the maximum size of ${maxFileSize}MB`);
        return false;
      }
      
      return isValidType;
    });
    
    // Limit to max files
    const newFiles = [...selectedFiles];
    
    // Check if adding these files would exceed the max files limit
    if (newFiles.length + validFiles.length > maxFiles) {
      setSizeError(`Maximum ${maxFiles} files allowed`);
      // Only add files up to the limit
      const remainingSlots = maxFiles - newFiles.length;
      if (remainingSlots <= 0) {
        return; // No slots available
      }
      // Only add files up to the remaining slots
      validFiles.splice(remainingSlots);
    }
    
    // Add valid files to the array
    for (let i = 0; i < validFiles.length; i++) {
      newFiles.push(validFiles[i]);
    }
    
    // Check total size of all files (limit to 10MB total to match server config)
    const totalSizeInBytes = newFiles.reduce((sum, file) => sum + file.size, 0);
    const totalSizeInMB = totalSizeInBytes / (1024 * 1024);
    const maxTotalSize = 10; // 10MB max total size (matching server config)
    
    if (totalSizeInMB > maxTotalSize) {
      setSizeError(`Total file size (${totalSizeInMB.toFixed(2)}MB) exceeds the maximum allowed (${maxTotalSize}MB)`);
      // Don't return the files that would exceed the limit
      return;
    }
    
    onFileSelect(newFiles);
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Box>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        disabled={disabled || loading}
      />
      
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          border: '2px dashed',
          borderColor: dragActive ? 'primary.main' : error ? 'error.main' : 'divider',
          backgroundColor: dragActive ? 'action.hover' : 'background.paper',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.7 : 1,
          transition: 'all 0.2s ease',
          minHeight: '120px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onClick={disabled ? undefined : handleButtonClick}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {loading ? (
          <CircularProgress size={40} />
        ) : (
          <>
            <CloudUploadIcon color={error ? 'error' : 'primary'} sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="body1" align="center" gutterBottom>
              {dragActive
                ? 'Drop files here'
                : `Drag and drop files here, or click to select files`}
            </Typography>
            <Typography variant="caption" color="text.secondary" align="center">
              {helperText || `Accepted formats: ${accept}. Max ${maxFiles} files, ${maxFileSize}MB per file.`}
            </Typography>
          </>
        )}
      </Paper>
      
      {(error || sizeError) && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error || sizeError}
        </Alert>
      )}
      
      {selectedFiles.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Selected Files ({selectedFiles.length}/{maxFiles})
          </Typography>
          
          {/* File list with text info */}
          {selectedFiles.map((file, index) => (
            <Box
              key={`${file.name}-${index}`}
              sx={{
                display: 'flex',
                alignItems: 'center',
                p: 1,
                borderRadius: 1,
                mb: 1,
                backgroundColor: 'background.default'
              }}
            >
              <ImageIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="body2" sx={{ flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </Typography>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveFile(index);
                }}
                disabled={disabled || loading}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
          
          {/* Image previews */}
          <Box mt={2} display="flex" flexWrap="wrap" gap={1}>
            {selectedFiles.map((file, index) => (
              <OrderImagePreview
                key={`preview-${index}-${file.name}`}
                imageUrl={URL.createObjectURL(file)}
                imageName={file.name}
                showDeleteButton={true}
                onRemove={() => onRemoveFile(index)}
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default OrderFileUpload;
