import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  Facebook as FacebookIcon,
  WhatsApp as WhatsAppIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { MessagingAccountRequestDTO } from '../../../types/messaging';
import { messagingService } from '../../../services/messaging.service';

interface EnhancedAccountSetupDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const steps = ['Platform Selection', 'Account Details', 'Token Validation', 'Webhook Setup'];

const EnhancedAccountSetupDialog: React.FC<EnhancedAccountSetupDialogProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
  const [selectedPlatform, setSelectedPlatform] = useState<'FACEBOOK' | 'WHATSAPP' | null>(null);
  
  const [formData, setFormData] = useState<MessagingAccountRequestDTO>({
    accountName: '',
    platform: 'FACEBOOK',
    pageId: '',
    phoneNumberId: '',
    businessAccountId: '',
    accessToken: '',
    webhookVerifyToken: ''
  });

  const handleNext = () => {
    if (activeStep === 0 && selectedPlatform) {
      setFormData(prev => ({ ...prev, platform: selectedPlatform }));
      setActiveStep(prev => prev + 1);
    } else if (activeStep === 1) {
      validateToken();
    } else if (activeStep === 2 && validationStatus === 'valid') {
      setActiveStep(prev => prev + 1);
    } else if (activeStep === 3) {
      createAccount();
    } else {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    setError(null);
    setValidationStatus('idle');
  };

  const handleClose = () => {
    setActiveStep(0);
    setSelectedPlatform(null);
    setFormData({
      accountName: '',
      platform: 'FACEBOOK',
      pageId: '',
      phoneNumberId: '',
      businessAccountId: '',
      accessToken: '',
      webhookVerifyToken: ''
    });
    setError(null);
    setValidationStatus('idle');
    onClose();
  };

  const validateToken = async () => {
    setValidationStatus('validating');
    setError(null);

    try {
      let isValid = false;
      
      if (formData.platform === 'FACEBOOK' && formData.pageId && formData.accessToken) {
        isValid = await messagingService.validateFacebookToken(formData.pageId, formData.accessToken);
      } else if (formData.platform === 'WHATSAPP' && formData.phoneNumberId && formData.accessToken) {
        isValid = await messagingService.validateWhatsAppToken(formData.phoneNumberId, formData.accessToken);
      }

      if (isValid) {
        setValidationStatus('valid');
        setActiveStep(prev => prev + 1);
      } else {
        setValidationStatus('invalid');
        setError('Invalid access token or account credentials. Please check your configuration.');
      }
    } catch (err) {
      setValidationStatus('invalid');
      setError('Failed to validate token. Please try again.');
    }
  };

  const createAccount = async () => {
    setLoading(true);
    setError(null);

    try {
      await messagingService.createAccount(formData);
      onSuccess();
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateWebhookToken = () => {
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setFormData(prev => ({ ...prev, webhookVerifyToken: token }));
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 0:
        return selectedPlatform !== null;
      case 1:
        if (formData.platform === 'FACEBOOK') {
          return formData.accountName && formData.pageId && formData.accessToken;
        } else {
          return formData.accountName && formData.phoneNumberId && formData.businessAccountId && formData.accessToken;
        }
      case 2:
        return validationStatus === 'valid';
      case 3:
        return formData.webhookVerifyToken;
      default:
        return false;
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ py: 3 }}>
            <Typography variant="h6" gutterBottom align="center" sx={{ mb: 3 }}>
              Choose Your Platform
            </Typography>
            
            <ToggleButtonGroup
              value={selectedPlatform}
              exclusive
              onChange={(_, value) => setSelectedPlatform(value)}
              sx={{ 
                display: 'flex', 
                justifyContent: 'center',
                gap: 2,
                '& .MuiToggleButton-root': {
                  border: '2px solid',
                  borderRadius: 2,
                  p: 3,
                  minWidth: 200,
                  flexDirection: 'column',
                  gap: 2,
                }
              }}
            >
              <ToggleButton 
                value="FACEBOOK"
                sx={{
                  borderColor: '#1877F2',
                  '&.Mui-selected': {
                    backgroundColor: '#1877F215',
                    borderColor: '#1877F2',
                  }
                }}
              >
                <FacebookIcon sx={{ fontSize: 48, color: '#1877F2' }} />
                <Typography variant="h6">Facebook Messenger</Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  Connect your Facebook Page to receive messages from customers
                </Typography>
              </ToggleButton>
              
              <ToggleButton 
                value="WHATSAPP"
                sx={{
                  borderColor: '#25D366',
                  '&.Mui-selected': {
                    backgroundColor: '#25D36615',
                    borderColor: '#25D366',
                  }
                }}
              >
                <WhatsAppIcon sx={{ fontSize: 48, color: '#25D366' }} />
                <Typography variant="h6">WhatsApp Business</Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  Connect your WhatsApp Business account for customer support
                </Typography>
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              {formData.platform === 'FACEBOOK' ? (
                <FacebookIcon sx={{ color: '#1877F2' }} />
              ) : (
                <WhatsAppIcon sx={{ color: '#25D366' }} />
              )}
              <Typography variant="h6">
                {formData.platform === 'FACEBOOK' ? 'Facebook Messenger' : 'WhatsApp Business'} Setup
              </Typography>
            </Box>

            <TextField
              fullWidth
              label="Account Name"
              value={formData.accountName}
              onChange={(e) => setFormData(prev => ({ ...prev, accountName: e.target.value }))}
              margin="normal"
              helperText="A friendly name to identify this account"
            />

            {formData.platform === 'FACEBOOK' ? (
              <>
                <TextField
                  fullWidth
                  label="Page ID"
                  value={formData.pageId}
                  onChange={(e) => setFormData(prev => ({ ...prev, pageId: e.target.value }))}
                  margin="normal"
                  helperText="Your Facebook Page ID"
                />
                <TextField
                  fullWidth
                  label="Page Access Token"
                  value={formData.accessToken}
                  onChange={(e) => setFormData(prev => ({ ...prev, accessToken: e.target.value }))}
                  margin="normal"
                  type="password"
                  helperText="Long-lived page access token from Facebook Developer Console"
                />
              </>
            ) : (
              <>
                <TextField
                  fullWidth
                  label="Phone Number ID"
                  value={formData.phoneNumberId}
                  onChange={(e) => setFormData(prev => ({ ...prev, phoneNumberId: e.target.value }))}
                  margin="normal"
                  helperText="WhatsApp Business phone number ID"
                />
                <TextField
                  fullWidth
                  label="Business Account ID"
                  value={formData.businessAccountId}
                  onChange={(e) => setFormData(prev => ({ ...prev, businessAccountId: e.target.value }))}
                  margin="normal"
                  helperText="WhatsApp Business Account ID"
                />
                <TextField
                  fullWidth
                  label="Access Token"
                  value={formData.accessToken}
                  onChange={(e) => setFormData(prev => ({ ...prev, accessToken: e.target.value }))}
                  margin="normal"
                  type="password"
                  helperText="Permanent access token from Meta Business"
                />
              </>
            )}

            <Box sx={{ mt: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
              <Typography variant="body2" color="info.contrastText">
                <strong>Need help?</strong> Check our documentation for step-by-step instructions on obtaining these credentials.
              </Typography>
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ py: 3, textAlign: 'center' }}>
            {validationStatus === 'validating' && (
              <>
                <CircularProgress sx={{ mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Validating Credentials
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Please wait while we verify your access token...
                </Typography>
              </>
            )}

            {validationStatus === 'valid' && (
              <>
                <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom color="success.main">
                  Credentials Validated Successfully
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Your {formData.platform === 'FACEBOOK' ? 'Facebook Page' : 'WhatsApp Business'} credentials are valid and ready to use.
                </Typography>
              </>
            )}

            {validationStatus === 'invalid' && (
              <>
                <ErrorIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom color="error.main">
                  Validation Failed
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Please check your credentials and try again.
                </Typography>
              </>
            )}
          </Box>
        );

      case 3:
        return (
          <Box sx={{ py: 2 }}>
            <Typography variant="h6" gutterBottom>
              Webhook Configuration
            </Typography>
            
            <TextField
              fullWidth
              label="Webhook Verify Token"
              value={formData.webhookVerifyToken}
              onChange={(e) => setFormData(prev => ({ ...prev, webhookVerifyToken: e.target.value }))}
              margin="normal"
              InputProps={{
                endAdornment: (
                  <Button size="small" onClick={generateWebhookToken}>
                    Generate
                  </Button>
                )
              }}
              helperText="Token used to verify webhook requests"
            />

            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Webhook URL Configuration
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Configure your webhook URL in the {formData.platform === 'FACEBOOK' ? 'Facebook Developer Console' : 'Meta Business Manager'}:
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Webhook URL:
                </Typography>
                <Chip
                  label={`${window.location.origin}/webhooks/${formData.platform.toLowerCase()}`}
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Verify Token:
                </Typography>
                <Chip
                  label={formData.webhookVerifyToken || 'Generate token above'}
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Box>

              <Typography variant="body2" color="text.secondary">
                Subscribe to: messages, messaging_postbacks, messaging_optins, message_deliveries, message_reads
              </Typography>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          {selectedPlatform === 'FACEBOOK' ? (
            <FacebookIcon color="primary" />
          ) : selectedPlatform === 'WHATSAPP' ? (
            <WhatsAppIcon sx={{ color: '#25D366' }} />
          ) : null}
          Add Messaging Account
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {renderStepContent(activeStep)}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>
          Cancel
        </Button>
        {activeStep > 0 && (
          <Button onClick={handleBack} disabled={loading}>
            Back
          </Button>
        )}
        <Button
          onClick={handleNext}
          variant="contained"
          disabled={!isStepValid(activeStep) || loading || validationStatus === 'validating'}
        >
          {loading ? (
            <CircularProgress size={20} />
          ) : activeStep === steps.length - 1 ? (
            'Create Account'
          ) : activeStep === 1 ? (
            'Validate & Continue'
          ) : (
            'Next'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EnhancedAccountSetupDialog;
