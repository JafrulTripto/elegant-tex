import React, { memo } from 'react';
import {
  Alert,
  Box,
  Button,
  Divider,
  Paper,
  Typography
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { OrderProductFormData } from '../../../types/order';
import { ProductType } from '../../../types/productType';
import { Fabric } from '../../../types/fabric';
import { StyleCode } from '../../../types/styleCode';
import ProductFormItem from './ProductFormItem';

interface ProductFormSectionProps {
  products: OrderProductFormData[];
  productTypes: ProductType[];
  fabrics: Fabric[];
  styleCodes: StyleCode[];
  handleFabricListScroll: (event: React.UIEvent<HTMLUListElement>) => void;
  loadingFabrics: boolean;
  touched: any;
  errors: any;
  setFieldValue: (field: string, value: any) => void;
  createEmptyProduct: () => OrderProductFormData;
}

const ProductFormSection: React.FC<ProductFormSectionProps> = memo(({
  products,
  productTypes,
  fabrics,
  styleCodes,
  handleFabricListScroll,
  loadingFabrics,
  touched,
  errors,
  setFieldValue,
  createEmptyProduct
}) => {
  return (
    <Paper sx={{ p: 2.5 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
        <Typography variant="subtitle1" fontWeight={600}>Products</Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => {
            const updatedProducts = [...products, createEmptyProduct()];
            setFieldValue('products', updatedProducts);
          }}
        >
          Add Product
        </Button>
      </Box>
      <Divider sx={{ mb: 2 }} />

      {products.map((product, index) => (
        <ProductFormItem
          key={index}
          product={product}
          index={index}
          productTypes={productTypes}
          fabrics={fabrics}
          styleCodes={styleCodes}
          handleFabricListScroll={handleFabricListScroll}
          loadingFabrics={loadingFabrics}
          canDelete={products.length > 1}
          onDelete={() => {
            const updatedProducts = [...products];
            updatedProducts.splice(index, 1);
            setFieldValue('products', updatedProducts.length ? updatedProducts : [createEmptyProduct()]);
          }}
          touched={touched}
          errors={errors}
          setFieldValue={setFieldValue}
        />
      ))}

      {errors.products && typeof errors.products === 'string' && (
        <Alert severity="error" sx={{ mt: 1, mb: 2 }}>
          {errors.products}
        </Alert>
      )}
    </Paper>
  );
});

export default ProductFormSection;
