import React from 'react';
import {
  Box,
  Card,
  CardContent,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { Field, FieldProps } from 'formik';
import { OrderProductFormData } from '../../../types/order';
import { ProductType } from '../../../types/productType';
import { Fabric } from '../../../types/fabric';
import OrderFileUpload from '../OrderFileUpload';
import OrderImagePreview from '../OrderImagePreview';
import FabricSelector from './FabricSelector';

interface ProductFormItemProps {
  product: OrderProductFormData;
  index: number;
  productTypes: ProductType[];
  fabrics: Fabric[];
  handleFabricListScroll: (event: React.UIEvent<HTMLUListElement>) => void;
  loadingFabrics: boolean;
  canDelete: boolean;
  onDelete: () => void;
  touched: any;
  errors: any;
  setFieldValue: (field: string, value: any) => void;
}

const ProductFormItem: React.FC<ProductFormItemProps> = ({
  product,
  index,
  productTypes,
  fabrics,
  handleFabricListScroll,
  loadingFabrics,
  canDelete,
  onDelete,
  touched,
  errors,
  setFieldValue
}) => {
  return (
    <Card sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="subtitle1">Product #{index + 1}</Typography>
          {canDelete && (
            <IconButton
              color="error"
              onClick={onDelete}
            >
              <DeleteIcon />
            </IconButton>
          )}
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControl 
              fullWidth
              error={
                touched.products && 
                Array.isArray(touched.products) &&
                touched.products[index] && 
                touched.products[index]?.productType && 
                Boolean(errors.products && 
                Array.isArray(errors.products) &&
                errors.products[index] && 
                typeof errors.products[index] === 'object' &&
                'productType' in errors.products[index])
              }
            >
              <InputLabel id={`product-type-label-${index}`}>Product Type</InputLabel>
              <Field
                name={`products[${index}].productType`}
                as={Select}
                labelId={`product-type-label-${index}`}
                id={`productType-${index}`}
                label="Product Type"
                required
              >
                {productTypes.map((type) => (
                  <MenuItem key={type.id} value={type.name}>
                    {type.name}
                  </MenuItem>
                ))}
              </Field>
              {touched.products && 
               Array.isArray(touched.products) &&
               touched.products[index] && 
               touched.products[index]?.productType && 
               errors.products && 
               Array.isArray(errors.products) &&
               errors.products[index] && 
               typeof errors.products[index] === 'object' &&
               'productType' in errors.products[index] && (
                <FormHelperText>{(errors.products[index] as any).productType}</FormHelperText>
              )}
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FabricSelector
              fabrics={fabrics}
              selectedFabricId={product.fabricId}
              onFabricChange={(fabricId) => setFieldValue(`products[${index}].fabricId`, fabricId)}
              handleFabricListScroll={handleFabricListScroll}
              loadingFabrics={loadingFabrics}
              error={
                touched.products && 
                Array.isArray(touched.products) &&
                touched.products[index] && 
                touched.products[index]?.fabricId && 
                Boolean(errors.products && 
                Array.isArray(errors.products) &&
                errors.products[index] && 
                typeof errors.products[index] === 'object' &&
                'fabricId' in errors.products[index])
              }
              helperText={
                touched.products && 
                Array.isArray(touched.products) &&
                touched.products[index] && 
                touched.products[index]?.fabricId && 
                errors.products && 
                Array.isArray(errors.products) &&
                errors.products[index] && 
                typeof errors.products[index] === 'object' &&
                'fabricId' in errors.products[index] ?
                (errors.products[index] as any).fabricId : undefined
              }
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Field name={`products[${index}].quantity`}>
              {({ field, meta }: FieldProps) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Quantity"
                  type="number"
                  InputProps={{ 
                    inputProps: { min: 0 }
                  }}
                  error={meta.touched && Boolean(meta.error)}
                  helperText={meta.touched && meta.error}
                  required
                />
              )}
            </Field>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Field name={`products[${index}].price`}>
              {({ field, meta }: FieldProps) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Price"
                  type="number"
                  slotProps={{
                    input: {
                      startAdornment:<InputAdornment position="start">$</InputAdornment>,
                      inputProps: { step: 0.01 }
                    }
                  }}
                  error={meta.touched && Boolean(meta.error)}
                  helperText={meta.touched && meta.error}
                  required
                />
              )}
            </Field>
          </Grid>
          <Grid item xs={12}>
            <Field name={`products[${index}].description`}>
              {({ field, meta }: FieldProps) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Description (Optional)"
                  multiline
                  rows={2}
                  error={meta.touched && Boolean(meta.error)}
                  helperText={meta.touched && meta.error}
                />
              )}
            </Field>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Product Images (Optional)
            </Typography>
            
            {/* Display existing images if any */}
            {product.existingImages && product.existingImages.length > 0 && (
              <Box mb={2}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Existing Images:
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {product.existingImages.map((image, imgIndex) => (
                    <OrderImagePreview
                      key={`existing-${imgIndex}-${image.imageId}`}
                      imageId={image.imageId}
                      width={100}
                      height={100}
                      showDeleteButton={true}
                      onDelete={() => {
                        // Remove from imageIds
                        const updatedImageIds = [...(product.imageIds || [])];
                        const idIndex = updatedImageIds.indexOf(image.imageId);
                        if (idIndex !== -1) {
                          updatedImageIds.splice(idIndex, 1);
                        }
                        
                        // Remove from existingImages
                        const updatedExistingImages = [...(product.existingImages || [])];
                        updatedExistingImages.splice(imgIndex, 1);
                        
                        // Update the product
                        setFieldValue(`products[${index}].imageIds`, updatedImageIds);
                        setFieldValue(`products[${index}].existingImages`, updatedExistingImages);
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}
            
            {/* Upload new images */}
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {product.existingImages && product.existingImages.length > 0 ? 'Add New Images:' : 'Upload Images:'}
            </Typography>
            <OrderFileUpload
              onFileSelect={(files: File[]) => {
                setFieldValue(`products[${index}].tempImages`, files);
              }}
              selectedFiles={product.tempImages || []}
              onRemoveFile={(imgIndex) => {
                const tempImages = [...(product.tempImages || [])];
                tempImages.splice(imgIndex, 1);
                setFieldValue(`products[${index}].tempImages`, tempImages);
              }}
              accept="image/*"
              multiple
              maxFileSize={5} // 5MB max file size
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ProductFormItem;
