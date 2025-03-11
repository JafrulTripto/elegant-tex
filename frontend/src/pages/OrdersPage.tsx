import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  Chip,
  Tooltip,
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterListIcon,
  FileDownload as FileDownloadIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { format } from 'date-fns';
import orderService from '../services/order.service';
import { Order, OrderStatus, OrderFilterParams, OrderStatusCount } from '../types/order';
import OrderStatsCard from '../components/orders/OrderStatsCard';
import { useAuth } from '../hooks/useAuth';
import OrderDeleteDialog from '../components/orders/OrderDeleteDialog';
import OrderFilterDialog from '../components/orders/OrderFilterDialog';

const OrdersPage: React.FC = () => {
  const { authState } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [orderBy, setOrderBy] = useState<string>('createdAt');
  const [orderDirection, setOrderDirection] = useState<'asc' | 'desc'>('desc');
  const [filterDialogOpen, setFilterDialogOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [filters, setFilters] = useState<OrderFilterParams>({});
  const [statusCounts, setStatusCounts] = useState<OrderStatusCount[]>([]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const sort = `${orderBy},${orderDirection}`;
      const response = await orderService.getOrdersByFilters({
        ...filters,
        page,
        size: rowsPerPage,
        sort
      });
      setOrders(response.content);
      setTotalItems(response.totalElements);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatusCounts = async () => {
    try {
      const counts = await orderService.getOrderStatusCounts();
      setStatusCounts(counts);
    } catch (error) {
      console.error('Error fetching status counts:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchStatusCounts();
  }, [page, rowsPerPage, orderBy, orderDirection, filters]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterApply = (newFilters: OrderFilterParams) => {
    setFilters(newFilters);
    setPage(0);
    setFilterDialogOpen(false);
  };

  const handleFilterClear = () => {
    setFilters({});
    setPage(0);
    setFilterDialogOpen(false);
  };

  const handleDeleteClick = (orderId: number) => {
    setSelectedOrderId(orderId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedOrderId) {
      try {
        await orderService.deleteOrder(selectedOrderId);
        fetchOrders();
        fetchStatusCounts();
      } catch (error) {
        console.error('Error deleting order:', error);
      }
    }
    setDeleteDialogOpen(false);
    setSelectedOrderId(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedOrderId(null);
  };

  const handleExportExcel = async () => {
    try {
      const blob = await orderService.generateOrdersExcel(
        filters.status as OrderStatus | undefined,
        filters.startDate,
        filters.endDate
      );
      
      orderService.downloadBlob(blob, 'orders.xlsx');
    } catch (error) {
      console.error('Error exporting orders to Excel:', error);
    }
  };

  const getStatusChipColor = (status: OrderStatus) => {
    switch (status) {
      case 'Created':
        return 'default';
      case 'In Progress':
        return 'primary';
      case 'In QA':
        return 'warning';
      case 'Delivered':
        return 'success';
      case 'Returned':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h4" component="h1" gutterBottom>
                Orders
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<FilterListIcon />}
                  onClick={() => setFilterDialogOpen(true)}
                >
                  Filter
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<FileDownloadIcon />}
                  onClick={handleExportExcel}
                >
                  Export to Excel
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  component={RouterLink}
                  to="/orders/new"
                >
                  New Order
                </Button>
              </Stack>
            </Box>
          </Grid>

          {/* Status Cards */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              {statusCounts.map((statusCount) => (
                <Grid item xs={12} sm={6} md={2.4} key={statusCount.status}>
                  <OrderStatsCard
                    status={statusCount.status}
                    count={statusCount.count}
                    onClick={() => setFilters({ ...filters, status: statusCount.status as OrderStatus })}
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Orders Table */}
          <Grid item xs={12}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Marketplace</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Delivery Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created At</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No orders found
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>{order.id}</TableCell>
                        <TableCell>{order.marketplace.name}</TableCell>
                        <TableCell>{order.customerName}</TableCell>
                        <TableCell>
                          {format(new Date(order.deliveryDate), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={order.status}
                            color={getStatusChipColor(order.status as OrderStatus) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          <Tooltip title="View">
                            <IconButton
                              component={RouterLink}
                              to={`/orders/${order.id}`}
                              size="small"
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {authState.user?.roles?.includes('ORDER_UPDATE') && (
                            <Tooltip title="Edit">
                              <IconButton
                                component={RouterLink}
                                to={`/orders/${order.id}/edit`}
                                size="small"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {authState.user?.roles?.includes('ORDER_DELETE') && (
                            <Tooltip title="Delete">
                              <IconButton
                                onClick={() => handleDeleteClick(order.id)}
                                size="small"
                                color="error"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={totalItems}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </TableContainer>
          </Grid>
        </Grid>
      </Box>

      <OrderFilterDialog
        open={filterDialogOpen}
        onClose={() => setFilterDialogOpen(false)}
        onApplyFilter={handleFilterApply}
        marketplaces={[]}
        currentFilters={filters}
      />

      <OrderDeleteDialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={async () => await handleDeleteConfirm()}
        orderNumber={selectedOrderId || ''}
      />
    </Container>
  );
};

export default OrdersPage;
