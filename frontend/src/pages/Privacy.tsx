// src/pages/PrivacyPolicy.tsx

import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const PrivacyPolicy: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Box>
        <Typography variant="h4" gutterBottom>
          Privacy Policy
        </Typography>

        <Typography variant="body1">
          Your privacy is important to us. This application only collects and processes data necessary to provide messaging and communication features.
        </Typography>

        <Typography variant="body1">
          We do not share your data with third parties. Any information collected is used solely for improving your experience.
        </Typography>

        <Typography variant="body1">
          By using this application, you agree to this policy. If you have any questions or concerns, please contact us.
        </Typography>
      </Box>
    </Container>
  );
};

export default PrivacyPolicy;
