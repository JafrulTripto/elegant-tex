import React from 'react';
import {
  ToggleButtonGroup,
  ToggleButton,
  useTheme,
  useMediaQuery,
  Box,
  Typography
} from '@mui/material';
import { Store as MarketplaceIcon, Business as MerchantIcon, ViewList as AllIcon } from '@mui/icons-material';
import { useOrderType, OrderType } from '../../contexts/OrderTypeContext';

const GlobalOrderTypeToggle: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { currentOrderType, setOrderType } = useOrderType();

  const handleChange = (
    _: React.MouseEvent<HTMLElement>,
    newOrderType: OrderType | null
  ) => {
    if (newOrderType !== null) {
      setOrderType(newOrderType);
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {!isMobile && (
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}
        >
          Order Type:
        </Typography>
      )}
      <ToggleButtonGroup
        value={currentOrderType}
        exclusive
        onChange={handleChange}
        size="small"
        aria-label="Order type selection"
        sx={{ 
          '& .MuiToggleButton-root': {
            py: 0.5,
            px: isMobile ? 1 : 1.5,
            fontSize: isMobile ? '0.7rem' : '0.75rem',
            textTransform: 'none',
            border: `1px solid ${theme.palette.divider}`,
            '&.Mui-selected': {
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              }
            },
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            }
          }
        }}
      >
        <ToggleButton
          value="marketplace"
          aria-label="Marketplace orders"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5
          }}
        >
          <MarketplaceIcon sx={{ fontSize: '0.9rem' }} />
          {isMobile ? 'Market' : 'Marketplace'}
        </ToggleButton>
        <ToggleButton
          value="merchant"
          aria-label="Merchant orders"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5
          }}
        >
          <MerchantIcon sx={{ fontSize: '0.9rem' }} />
          Merchant
        </ToggleButton>
        <ToggleButton
          value="all"
          aria-label="All orders"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5
          }}
        >
          <AllIcon sx={{ fontSize: '0.9rem' }} />
          All
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};

export default GlobalOrderTypeToggle;
