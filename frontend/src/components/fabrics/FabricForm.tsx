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
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { layoutUtils } from '../../theme/styleUtils';
import { FabricFormData } from '../../types/fabric';
import { searchTags } from '../../services/tag.service';
import ImageUploadArea from '../common/ImageUploadArea';
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
    active: initialData?.active !== undefined ? initialData.active : true,
    tagNames: initialData?.tagNames || [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagOptions, setTagOptions] = useState<string[]>([]);
  const [tagInputValue, setTagInputValue] = useState('');
  const [searchingTags, setSearchingTags] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
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
        setSearchingTags(true);
        const tags = await searchTags(tagInputValue);

        if (Array.isArray(tags) && tags.length > 0) {
          setTagOptions(tags.map(tag => tag.name));
        } else {
          setTagOptions([]);
        }

        setSearchingTags(false);
      } catch (err) {
        console.error('Error searching tags:', err);
        setTagOptions([]);
        setSearchingTags(false);
      }
    };

    const timeoutId = setTimeout(fetchTags, 300);
    return () => clearTimeout(timeoutId);
  }, [tagInputValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleTagChange = (_: React.SyntheticEvent, newValue: string[]) => {
    setFormData(prev => ({ ...prev, tagNames: newValue }));
  };

  const handleImageUpload = async (file: File) => {
    if (!fabricId) {
      try {
        setImageError(null);
        setTempImageFile(file);
        const previewUrl = URL.createObjectURL(file);
        setTempImagePreview(previewUrl);
        return () => URL.revokeObjectURL(previewUrl);
      } catch (err) {
        console.error('Error creating image preview:', err);
        setImageError('Failed to preview image. Please try again.');
      }
    } else {
      try {
        setUploadingImage(true);
        setImageError(null);
        const response = await uploadFabricImage(fabricId, file);
        setFormData(prev => ({ ...prev, imageId: response.imageId }));

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
    if (!validateForm()) return;
    await onSubmit(formData, tempImageFile || undefined);
  };

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
                Basic Information
              </Typography>

              <TextField
                name="name"
                label="Fabric Name"
                fullWidth
                required
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name || "Enter the name of your fabric"}
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
                <Tooltip title="Active fabrics are visible to users and can be selected for orders">
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
                <LocalOfferIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                Tags
              </Typography>

              <Autocomplete
                multiple
                freeSolo
                options={tagOptions}
                loading={searchingTags}
                value={formData.tagNames}
                onChange={handleTagChange}
                inputValue={tagInputValue}
                onInputChange={(_, newInputValue) => {
                  setTagInputValue(newInputValue);
                }}
                filterOptions={(options, params) => {
                  const filtered = options.filter(option =>
                    option.toLowerCase().includes(params.inputValue.toLowerCase())
                  );

                  const inputValue = params.inputValue.trim();
                  if (inputValue !== '' && !options.includes(inputValue)) {
                    filtered.push(inputValue);
                  }

                  return filtered;
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Tags"
                    placeholder="Add tags..."
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
                Fabric Image
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
                alt="Fabric"
                helperText={
                  fabricId
                    ? 'Upload an image for your fabric'
                    : tempImageFile
                      ? 'Image will be uploaded after fabric creation'
                      : 'Select an image for your new fabric'
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
          {isSubmitting ? <CircularProgress size={24} /> : fabricId ? 'Update' : 'Create'}
        </Button>
      </Box>
    </Box>

  );
};

export default FabricForm;
