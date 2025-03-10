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
import { User } from '../../types';
import { MarketplaceFormData } from '../../types/marketplace';
import { userService } from '../../services/user.service';
import FileUpload from '../common/FileUpload';
import ImagePreview from '../common/ImagePreview';
import { uploadMarketplaceImage } from '../../services/marketplace.service';

interface MarketplaceFormProps {
  initialData?: Partial<MarketplaceFormData>;
  marketplaceId?: number;
  onSubmit: (data: MarketplaceFormData) => Promise<void>;
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
    memberIds: initialData?.memberIds || [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [imageError, setImageError] = useState<string | null>(null);

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

  const handleUserChange = (event: React.SyntheticEvent, newValue: User[]) => {
    setSelectedUsers(newValue);
    setFormData(prev => ({
      ...prev,
      memberIds: newValue.map(user => user.id),
    }));
  };

  const handleImageUpload = async (file: File) => {
    if (!marketplaceId) {
      // For new marketplaces, we'll handle the image upload after the marketplace is created
      return;
    }
    
    try {
      setUploadingImage(true);
      setImageError(null);
      
      const response = await uploadMarketplaceImage(marketplaceId, file);
      setFormData(prev => ({ ...prev, imageId: response.imageId }));
      
      setUploadingImage(false);
    } catch (err) {
      console.error('Error uploading image:', err);
      setImageError('Failed to upload image. Please try again.');
      setUploadingImage(false);
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
    
    await onSubmit(formData);
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" component="h2" gutterBottom>
        {marketplaceId ? 'Edit Marketplace' : 'Create Marketplace'}
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Grid container spacing={3}>
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
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Marketplace Image
              </Typography>
              
              <ImagePreview
                imageId={formData.imageId}
                height={200}
                width="100%"
                alt="Marketplace"
              />
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
                : 'You can upload an image after creating the marketplace'}
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
            {isSubmitting ? <CircularProgress size={24} /> : marketplaceId ? 'Update' : 'Create'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default MarketplaceForm;
