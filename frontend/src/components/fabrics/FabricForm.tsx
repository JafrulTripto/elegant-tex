import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  Autocomplete,
  Chip,
  CircularProgress,
  FormHelperText,
} from '@mui/material';
import { FabricFormData } from '../../types/fabric';
import { searchTags } from '../../services/tag.service';
import FileUpload from '../common/FileUpload';
import ImagePreview from '../common/ImagePreview';
import { uploadFabricImage } from '../../services/fabric.service';

interface FabricFormProps {
  initialData?: Partial<FabricFormData>;
  fabricId?: number;
  onSubmit: (data: FabricFormData, tempImageFile?: File) => Promise<void>;
  isSubmitting?: boolean;
  submitError?: string;
}

const FabricForm: React.FC<FabricFormProps> = ({
  initialData,
  fabricId,
  onSubmit,
  isSubmitting = false,
  submitError,
}) => {
  const [formData, setFormData] = useState<FabricFormData>({
    name: initialData?.name || '',
    imageId: initialData?.imageId,
    tagNames: initialData?.tagNames || [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagOptions, setTagOptions] = useState<string[]>([]);
  const [tagInputValue, setTagInputValue] = useState('');
  const [searchingTags, setSearchingTags] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  
  // New state for storing temporary image file
  const [tempImageFile, setTempImageFile] = useState<File | null>(null);
  const [tempImagePreview, setTempImagePreview] = useState<string | null>(null);

  // Search tags when input changes
  useEffect(() => {
    const fetchTags = async () => {
      if (tagInputValue.trim().length < 1) {
        setTagOptions([]);
        return;
      }
      
      try {
        console.log('Searching for tags with query:', tagInputValue);
        setSearchingTags(true);
        const tags = await searchTags(tagInputValue);
        console.log('Tags search result:', tags);
        setTagOptions(tags.map(tag => tag.name));
        setSearchingTags(false);
      } catch (err) {
        console.error('Error searching tags:', err);
        setSearchingTags(false);
      }
    };

    const timeoutId = setTimeout(fetchTags, 300);
    return () => clearTimeout(timeoutId);
  }, [tagInputValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleTagChange = (event: React.SyntheticEvent, newValue: string[]) => {
    console.log('Tag selection changed:', newValue);
    setFormData(prev => ({
      ...prev,
      tagNames: newValue,
    }));
  };

  const handleImageUpload = async (file: File) => {
    if (!fabricId) {
      // For new fabrics, store the file temporarily and create a preview
      try {
        setImageError(null);
        setTempImageFile(file);
        
        // Create a preview URL for the temporary image
        const previewUrl = URL.createObjectURL(file);
        setTempImagePreview(previewUrl);
        
        return () => {
          // Clean up the object URL when component unmounts or when no longer needed
          URL.revokeObjectURL(previewUrl);
        };
      } catch (err) {
        console.error('Error creating image preview:', err);
        setImageError('Failed to preview image. Please try again.');
      }
    } else {
      // For existing fabrics, upload the image immediately
      try {
        setUploadingImage(true);
        setImageError(null);
        
        const response = await uploadFabricImage(fabricId, file);
        setFormData(prev => ({ ...prev, imageId: response.imageId }));
        
        // Clear temporary image if there was one
        if (tempImagePreview) {
          URL.revokeObjectURL(tempImagePreview);
          setTempImagePreview(null);
        }
        setTempImageFile(null);
        
        setUploadingImage(false);
      } catch (err) {
        console.error('Error uploading image:', err);
        setImageError('Failed to upload image. Please try again.');
        setUploadingImage(false);
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    console.log('Submitting fabric form with data:', formData);
    // Pass the temporary image file to the parent component for handling after fabric creation
    await onSubmit(formData, tempImageFile || undefined);
  };

  // Clean up object URL when component unmounts
  useEffect(() => {
    return () => {
      if (tempImagePreview) {
        URL.revokeObjectURL(tempImagePreview);
      }
    };
  }, [tempImagePreview]);

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" component="h2" gutterBottom>
        {fabricId ? 'Edit Fabric' : 'Create Fabric'}
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <TextField
              name="name"
              label="Fabric Name"
              fullWidth
              required
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
              disabled={isSubmitting}
              margin="normal"
            />
            
            <Autocomplete
              multiple
              freeSolo
              options={tagOptions}
              loading={searchingTags}
              value={formData.tagNames}
              onChange={handleTagChange}
              inputValue={tagInputValue}
              onInputChange={(event, newInputValue) => {
                setTagInputValue(newInputValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Tags"
                  margin="normal"
                  helperText="Type to search for existing tags or create new ones"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {searchingTags ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option}
                    {...getTagProps({ index })}
                  />
                ))
              }
              disabled={isSubmitting}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Fabric Image
              </Typography>
              
              {tempImagePreview ? (
                // Show temporary image preview for new fabrics
                <Box
                  component="img"
                  src={tempImagePreview}
                  alt="Fabric Preview"
                  sx={{
                    height: 200,
                    width: '100%',
                    objectFit: 'cover',
                    borderRadius: 1,
                  }}
                />
              ) : (
                // Show stored image for existing fabrics
                <ImagePreview
                  imageId={formData.imageId}
                  height={200}
                  width="100%"
                  alt="Fabric"
                />
              )}
            </Box>
            
            <FileUpload
              onFileSelected={handleImageUpload}
              accept="image/*"
              label="Upload Image"
              buttonText="Choose Image"
              isLoading={uploadingImage}
              error={imageError || undefined}
            />
            <FormHelperText>
              {fabricId
                ? 'Upload an image for your fabric'
                : tempImageFile
                  ? 'Image will be uploaded after fabric creation'
                  : 'Select an image for your new fabric'}
            </FormHelperText>
          </Grid>
        </Grid>
        
        {submitError && (
          <Typography color="error" sx={{ mt: 2 }}>
            {submitError}
          </Typography>
        )}
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting}
            sx={{ minWidth: 120 }}
          >
            {isSubmitting ? <CircularProgress size={24} /> : fabricId ? 'Update' : 'Create'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default FabricForm;