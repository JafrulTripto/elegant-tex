import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Delete as DeleteIcon, Warning as WarningIcon } from '@mui/icons-material';

interface OrderDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  orderNumber: string | number;
  orderCustomerName?: string;
  loading?: boolean;
}

const OrderDeleteDialog: React.FC<OrderDeleteDialogProps> = ({
  open,
  onClose,
  onConfirm,
  orderNumber,
  orderCustomerName,
  loading = false
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    try {
      setError(null);
      setIsDeleting(true);
      await onConfirm();
      setIsDeleting(false);
      onClose();
    } catch (err) {
      setIsDeleting(false);
      setError(err instanceof Error ? err.message : 'Failed to delete order');
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="delete-order-dialog-title"
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          width: { xs: '95%', sm: '80%' },
          maxWidth: { xs: '95%', sm: 600 },
          m: { xs: 1, sm: 'auto' }
        }
      }}
    >
      <DialogTitle id="delete-order-dialog-title" sx={{ pb: 1, px: { xs: 2, sm: 3 } }}>
        <Box display="flex" alignItems="center">
          <DeleteIcon color="error" sx={{ mr: 1, fontSize: isMobile ? '1.25rem' : '1.5rem' }} />
          <Typography 
            variant="h6" 
            component="span"
            sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
          >
            Delete Order
          </Typography>
        </Box>
      </DialogTitle>
      
      <Divider />
      
      <DialogContent sx={{ px: { xs: 2, sm: 3 }, py: { xs: 1.5, sm: 2 } }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' }, 
          mb: 2,
          gap: { xs: 1, sm: 0 }
        }}>
          <WarningIcon 
            color="warning" 
            sx={{ 
              fontSize: { xs: 32, sm: 40 }, 
              mr: { xs: 0, sm: 2 },
              alignSelf: { xs: 'center', sm: 'flex-start' }
            }} 
          />
          <DialogContentText sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            Are you sure you want to delete order <strong>#{orderNumber}</strong>
            {orderCustomerName && <> for <strong>{orderCustomerName}</strong></>}?
            This action cannot be undone.
          </DialogContentText>
        </Box>
        
        <Alert severity="warning" sx={{ mb: 2, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
          <Typography variant="body2" sx={{ fontSize: 'inherit' }}>
            Deleting this order will permanently remove all associated data, including:
          </Typography>
          <ul style={{ marginTop: 4, marginBottom: 4, paddingLeft: 20 }}>
            <li>All order products and their details</li>
            <li>All uploaded images</li>
            <li>Order status history</li>
            <li>Customer information</li>
          </ul>
        </Alert>
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      
      <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: { xs: 1.5, sm: 2 }, flexWrap: 'wrap', gap: 1 }}>
        <Button
          onClick={handleClose}
          color="inherit"
          disabled={isDeleting || loading}
          size={isMobile ? "small" : "medium"}
          sx={{ minWidth: { xs: '80px', sm: '100px' } }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          color="error"
          variant="contained"
          disabled={isDeleting || loading}
          startIcon={isDeleting ? <CircularProgress size={isMobile ? 16 : 20} color="inherit" /> : <DeleteIcon />}
          size={isMobile ? "small" : "medium"}
          sx={{ minWidth: { xs: '120px', sm: '150px' } }}
        >
          {isDeleting ? 'Deleting...' : 'Delete Order'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderDeleteDialog;
