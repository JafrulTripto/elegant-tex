import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import {
  TextField,
  FormControlLabel,
  Checkbox,
  Link,
  Grid,
  Box,
  Typography,
  Container,
  Alert,
  Stack,
  useTheme,
} from '@mui/material';
import { Psychology as PsychologyIcon } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import ResendVerificationDialog from '../components/common/ResendVerificationDialog';
import { AuthCard, LogoAvatar, LogoContainer, GradientButton } from '../components/common/StyledComponents';

const Login: React.FC = () => {
  const { login, authState } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openResendVerification, setOpenResendVerification] = useState(false);
  
  // Get the redirect path from location state or default to dashboard
  const from = (location.state as any)?.from?.pathname || '/dashboard';
  
  // Check if we should open the resend verification dialog
  useEffect(() => {
    if (location.state && (location.state as any).openResendVerification) {
      setOpenResendVerification(true);
    }
  }, [location.state]);
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      setError('Username and password are required');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      await login(username, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || err.response?.data?.message || 'Failed to login. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenResendVerification = () => {
    setOpenResendVerification(true);
  };

  const handleCloseResendVerification = () => {
    setOpenResendVerification(false);
    // Clear the state so if the user navigates away and back, it doesn't reopen
    navigate(location.pathname, { replace: true });
  };
  
  return (
    <Container component="main" maxWidth="xs">
        <AuthCard elevation={3} className="techminds-card">
        <LogoContainer className="techminds-logo-container">
          <LogoAvatar>
            <PsychologyIcon fontSize="large" />
          </LogoAvatar>
          <Typography 
            component="h1" 
            variant="h4"
            className="techminds-gradient-text"
            sx={{ 
              fontWeight: 'bold'
            }}
          >
            TechMinds
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" align="center">
            Empowering Technical Excellence
          </Typography>
        </LogoContainer>
        
        <Typography component="h2" variant="h5" sx={{ mb: 2 }}>
          Sign in to your account
        </Typography>
        
        {(error || authState.error) && (
          <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
            {error || authState.error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isSubmitting}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
          />
          <FormControlLabel
            control={
              <Checkbox
                value="remember"
                color="primary"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isSubmitting}
              />
            }
            label="Remember me"
          />
          <GradientButton
            type="submit"
            fullWidth
            variant="contained"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </GradientButton>
          <Grid container>
            <Grid item xs>
              <Link component={RouterLink} to="/forgot-password" variant="body2">
                Forgot password?
              </Link>
            </Grid>
            <Grid item>
              <Link component={RouterLink} to="/register" variant="body2">
                {"Don't have an account? Sign Up"}
              </Link>
            </Grid>
          </Grid>
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Link 
              component="button" 
              variant="body2" 
              onClick={handleOpenResendVerification}
              sx={{ textDecoration: 'none' }}
            >
              Need to verify your email?
            </Link>
          </Box>
        </Box>
      </AuthCard>

      {/* Resend Verification Dialog */}
      <ResendVerificationDialog 
        open={openResendVerification} 
        onClose={handleCloseResendVerification} 
      />
    </Container>
  );
};

export default Login;
