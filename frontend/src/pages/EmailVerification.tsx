import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  Stack,
} from '@mui/material';
import { MarkEmailRead as MarkEmailReadIcon, Psychology as PsychologyIcon } from '@mui/icons-material';
import authService from '../services/auth.service';
import { 
  AuthCard, 
  LogoAvatar, 
  LogoContainer, 
  SecondaryAvatar, 
  GradientButton 
} from '../components/common/StyledComponents';

const EmailVerification: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setError('Verification token is missing');
        setLoading(false);
        return;
      }

      try {
        const response = await authService.verifyEmail({ token });
        setSuccess(true);
        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Email verification failed');
        setLoading(false);
      }
    };

    verifyEmail();
  }, [token]);

  const handleNavigateToLogin = () => {
    navigate('/login');
  };

  const handleResendVerification = () => {
    navigate('/login', { state: { openResendVerification: true } });
  };

  return (
    <Container component="main" maxWidth="sm">
      <AuthCard elevation={3}>
        <LogoContainer>
          <LogoAvatar>
            <PsychologyIcon fontSize="large" />
          </LogoAvatar>
          <Typography 
            component="h1" 
            variant="h4"
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

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <SecondaryAvatar>
            <MarkEmailReadIcon />
          </SecondaryAvatar>
          <Typography component="h2" variant="h5">
            Email Verification
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4 }}>
            <CircularProgress size={60} />
            <Typography variant="body1" sx={{ mt: 2 }}>
              Verifying your email...
            </Typography>
          </Box>
        ) : success ? (
          <Box sx={{ width: '100%', textAlign: 'center' }}>
            <Alert severity="success" sx={{ mb: 3 }}>
              Your email has been successfully verified!
            </Alert>
            <Typography variant="body1" paragraph>
              Thank you for verifying your email address. You can now access all features of your account.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleNavigateToLogin}
              component={GradientButton}
              size="large"
            >
              Go to Login
            </Button>
          </Box>
        ) : (
          <Box sx={{ width: '100%', textAlign: 'center' }}>
            <Alert severity="error" sx={{ mb: 3 }}>
              {error || 'Verification failed'}
            </Alert>
            <Typography variant="body1" paragraph>
              We couldn't verify your email address. The verification link may have expired or is invalid.
            </Typography>
            <Stack direction="column" spacing={2} sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleResendVerification}
              >
                Resend Verification Email
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleNavigateToLogin}
                component={GradientButton}
              >
                Back to Login
              </Button>
            </Stack>
          </Box>
        )}
      </AuthCard>
    </Container>
  );
};

export default EmailVerification;
