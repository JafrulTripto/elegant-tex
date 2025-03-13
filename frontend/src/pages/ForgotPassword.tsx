import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  TextField,
  Link,
  Grid,
  Box,
  Typography,
  Container,
  Alert,
} from '@mui/material';
import { LockReset as LockResetIcon } from '@mui/icons-material';
import authService from '../services/auth.service';
import { AuthCard, LogoAvatar, GradientButton } from '../components/common/StyledComponents';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      const response = await authService.forgotPassword({ email });
      setSuccess(response.message);
      setEmail('');
    } catch (err: any) {
      setError(err.message || err.response?.data?.message || 'Failed to process request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <AuthCard elevation={3}>
        <LogoAvatar>
          <LockResetIcon />
        </LogoAvatar>
        <Typography component="h1" variant="h5">
          Forgot Password
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mt: 2, width: '100%' }}>
            {success}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting || !!success}
          />
          <GradientButton
            type="submit"
            fullWidth
            variant="contained"
            disabled={isSubmitting || !!success}
          >
            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
          </GradientButton>
          <Grid container>
            <Grid item xs>
              <Link component={RouterLink} to="/login" variant="body2">
                Back to login
              </Link>
            </Grid>
            <Grid item>
              <Link component={RouterLink} to="/register" variant="body2">
                {"Don't have an account? Sign Up"}
              </Link>
            </Grid>
          </Grid>
        </Box>
      </AuthCard>
    </Container>
  );
};

export default ForgotPassword;
