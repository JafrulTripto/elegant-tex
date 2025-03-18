import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { ORDER_STATUS_COLORS } from '../../types/order';

interface OrderStatsCardProps {
  status: string;
  count: number;
  onClick?: () => void;
}

const OrderStatsCard: React.FC<OrderStatsCardProps> = ({ status, count, onClick }) => {
  const getStatusColor = (status: string): string => {
    return ORDER_STATUS_COLORS[status as keyof typeof ORDER_STATUS_COLORS] || '#757575';
  };

  const getStatusLabel = (status: string): string => {
    // Map backend status to display name
    switch (status) {
      case 'ORDER_CREATED': return 'Order Created';
      case 'APPROVED': return 'Approved';
      case 'BOOKING': return 'Booking';
      case 'PRODUCTION': return 'Production';
      case 'QA': return 'QA';
      case 'READY': return 'Ready';
      case 'DELIVERED': return 'Delivered';
      case 'RETURNED': return 'Returned';
      case 'CANCELLED': return 'Cancelled';
      // Legacy status mapping
      case 'CREATED': return 'Order Created';
      case 'IN_PROGRESS': return 'Production';
      case 'IN_QA': return 'QA';
      default: return status;
    }
  };

  return (
    <Card 
      sx={{ 
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: 3
        } : {}
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" component="div" fontWeight="bold">
              {count}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Orders
            </Typography>
          </Box>
          <Chip 
            label={getStatusLabel(status)}
            sx={{ 
              backgroundColor: getStatusColor(status),
              color: '#fff',
              fontWeight: 'bold'
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default OrderStatsCard;
