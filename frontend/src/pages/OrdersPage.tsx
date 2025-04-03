import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  IconButton,
  Paper,
  Typography,
  Chip,
  Tooltip,
  Stack,
  Snackbar,
  Alert,
  useMediaQuery,
  useTheme
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { 
  DataGrid, 
  GridColDef,
  GridRenderCellParams,
  GridSortModel,
  GridPaginationModel,
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
import { Order, OrderStatus, OrderFilterParams, OrderStatusCount, ORDER_STATUS_COLORS, STATUS_OPTIONS, STATUS_DISPLAY_OPTIONS } from '../types/order';
import OrderStatsCard from '../components/orders/OrderStatsCard';
import { useAuth } from '../hooks/useAuth';
import { canViewAllOrders } from '../utils/permissionUtils';

const OrdersPage: React.FC = () => {
  const theme = useTheme();
  const isXsScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMdScreen = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  const { authState } = useAuth();
  const hasViewAllOrdersPermission = authState.user?.permissions ? 
    canViewAllOrders(authState.user.permissions) : false;
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: isXsScreen ? 5 : 10
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

  // Update pagination model when screen size changes
  useEffect(() => {
    setPaginationModel(prev => ({
      ...prev,
      pageSize: isXsScreen ? 5 : 10
    }));
  }, [isXsScreen]);

  const handlePaginationModelChange = (model: GridPaginationModel) => {
    setPaginationModel(model);
  };

  const handleSortModelChange = (model: GridSortModel) => {
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

  // Convert backend status to display status
  const getDisplayStatus = (backendStatus: string): string => {
    const index = STATUS_OPTIONS.indexOf(backendStatus as any);
    return index >= 0 ? STATUS_DISPLAY_OPTIONS[index] : backendStatus;
  };
  
  // Get status chip color based on status
  const getStatusChipColor = (status: string): string => {
    // Check if it's a backend status (like ORDER_CREATED)
    if (ORDER_STATUS_COLORS[status as keyof typeof ORDER_STATUS_COLORS]) {
      return ORDER_STATUS_COLORS[status as keyof typeof ORDER_STATUS_COLORS];
    }
    
    // If not found, try to convert to display status and get color
    const displayStatus = getDisplayStatus(status);
    
    // Default colors for special cases
    switch (displayStatus) {
      case 'Order Created':
        return '#1890ff'; // info blue
      case 'Approved':
        return '#13c2c2'; // cyan
      case 'Booking':
        return '#722ed1'; // purple
      case 'Production':
        return '#eb2f96'; // pink
      case 'QA':
        return '#faad14'; // warning yellow
      case 'Ready':
        return '#a0d911'; // lime
      case 'Delivered':
        return '#52c41a'; // success green
      case 'Returned':
        return '#fa8c16'; // orange
      case 'Cancelled':
        return '#f5222d'; // error red
      default:
        return '#d9d9d9'; // default gray
    }
  };

  // Define columns based on screen size
  const getColumns = (): GridColDef[] => {
    // Base columns definition
    const baseColumns: GridColDef[] = [
      { 
        field: 'orderNumber', 
        headerName: 'Order #', 
        flex: 0.8,
        minWidth: 100
      },
      { 
        field: 'marketplace', 
        headerName: 'Marketplace', 
        flex: 1,
        minWidth: 120,
        valueGetter: (params: any) => {
          const marketplace = params.name;
          return marketplace ?? '';
        }
      },
      { 
        field: 'customer', 
        headerName: 'Customer', 
        flex: 1,
        minWidth: 120,
        valueGetter: (params: any) => {
          const customer = params.name;
          return customer ?? '';
        }
      },
      { 
        field: 'deliveryDate', 
        headerName: 'Delivery', 
        flex: 1,
        minWidth: 110,
        valueFormatter: (params: any) => {
          console.log('Delivery Date:', params);
          
          if (!params) return '';
          try {
            // Use shorter date format on medium screens
            return format(new Date(params), isMdScreen ? 'MM/dd/yy' : 'MMM dd, yyyy');
          } catch (e) {
            return 'Invalid Date';
          }
        }
      },
      { 
        field: 'status', 
        headerName: 'Status', 
        flex: 0.8,
        minWidth: 100,
        renderCell: (params: GridRenderCellParams) => {
          const displayStatus = getDisplayStatus(params.value as string);
          return (
            <Chip
              label={displayStatus}
              sx={{ 
                backgroundColor: getStatusChipColor(params.value as string),
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '0.7rem',
                height: 24
              }}
              size="small"
            />
          );
        }
      },
      { 
        field: 'createdAt', 
        headerName: 'Created', 
        flex: 1,
        minWidth: 110,
        valueFormatter: (params: any) => {
          if (!params) return '';
          try {
            // Use shorter date format on medium screens
            return format(new Date(params), isMdScreen ? 'MM/dd/yy' : 'MMM dd, yyyy');
          } catch (e) {
            return 'Invalid Date';
          }
        }
      },
      {
        field: 'actions',
        headerName: 'Actions',
        flex: 0.7,
        minWidth: 100,
        sortable: false,
        renderCell: (params: GridRenderCellParams) => (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="View">
              <IconButton
                component={RouterLink}
                to={`/orders/${params.row.id}`}
                size="small"
              >
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {authState.user?.roles?.includes('ORDER_UPDATE') && !isXsScreen && (
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
            {authState.user?.roles?.includes('ORDER_DELETE') && !isXsScreen && (
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
    
    // Filter columns based on screen size
    if (isXsScreen) {
      return baseColumns.filter(column => 
        ['orderNumber', 'status', 'actions'].includes(column.field)
      );
    }
    
    if (isMdScreen) {
      return baseColumns.filter(column => 
        ['orderNumber', 'marketplace', 'customer', 'status', 'actions'].includes(column.field)
      );
    }
    
    return baseColumns;
  };

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ my: { xs: 2, sm: 3, md: 4 } }}>
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          <Grid size={{ xs: 12 }}>
            <Box 
              display="flex" 
              flexDirection={{ xs: 'column', sm: 'row' }} 
              justifyContent="space-between" 
              alignItems={{ xs: 'flex-start', sm: 'center' }} 
              mb={{ xs: 1, sm: 2 }}
              gap={1}
            >
              <Box>
                <Typography 
                  variant="h4" 
                  component="h1" 
                  gutterBottom
                  sx={{ 
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
                    mb: { xs: 0.5, sm: 1 }
                  }}
                >
                  Orders
                </Typography>
                {!hasViewAllOrdersPermission && (
                  <Typography 
                    variant="subtitle2" 
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                  >
                    You are viewing only orders created by you. Contact an administrator for access to all orders.
                  </Typography>
                )}
              </Box>
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={{ xs: 1, sm: 2 }}
                width={{ xs: '100%', sm: 'auto' }}
              >
                <Button
                  variant="outlined"
                  startIcon={isXsScreen ? null : <FileDownloadIcon />}
                  onClick={handleExportExcel}
                  fullWidth
                  size="small"
                  sx={{ width: { sm: 'auto' } }}
                >
                  {isXsScreen ? 'Export' : 'Export to Excel'}
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={isXsScreen ? null : <AddIcon />}
                  component={RouterLink}
                  to="/orders/new"
                  fullWidth
                  size="small"
                  sx={{ width: { sm: 'auto' } }}
                >
                  {isXsScreen ? 'New' : 'New Order'}
                </Button>
              </Stack>
            </Box>
          </Grid>

          {/* Status Cards */}
          <Grid size={{ xs: 12 }}>
            <Grid container spacing={1}>
              {statusCounts.map((statusCount) => (
                <Grid size={{ xs: 6, sm: 4, md: 2.4 }} key={statusCount.status}>
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
            <Paper 
              sx={{ 
                height: { xs: 500, sm: 600 }, 
                width: '100%',
                overflow: 'hidden'
              }}
            >
              <DataGrid
                rows={orders}
                columns={getColumns()}
                pagination
                paginationMode="server"
                rowCount={totalItems}
                pageSizeOptions={isXsScreen ? [5, 10] : [5, 10, 25]}
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
                    paginationModel: { page: 0, pageSize: isXsScreen ? 5 : 10 }
                  }
                }}
                disableRowSelectionOnClick
                loading={loading}
                getRowId={(row) => row.id}
                sx={{
                  '& .MuiDataGrid-cell': {
                    fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' },
                    py: { xs: 0.75, sm: 1, md: 1.5 }
                  },
                  '& .MuiDataGrid-columnHeader': {
                    fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' }
                  },
                  '& .MuiDataGrid-footerContainer': {
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    gap: { xs: 1, sm: 0 }
                  },
                  '& .MuiTablePagination-toolbar': {
                    flexWrap: 'wrap',
                    justifyContent: { xs: 'center', sm: 'flex-end' }
                  },
                  '& .MuiTablePagination-displayedRows': {
                    fontSize: { xs: '0.7rem', sm: '0.75rem' }
                  },
                  '& .MuiTablePagination-selectLabel': {
                    fontSize: { xs: '0.7rem', sm: '0.75rem' }
                  }
                }}
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
        sx={{
          bottom: { xs: 16, sm: 24 }
        }}
      >
        <Alert 
          onClose={handleCloseError} 
          severity="error" 
          sx={{ 
            width: '100%',
            fontSize: { xs: '0.75rem', sm: '0.875rem' }
          }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default OrdersPage;
