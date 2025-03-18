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
  FormControlLabel,
  Switch,
  useTheme,
} from '@mui/material';
import { spacing, layoutUtils } from '../../theme/styleUtils';
import { User } from '../../types';
import { MarketplaceFormData } from '../../types/marketplace';
import { userService } from '../../services/user.service';
import FileUpload from '../common/FileUpload';
import ImagePreview from '../common/ImagePreview';
import { uploadMarketplaceImage } from '../../services/marketplace.service';

interface MarketplaceFormProps {
  initialData?: Partial<MarketplaceFormData>;
  marketplaceId?: number;
  onSubmit: (data: MarketplaceFormData, tempImageFile?: File) => Promise<void>;
  isSubmitting?: boolean;
  submitError?: string;
}

const MarketplaceForm: React.FC<MarketplaceFormProps> = ({
  initialData,
  marketplaceId,
  onSubmit,
  isSubmitting = false,
  submitError,
}) => {
  const [formData, setFormData] = useState<MarketplaceFormData>({
    name: initialData?.name || '',
    pageUrl: initialData?.pageUrl || '',
    imageId: initialData?.imageId,
    active: initialData?.active !== undefined ? initialData.active : true,
    memberIds: initialData?.memberIds || [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [tempImageFile, setTempImageFile] = useState<File | null>(null);
  const [tempImagePreview, setTempImagePreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const response = await userService.getAllUsers();
        setUsers(response.data);
        
        // Set selected users based on initialData memberIds
        if (initialData?.memberIds && initialData.memberIds.length > 0) {
          const selected = response.data.filter(user => 
            initialData.memberIds?.includes(user.id)
          );
          setSelectedUsers(selected);
        }
        
        setLoadingUsers(false);
      } catch (err) {
        console.error('Error fetching users:', err);
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [initialData?.memberIds]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleUserChange = (_: React.SyntheticEvent, newValue: User[]) => {
    setSelectedUsers(newValue);
    setFormData(prev => ({
      ...prev,
      memberIds: newValue.map(user => user.id),
    }));
  };

  const handleImageUpload = async (file: File) => {
    if (!marketplaceId) {
      // For new marketplaces, store the file temporarily and create a preview
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
      // For existing marketplaces, upload the image immediately
      try {
        setUploadingImage(true);
        setImageError(null);
        
        const response = await uploadMarketplaceImage(marketplaceId, file);
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
    
    if (!formData.pageUrl.trim()) {
      newErrors.pageUrl = 'Page URL is required';
    } else if (!/^https?:\/\/.+/.test(formData.pageUrl)) {
      newErrors.pageUrl = 'Please enter a valid URL starting with http:// or https://';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
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

  const theme = useTheme();
  
  return (
    <Paper elevation={2} sx={{ ...spacing.container(theme) }}>
      <Typography variant="h6" component="h2" gutterBottom>
        {marketplaceId ? 'Edit Marketplace' : 'Create Marketplace'}
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Grid container spacing={theme.customSpacing.element * 4}>
          <Grid item xs={12} md={8}>
            <TextField
              name="name"
              label="Marketplace Name"
              fullWidth
              required
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
              disabled={isSubmitting}
              margin="normal"
            />
            
            <TextField
              name="pageUrl"
              label="Page URL"
              fullWidth
              required
              value={formData.pageUrl}
              onChange={handleChange}
              error={!!errors.pageUrl}
              helperText={errors.pageUrl || 'Enter the full URL including http:// or https://'}
              disabled={isSubmitting}
              margin="normal"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={formData.active}
                  onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                  name="active"
                  color="primary"
                  disabled={isSubmitting}
                />
              }
              label={formData.active ? "Active" : "Inactive"}
              sx={{ mt: theme.customSpacing.element, mb: theme.customSpacing.item }}
            />
            
            <Autocomplete
              multiple
              options={users}
              loading={loadingUsers}
              value={selectedUsers}
              onChange={handleUserChange}
              getOptionLabel={(option) => `${option.firstName || ''} ${option.lastName || ''} (${option.email})`}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Members"
                  margin="normal"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingUsers ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={`${option.firstName || ''} ${option.lastName || ''}`}
                    {...getTagProps({ index })}
                  />
                ))
              }
              disabled={isSubmitting}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: theme.customSpacing.element }}>
              <Typography variant="subtitle1" gutterBottom>
                Marketplace Image
              </Typography>
              
              {tempImagePreview ? (
                // Show temporary image preview for new marketplaces
                <Box
                  component="img"
                  src={tempImagePreview}
                  alt="Marketplace Preview"
                  sx={{
                    height: 200,
                    width: '100%',
                    objectFit: 'cover',
                    borderRadius: 1,
                  }}
                />
              ) : (
                // Show stored image for existing marketplaces
                <ImagePreview
                  imageId={formData.imageId}
                  height={200}
                  width="100%"
                  alt="Marketplace"
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
              {marketplaceId
                ? 'Upload an image for your marketplace'
                : tempImageFile
                  ? 'Image will be uploaded after marketplace creation'
                  : 'Select an image for your new marketplace'}
            </FormHelperText>
          </Grid>
        </Grid>
        
        {submitError && (
          <Typography color="error" sx={{ mt: theme.customSpacing.element }}>
            {submitError}
          </Typography>
        )}
        
        <Box sx={{ mt: theme.customSpacing.section, ...layoutUtils.endFlex }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting}
            sx={{ minWidth: 120 }}
          >
            {isSubmitting ? <CircularProgress size={24} /> : marketplaceId ? 'Update' : 'Create'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default MarketplaceForm;
