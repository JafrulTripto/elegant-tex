import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  IconButton,
  Paper,
  Typography,
  Chip,
  Tooltip,
  Stack,
  Snackbar,
  Alert
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { 
  DataGrid, 
  GridColDef,
  GridRenderCellParams,
  GridSortModel,
  GridCallbackDetails,
  GridPaginationModel,
  GridRowParams
} from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileDownload as FileDownloadIcon
} from '@mui/icons-material';
import OrderDeleteDialog from '../components/orders/OrderDeleteDialog';
import { Link as RouterLink } from 'react-router-dom';
import { format } from 'date-fns';
import orderService from '../services/order.service';
import { Order, OrderStatus, OrderFilterParams, OrderStatusCount } from '../types/order';
import OrderStatsCard from '../components/orders/OrderStatsCard';
import { useAuth } from '../hooks/useAuth';

const OrdersPage: React.FC = () => {
  const { authState } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([
    {
      field: 'createdAt',
      sort: 'desc'
    }
  ]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filters, setFilters] = useState<OrderFilterParams>({});
  const [statusCounts, setStatusCounts] = useState<OrderStatusCount[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const sort = sortModel.length > 0 
        ? `${sortModel[0].field},${sortModel[0].sort}` 
        : 'createdAt,desc';
      
      const response = await orderService.getOrdersByFilters({
        ...filters,
        page: paginationModel.page,
        size: paginationModel.pageSize,
        sort
      });
      setOrders(response.content);
      setTotalItems(response.totalElements);
      setError(null);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders. Please try again.');
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
      setError('Failed to load status counts. Please try again.');
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchStatusCounts();
  }, [paginationModel.page, paginationModel.pageSize, sortModel, filters]);

  const handlePaginationModelChange = (model: GridPaginationModel) => {
    setPaginationModel(model);
  };

  const handleSortModelChange = (model: GridSortModel, details: GridCallbackDetails) => {
    setSortModel(model);
  };



  const handleDeleteClick = (order: Order) => {
    setSelectedOrder(order);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedOrder) return;
    
    try {
      await orderService.deleteOrder(selectedOrder.id);
      setDeleteDialogOpen(false);
      fetchOrders(); // Refresh the list
      setError(null);
    } catch (error) {
      console.error('Error deleting order:', error);
      setError('Failed to delete order. Please try again.');
    }
  };

  const handleCloseError = () => {
    setError(null);
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

  useEffect(() => {
    // Debug: Log the first order to see its structure
    if (orders.length > 0) {
      console.log('First order:', orders[0]);
    }
  }, [orders]);

  const columns: GridColDef[] = [
    { field: 'orderNumber', headerName: 'Order Number', flex: 1 },
    { 
      field: 'marketplace', 
      headerName: 'Marketplace', 
      flex: 1,
      valueGetter: (params: any) => {
        const marketplace = params.name;
        return marketplace ?? '';
      }
    },
    { 
      field: 'customer', 
      headerName: 'Customer', 
      flex: 1,
      valueGetter: (params: any) => {
        const customer = params.name;
        return customer ?? '';
      }
    },
    { 
      field: 'deliveryDate', 
      headerName: 'Delivery Date', 
      flex: 1,
      valueFormatter: (params: any) => {
        if (!params) return '';
        try {
          return format(new Date(params), 'MMM dd, yyyy');
        } catch (e) {
          return 'Invalid Date';
        }
      }
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      flex: 1,
      renderCell: (params: any) => (
        <Chip
          label={params.value as string}
          color={getStatusChipColor(params.value as OrderStatus) as any}
          size="small"
        />
      )
    },
    { 
      field: 'createdAt', 
      headerName: 'Created At', 
      flex: 1,
      valueFormatter: (params: any) => {
        if (!params) return '';
        try {
          return format(new Date(params), 'MMM dd, yyyy');
        } catch (e) {
          return 'Invalid Date';
        }
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Tooltip title="View">
            <IconButton
              component={RouterLink}
              to={`/orders/${params.row.id}`}
              size="small"
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {authState.user?.roles?.includes('ORDER_UPDATE') && (
            <Tooltip title="Edit">
              <IconButton
                component={RouterLink}
                to={`/orders/${params.row.id}/edit`}
                size="small"
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {authState.user?.roles?.includes('ORDER_DELETE') && (
            <Tooltip title="Delete">
              <IconButton
                onClick={() => handleDeleteClick(params.row)}
                size="small"
                color="error"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )
    }
  ];

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h4" component="h1" gutterBottom>
                Orders
              </Typography>
              <Stack direction="row" spacing={2}>
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
          <Grid size={{ xs: 12 }}>
            <Grid container spacing={2}>
              {statusCounts.map((statusCount) => (
                <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={statusCount.status}>
                  <OrderStatsCard
                    status={statusCount.status}
                    count={statusCount.count}
                    onClick={() => setFilters({ ...filters, status: statusCount.status as OrderStatus })}
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Orders DataGrid */}
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ height: 600, width: '100%' }}>
              <DataGrid
                rows={orders}
                columns={columns}
                pagination
                paginationMode="server"
                rowCount={totalItems}
                pageSizeOptions={[5, 10, 25]}
                paginationModel={paginationModel}
                onPaginationModelChange={handlePaginationModelChange}
                sortingMode="server"
                sortModel={sortModel}
                onSortModelChange={handleSortModelChange}
                filterMode="server"
                initialState={{
                  sorting: {
                    sortModel: [{ field: 'createdAt', sort: 'desc' }]
                  },
                  pagination: {
                    paginationModel: { page: 0, pageSize: 10 }
                  }
                }}
                disableRowSelectionOnClick
                loading={loading}
                getRowId={(row) => row.id}
              />
            </Paper>
          </Grid>
        </Grid>
      </Box>
      {/* Delete Dialog */}
      {selectedOrder && (
        <OrderDeleteDialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={handleDeleteConfirm}
          orderNumber={selectedOrder.orderNumber}
          orderCustomerName={selectedOrder.customer?.name}
          loading={loading}
        />
      )}

      {/* Error Snackbar */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default OrdersPage;
