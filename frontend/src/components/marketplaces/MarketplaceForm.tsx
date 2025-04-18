import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  Autocomplete,
  Chip,
  CircularProgress,
  FormControlLabel,
  Switch,
  useTheme,
  Card,
  CardContent,
  Tooltip,
  alpha,
  IconButton,
} from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LanguageIcon from '@mui/icons-material/Language';
import PeopleIcon from '@mui/icons-material/People';
import { layoutUtils } from '../../theme/styleUtils';
import { User } from '../../types';
import { MarketplaceFormData } from '../../types/marketplace';
import { userService } from '../../services/user.service';
import ImageUploadArea from '../common/ImageUploadArea';
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
    <Box
      component="form"
      onSubmit={handleSubmit}
      noValidate
      sx={{ p: theme.customSpacing.element}}
    >
      <Grid container spacing={theme.customSpacing.element * 2}>
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ mb: 3, borderRadius: 2, boxShadow: 'none' }}>
            <CardContent sx={{ p: 1.5 }}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <LanguageIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                Basic Information
              </Typography>

              <TextField
                name="name"
                label="Marketplace Name"
                fullWidth
                required
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name || "Enter the name of your marketplace"}
                disabled={isSubmitting}
                margin="normal"
                variant="outlined"
                sx={{ mb: 2 }}
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
                variant="outlined"
                sx={{ mb: 2 }}
              />

              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 2,
                p: 1,
                backgroundColor: alpha(
                  formData.active ? theme.palette.success.main : theme.palette.grey[500],
                  0.1
                ),
                borderRadius: 1.5,
              }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.active}
                      onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                      name="active"
                      color={formData.active ? "success" : "default"}
                      disabled={isSubmitting}
                    />
                  }
                  label={
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 'medium',
                        color: formData.active ? theme.palette.success.dark : theme.palette.text.secondary
                      }}
                    >
                      {formData.active ? "Active" : "Inactive"}
                    </Typography>
                  }
                />
                <Tooltip title="Active marketplaces are visible to users and can be selected for orders">
                  <IconButton size="small" sx={{ ml: 1 }}>
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </CardContent>
          </Card>

          <Card variant="outlined" sx={{ borderRadius: 2, boxShadow: 'none' }}>
            <CardContent sx={{ p: 1.5 }}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <PeopleIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                Members
              </Typography>

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
                    placeholder="Add members..."
                    margin="normal"
                    helperText="Select users who can manage this marketplace"
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
                      sx={{
                        m: 0.5,
                        borderRadius: 1,
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.dark,
                      }}
                    />
                  ))
                }
                disabled={isSubmitting}
                disableCloseOnSelect
                openOnFocus
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ height: '100%', borderRadius: 2, boxShadow: 'none' }}>
            <CardContent sx={{ p: 1.5 }}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <AddPhotoAlternateIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                Marketplace Image
              </Typography>

              <ImageUploadArea
                imageId={formData.imageId}
                previewUrl={tempImagePreview}
                onFileSelected={handleImageUpload}
                onImageRemove={() => {
                  if (tempImagePreview) {
                    URL.revokeObjectURL(tempImagePreview);
                    setTempImagePreview(null);
                  }
                  setTempImageFile(null);
                  setFormData(prev => ({ ...prev, imageId: undefined }));
                }}
                isLoading={uploadingImage}
                error={imageError}
                height={250}
                alt="Marketplace"
                helperText={
                  marketplaceId
                    ? 'Upload an image for your marketplace'
                    : tempImageFile
                      ? 'Image will be uploaded after marketplace creation'
                      : 'Select an image for your new marketplace'
                }
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {submitError && (
        <Typography color="error" sx={{ mt: 2, p: 2, borderRadius: 1, bgcolor: alpha(theme.palette.error.main, 0.1) }}>
          {submitError}
        </Typography>
      )}

      <Box sx={{ mt: theme.customSpacing.section, ...layoutUtils.endFlex }}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isSubmitting}
          sx={{ minWidth: 120, borderRadius: 2, py: 1 }}
        >
          {isSubmitting ? <CircularProgress size={24} /> : marketplaceId ? 'Update' : 'Create'}
        </Button>
      </Box>
    </Box>
  );
};

export default MarketplaceForm;
