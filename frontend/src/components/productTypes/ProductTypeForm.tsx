import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Switch,
  TextField,
  CircularProgress
} from '@mui/material';
import { Formik, Form, Field, FieldProps } from 'formik';
import * as Yup from 'yup';
import { ProductType, ProductTypeFormData } from '../../types/productType';

interface ProductTypeFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (productType: ProductTypeFormData) => Promise<void>;
  initialValues?: ProductType;
  title: string;
}

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .required('Name is required')
    .max(255, 'Name must be at most 255 characters'),
  active: Yup.boolean().required('Active status is required')
});

const ProductTypeForm: React.FC<ProductTypeFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialValues,
  title
}) => {
  const [formValues, setFormValues] = useState<ProductTypeFormData>({
    name: '',
    active: true
  });

  useEffect(() => {
    if (initialValues) {
      setFormValues({
        name: initialValues.name,
        active: initialValues.active
      });
    } else {
      setFormValues({
        name: '',
        active: true
      });
    }
  }, [initialValues, open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <Formik
        initialValues={formValues}
        validationSchema={validationSchema}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            await onSubmit(values);
            onClose();
          } catch (error) {
            console.error('Error submitting form:', error);
          } finally {
            setSubmitting(false);
          }
        }}
        enableReinitialize
      >
        {({ isSubmitting, errors, touched }) => (
          <Form>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Field name="name">
                  {({ field }: FieldProps) => (
                    <FormControl error={touched.name && Boolean(errors.name)}>
                      <TextField
                        {...field}
                        label="Name"
                        variant="outlined"
                        fullWidth
                        error={touched.name && Boolean(errors.name)}
                        helperText={touched.name && errors.name}
                        required
                      />
                    </FormControl>
                  )}
                </Field>

                <Field name="active">
                  {({ field }: FieldProps) => (
                    <FormControl error={touched.active && Boolean(errors.active)}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={field.value}
                            onChange={field.onChange}
                            name={field.name}
                            color="primary"
                          />
                        }
                        label="Active"
                      />
                      {touched.active && errors.active && (
                        <FormHelperText error>{errors.active}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                </Field>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={onClose} color="inherit">
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
              >
                {isSubmitting ? 'Saving...' : 'Save'}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default ProductTypeForm;
