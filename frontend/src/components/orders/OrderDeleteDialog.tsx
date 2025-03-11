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
  Divider
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
    >
      <DialogTitle id="delete-order-dialog-title" sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center">
          <DeleteIcon color="error" sx={{ mr: 1 }} />
          <Typography variant="h6" component="span">
            Delete Order
          </Typography>
        </Box>
      </DialogTitle>
      
      <Divider />
      
      <DialogContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <WarningIcon color="warning" sx={{ fontSize: 40, mr: 2 }} />
          <DialogContentText>
            Are you sure you want to delete order <strong>#{orderNumber}</strong>
            {orderCustomerName && <> for <strong>{orderCustomerName}</strong></>}?
            This action cannot be undone.
          </DialogContentText>
        </Box>
        
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body2">
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
      
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={handleClose}
          color="inherit"
          disabled={isDeleting || loading}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          color="error"
          variant="contained"
          disabled={isDeleting || loading}
          startIcon={isDeleting ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
        >
          {isDeleting ? 'Deleting...' : 'Delete Order'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderDeleteDialog;
