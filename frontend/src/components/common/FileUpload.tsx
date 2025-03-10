import React, { useState, useRef, ChangeEvent } from 'react';
import { Button, Box, Typography, CircularProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

interface FileUploadProps {
  onFileSelected: (file: File) => void;
  accept?: string;
  maxSize?: number; // in bytes
  label?: string;
  buttonText?: string;
  isLoading?: boolean;
  error?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelected,
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024, // 5MB default
  label = 'Upload a file',
  buttonText = 'Choose File',
  isLoading = false,
  error,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      setSelectedFile(null);
      return;
    }

    const file = files[0];
    
    // Validate file size
    if (file.size > maxSize) {
      setFileError(`File size exceeds the maximum allowed size (${maxSize / (1024 * 1024)}MB)`);
      setSelectedFile(null);
      return;
    }

    setFileError(null);
    setSelectedFile(file);
    onFileSelected(file);
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Box sx={{ my: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        {label}
      </Typography>
      
      <input
        type="file"
        accept={accept}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        ref={fileInputRef}
      />
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          variant="contained"
          component="span"
          onClick={handleButtonClick}
          startIcon={<CloudUploadIcon />}
          disabled={isLoading}
        >
          {buttonText}
        </Button>
        
        {isLoading && <CircularProgress size={24} />}
        
        {selectedFile && (
          <Typography variant="body2" sx={{ ml: 2 }}>
            {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
          </Typography>
        )}
      </Box>
      
      {(fileError || error) && (
        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
          {fileError || error}
        </Typography>
      )}
    </Box>
  );
};

export default FileUpload;
