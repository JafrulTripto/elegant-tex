import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Box,
  Typography
} from '@mui/material';
import authService from '../../services/auth.service';
import { AccentButton } from './StyledComponents';
import { useToast } from '../../contexts/ToastContext';

interface ResendVerificationDialogProps {
  open: boolean;
  onClose: () => void;
}

const ResendVerificationDialog: React.FC<ResendVerificationDialogProps> = ({ open, onClose }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Email is required');
      showToast('Email is required', 'error');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      showToast('Please enter a valid email address', 'error');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await authService.resendVerification({ email });
      setSuccess(true);
      setEmail('');
      showToast('Verification email has been sent successfully!', 'success');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to resend verification email';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setError(null);
    setSuccess(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Resend Verification Email</DialogTitle>
      <DialogContent>
        {success ? (
          <Box sx={{ my: 2, textAlign: 'center' }}>
            <Alert severity="success" sx={{ mb: 2 }}>
              Verification email has been sent successfully!
            </Alert>
            <Typography variant="body1">
              Please check your email inbox and follow the instructions to verify your account.
            </Typography>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Typography variant="body1" sx={{ mb: 2 }}>
              Enter your email address below to receive a new verification link.
            </Typography>
            <TextField
              margin="dense"
              label="Email Address"
              type="email"
              fullWidth
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
              autoFocus
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        {success ? (
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        ) : (
          <>
            <Button onClick={handleClose} color="inherit" disabled={loading}>
              Cancel
            </Button>
            <AccentButton 
              onClick={handleSubmit} 
              color="primary" 
              variant="contained" 
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Sending...' : 'Send Verification Email'}
            </AccentButton>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ResendVerificationDialog;
