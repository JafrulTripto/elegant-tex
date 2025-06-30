import React from 'react';
import { Card, CardContent, Typography, Box, useTheme, useMediaQuery } from '@mui/material';
import StatusChip from '../common/StatusChip';
import { getDisplayStatus } from '../../utils/statusConfig';

interface OrderStatsCardProps {
  status: string;
  count: number;
  onClick?: () => void;
}

const OrderStatsCard: React.FC<OrderStatsCardProps> = ({ status, count, onClick }) => {
  const theme = useTheme();
  const isXsScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Get a shortened display label for small screens if needed
  const getStatusLabel = (status: string): string => {
    const displayStatus = getDisplayStatus(status);
    
    // For small screens, shorten "Order Created" to just "Created"
    if (isXsScreen && displayStatus === 'Order Created') {
      return 'Created';
    }
    
    return displayStatus;
  };

  return (
    <Card 
      sx={{ 
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.15s, box-shadow 0.15s',
        height: '100%',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        '&:hover': onClick ? {
          transform: 'translateY(-2px)',
          boxShadow: '0 2px 5px rgba(0,0,0,0.15)'
        } : {}
      }}
      onClick={onClick}
    >
      <CardContent sx={{ 
        p: { xs: 1, sm: 1.25 }, 
        height: '100%',
        '&:last-child': { pb: { xs: 1, sm: 1.25 } }
      }}>
        <Box 
          display="flex" 
          flexDirection={{ xs: 'column', sm: 'row' }}
          justifyContent={{ xs: 'center', sm: 'space-between' }}
          alignItems={{ xs: 'center', sm: 'center' }}
          height="100%"
          gap={{ xs: 0.5, sm: 0 }}
        >
          <Box textAlign={{ xs: 'center', sm: 'left' }}>
            <Typography 
              variant="h4" 
              component="div" 
              fontWeight="bold"
              sx={{ 
                fontSize: { xs: '1.2rem', sm: '1.35rem' },
                lineHeight: 1.1,
                mb: 0.25
              }}
            >
              {count}
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' } }}
            >
              Orders
            </Typography>
          </Box>
          <StatusChip 
            status={status}
            customLabel={getStatusLabel(status)}
            isOrderStatus={true}
            size="small"
            sx={{ 
              fontWeight: 'medium',
              fontSize: { xs: '0.6rem', sm: '0.65rem' },
              height: { xs: 18, sm: 20 },
              '& .MuiChip-label': {
                px: { xs: 0.5, sm: 0.75 },
                py: 0.25
              }
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default OrderStatsCard;
