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
  CircularProgress,
  Typography,
  Avatar
} from '@mui/material';
import { Style as StyleIcon } from '@mui/icons-material';
import { Formik, Form, Field, FieldProps } from 'formik';
import * as Yup from 'yup';
import { StyleCode, StyleCodeFormData } from '../../types/styleCode';

interface StyleCodeFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (styleCode: StyleCodeFormData) => Promise<void>;
  initialValues?: StyleCode;
  title: string;
}

const validationSchema = Yup.object().shape({
  code: Yup.string()
    .required('Code is required')
    .max(50, 'Code must be at most 50 characters')
    .matches(/^[A-Z0-9-_]+$/, 'Code must contain only uppercase letters, numbers, hyphens, and underscores'),
  name: Yup.string()
    .required('Name is required')
    .max(255, 'Name must be at most 255 characters'),
  active: Yup.boolean().required('Active status is required')
});

const StyleCodeForm: React.FC<StyleCodeFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialValues,
  title
}) => {
  const [formValues, setFormValues] = useState<StyleCodeFormData>({
    code: '',
    name: '',
    active: true
  });

  useEffect(() => {
    if (initialValues) {
      setFormValues({
        code: initialValues.code,
        name: initialValues.name,
        active: initialValues.active
      });
    } else {
      setFormValues({
        code: '',
        name: '',
        active: true
      });
    }
  }, [initialValues, open]);

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: 24
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <StyleIcon />
          </Avatar>
          <Typography variant="h6">
            {title}
          </Typography>
        </Box>
      </DialogTitle>
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
            <DialogContent dividers>
              <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Field name="code">
                  {({ field }: FieldProps) => (
                    <FormControl error={touched.code && Boolean(errors.code)}>
                      <TextField
                        {...field}
                        label="Code"
                        variant="outlined"
                        fullWidth
                        error={touched.code && Boolean(errors.code)}
                        helperText={touched.code && errors.code}
                        required
                        placeholder="e.g., STYLE-001"
                        disabled={!!initialValues}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 1,
                            transition: 'all 0.3s ease'
                          }
                        }}
                      />
                    </FormControl>
                  )}
                </Field>

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
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 1,
                            transition: 'all 0.3s ease'
                          }
                        }}
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
            <DialogActions sx={{ px: 3, py: 2 }}>
              <Button 
                onClick={onClose} 
                color="inherit"
                variant="outlined"
              >
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

export default StyleCodeForm;
