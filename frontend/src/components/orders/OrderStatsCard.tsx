import React from 'react';
import { Card, CardContent, Typography, Box, Chip, useTheme, useMediaQuery } from '@mui/material';
import { ORDER_STATUS_COLORS } from '../../types/order';

interface OrderStatsCardProps {
  status: string;
  count: number;
  onClick?: () => void;
}

const OrderStatsCard: React.FC<OrderStatsCardProps> = ({ status, count, onClick }) => {
  const theme = useTheme();
  const isXsScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  const getStatusColor = (status: string): string => {
    return ORDER_STATUS_COLORS[status as keyof typeof ORDER_STATUS_COLORS] || '#757575';
  };

  const getStatusLabel = (status: string): string => {
    // Map backend status to display name
    switch (status) {
      case 'ORDER_CREATED': return isXsScreen ? 'Created' : 'Order Created';
      case 'APPROVED': return 'Approved';
      case 'BOOKING': return 'Booking';
      case 'PRODUCTION': return 'Production';
      case 'QA': return 'QA';
      case 'READY': return 'Ready';
      case 'DELIVERED': return 'Delivered';
      case 'RETURNED': return 'Returned';
      case 'CANCELLED': return 'Cancelled';
      // Legacy status mapping
      case 'CREATED': return isXsScreen ? 'Created' : 'Order Created';
      case 'IN_PROGRESS': return 'Production';
      case 'IN_QA': return 'QA';
      default: return status;
    }
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
          <Chip 
            label={getStatusLabel(status)}
            size="small"
            sx={{ 
              backgroundColor: getStatusColor(status),
              color: '#fff',
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
