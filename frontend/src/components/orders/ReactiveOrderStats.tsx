import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Avatar,
  Typography,
  Box,
  CircularProgress
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  ShoppingCart as ShoppingCartIcon,
  AttachMoney as AttachMoneyIcon,
  LocalShipping as LocalShippingIcon,
} from '@mui/icons-material';
import { useTimeline } from '../../contexts/TimelineContext';
import { useOrderType } from '../../contexts/OrderTypeContext';
import { useBusinessUnit } from '../../contexts/BusinessUnitContext';
import orderService from '../../services/order.service';
import TakaSymble from '../common/TakaSymble';

interface OrderStatistics {
  totalOrders: number;
  totalSales: number;
  deliveredOrders: number;
}

const ReactiveOrderStats: React.FC = () => {
  const { currentRange } = useTimeline();
  const { currentOrderType } = useOrderType();
  const { selectedBusinessUnit } = useBusinessUnit();
  const [stats, setStats] = useState<OrderStatistics>({ totalOrders: 0, totalSales: 0, deliveredOrders: 0 });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchOrderStatistics();
  }, [currentRange, currentOrderType, selectedBusinessUnit]);

  const fetchOrderStatistics = async () => {
    try {
      setLoading(true);
      // Convert dates to ISO string format for API
      const startDate = currentRange.startDate.toISOString().split('T')[0];
      const endDate = currentRange.endDate.toISOString().split('T')[0];
      
      // Fetch filtered order statistics
      const data = await orderService.getOrderStatisticsByDateRange(
        startDate,
        endDate,
        currentOrderType,
        selectedBusinessUnit || undefined
      );
      
      setStats({
        totalOrders: data.totalOrders || 0,
        totalSales: data.totalSales || 0,
        deliveredOrders: data.deliveredOrders || 0
      });
      
      setLoading(false);
    } catch (err: any) {
      setStats({ totalOrders: 0, totalSales: 0, deliveredOrders: 0 });
      setLoading(false);
    }
  };

  return (
    <>
      {/* Total Orders Card */}
      <Grid size={{ xs: 12, md: 3 }}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                {loading ? (
                  <CircularProgress size={24} />
                ) : (
                  <>
                    <Typography variant="h4" component="div" fontWeight="bold">
                      {stats.totalOrders}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Orders
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                      {currentRange.label} • {currentOrderType === 'all' ? 'All Orders' : 
                       currentOrderType === 'marketplace' ? 'Marketplace' : 'Merchant'}
                      {selectedBusinessUnit && ` • ${selectedBusinessUnit}`}
                    </Typography>
                  </>
                )}
              </Box>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <ShoppingCartIcon />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Total Sales Card */}
      <Grid size={{ xs: 12, md: 3 }}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                {loading ? (
                  <CircularProgress size={24} />
                ) : (
                  <>
                    <Typography variant="h4" component="div" fontWeight="bold">
                      <TakaSymble/> {stats.totalSales.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Sales
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                      {currentRange.label} • {currentOrderType === 'all' ? 'All Orders' : 
                       currentOrderType === 'marketplace' ? 'Marketplace' : 'Merchant'}
                      {selectedBusinessUnit && ` • ${selectedBusinessUnit}`}
                    </Typography>
                  </>
                )}
              </Box>
              <Avatar sx={{ bgcolor: 'success.main' }}>
                <AttachMoneyIcon />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Delivered Orders Card */}
      <Grid size={{ xs: 12, md: 3 }}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                {loading ? (
                  <CircularProgress size={24} />
                ) : (
                  <>
                    <Typography variant="h4" component="div" fontWeight="bold">
                      {stats.deliveredOrders}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Delivered Orders
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                      {currentRange.label} • {currentOrderType === 'all' ? 'All Orders' : 
                       currentOrderType === 'marketplace' ? 'Marketplace' : 'Merchant'}
                      {selectedBusinessUnit && ` • ${selectedBusinessUnit}`}
                    </Typography>
                  </>
                )}
              </Box>
              <Avatar sx={{ bgcolor: 'info.main' }}>
                <LocalShippingIcon />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </>
  );
};

export default ReactiveOrderStats;
