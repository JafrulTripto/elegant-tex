import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  IconButton,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Image as ImageIcon
} from '@mui/icons-material';

interface OrderFileUploadProps {
  onFileSelect: (files: File[]) => void;
  maxFiles?: number;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  loading?: boolean;
  error?: string;
  helperText?: string;
}

const OrderFileUpload: React.FC<OrderFileUploadProps> = ({
  onFileSelect,
  maxFiles = 5,
  accept = 'image/*',
  multiple = true,
  disabled = false,
  loading = false,
  error,
  helperText
}) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
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
    // Filter for accepted file types
    const validFiles = files.filter(file => {
      const fileType = file.type;
      return accept === '*' || accept.includes('*') ? true : accept.includes(fileType);
    });
    
    // Limit to max files
    const newFiles = [...selectedFiles];
    
    for (let i = 0; i < validFiles.length; i++) {
      if (newFiles.length < maxFiles) {
        newFiles.push(validFiles[i]);
      } else {
        break;
      }
    }
    
    setSelectedFiles(newFiles);
    onFileSelect(newFiles);
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
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
              {helperText || `Accepted formats: ${accept}. Max ${maxFiles} files.`}
            </Typography>
          </>
        )}
      </Paper>
      
      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}
      
      {selectedFiles.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Selected Files ({selectedFiles.length}/{maxFiles})
          </Typography>
          
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
                  handleRemoveFile(index);
                }}
                disabled={disabled || loading}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default OrderFileUpload;
