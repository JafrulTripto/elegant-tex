import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  IconButton,
  Paper,
  Typography,
  Tooltip,
  Snackbar,
  Alert,
  useMediaQuery,
  useTheme,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import OrderExcelExportDialog from '../components/orders/OrderExcelExportDialog';
import StatusChip from '../components/common/StatusChip';
import { spacing, layoutUtils } from '../theme/styleUtils';
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
  FileDownload as FileDownloadIcon,
  ShoppingCart as OrdersIcon
} from '@mui/icons-material';
import OrderDeleteDialog from '../components/orders/OrderDeleteDialog';
import { Link as RouterLink } from 'react-router-dom';
import { format } from 'date-fns';
import orderService from '../services/order.service';
import { Order, OrderStatus, OrderFilterParams} from '../types/order';
import { OrderType } from '../types/orderType';
import { useAuth } from '../hooks/useAuth';
import { canViewAllOrders } from '../utils/permissionUtils';

// Constant for the "All" filter option
const ALL_FILTER = 'ALL';

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
  const [filters, setFilters] = useState<OrderFilterParams>({ orderType: undefined });
  const [error, setError] = useState<string | null>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState<boolean>(false);
  const [exportLoading, setExportLoading] = useState<boolean>(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const sort = sortModel && sortModel.length > 0 && sortModel[0]
        ? `${sortModel[0].field},${sortModel[0].sort}` 
        : 'createdAt,desc';
      
      const response = await orderService.getOrdersByFilters({
        ...filters,
        page: paginationModel?.page || 0,
        size: paginationModel?.pageSize || 10,
        sort
      });
      
      if (response && response.content) {
        setOrders(response.content);
        setTotalItems(response.totalElements || 0);
        setError(null);
      } else {
        setOrders([]);
        setTotalItems(0);
        setError('No data received from server.');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders. Please try again.');
      setOrders([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchOrders();
  }, [
    paginationModel?.page, 
    paginationModel?.pageSize, 
    sortModel, 
    filters
  ]);

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
    if (!order) return;
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

  const handleOrderTypeChange = (
    _: React.MouseEvent<HTMLElement>,
    newOrderType: OrderType | string | null
  ) => {
    // If ALL_FILTER is selected or null, set orderType to undefined (show all)
    const orderTypeFilter = newOrderType === ALL_FILTER ? undefined : newOrderType as OrderType | undefined;
    
    if (filters) {
      setFilters({ ...filters, orderType: orderTypeFilter });
    } else {
      setFilters({ orderType: orderTypeFilter });
    }
  };

  const handleExportExcel = () => {
    setExportDialogOpen(true);
  };
  
  const handleExportConfirm = async (
    status: OrderStatus | null, 
    orderType: OrderType | null, 
    startDate: Date | null, 
    endDate: Date | null
  ) => {
    setExportLoading(true);
    try {
      // Format dates to ISO strings if they exist
      const formattedStartDate = startDate ? startDate.toISOString().split('T')[0] : undefined;
      const formattedEndDate = endDate ? endDate.toISOString().split('T')[0] : undefined;
      
      const blob = await orderService.generateOrdersExcel(
        status || undefined,
        orderType || undefined,
        formattedStartDate,
        formattedEndDate
      );
      
      if (blob && blob.size > 0) {
        // Generate a more descriptive filename
        let filename = 'orders';
        if (orderType) filename += `_${orderType.toLowerCase()}`;
        if (status) filename += `_${status.toLowerCase()}`;
        if (startDate) filename += `_from_${formattedStartDate}`;
        if (endDate) filename += `_to_${formattedEndDate}`;
        filename += '.xlsx';
        
        orderService.downloadBlob(blob, filename);
        setExportDialogOpen(false);
        setError(null);
      } else {
        throw new Error('Generated Excel file is empty or invalid');
      }
    } catch (error) {
      console.error('Error exporting orders to Excel:', error);
      setError('Failed to export orders. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  const getColumns = (): GridColDef[] => {
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
          if (!params) {
            return 'Direct Merchant';
          }
          return params.name;
        }
      },
      { 
        field: 'customer', 
        headerName: 'Customer', 
        flex: 1,
        minWidth: 120,
        valueGetter: (params: any) => {
          // Check if params and params.row exist first
          if (!params) {
            return '';
          }
          return params.name;
        }
      },
      { 
        field: 'deliveryDate', 
        headerName: 'Delivery', 
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
        field: 'status', 
        headerName: 'Status', 
        flex: 0.8,
        minWidth: 100,
        renderCell: (params: GridRenderCellParams) => {
          if (!params || params.value === undefined || params.value === null) {
            return null;
          }
          return (
            <StatusChip
              status={params.value as string}
              isOrderStatus={true}
              size="small"
              sx={{ fontSize: '0.7rem', height: 24 }}
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
        renderCell: (params: GridRenderCellParams) => {
          // Check if params and params.row exist first
          if (!params || !params.row) {
            return null;
          }
          
          return (
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
          );
        }
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
        {/* Header Section - Similar to Settings Page */}
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            mb: 2,
            pb: 1,
            borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <OrdersIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography 
                variant="h5" 
                component="h1"
                sx={{ fontWeight: 500 }}
              >
                Orders
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={isXsScreen ? null : <AddIcon />}
              component={RouterLink}
              to="/orders/new"
              sx={{ 
                height: { xs: 36, sm: 40 },
                px: { xs: 1.5, sm: 2 }
              }}
            >
              {isXsScreen ? 'New' : 'New Order'}
            </Button>
          </Box>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ ml: { sm: 4 } }}
          >
            Manage your orders and track their status
            {!hasViewAllOrdersPermission && (
              <Typography 
                component="span" 
                variant="body2" 
                color="warning.main"
                sx={{ ml: 1, fontStyle: 'italic' }}
              >
                (viewing only your orders)
              </Typography>
            )}
          </Typography>
        </Box>

        <Grid container spacing={{ xs: 2, sm: 3 }}>
          <Grid size={{ xs: 12 }}>
            <Box 
              sx={{
                ...layoutUtils.spaceBetweenFlex,
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' },
                mb: theme.customSpacing.section,
                gap: 1
              }}
            >
              <Box>
                {/* Order type filter */}
                <ToggleButtonGroup
                  value={filters.orderType || ALL_FILTER}
                  exclusive
                  onChange={handleOrderTypeChange}
                  aria-label="order type filter"
                  size={isXsScreen ? "small" : "medium"}
                  sx={{ 
                    mb: { xs: 1, sm: 0 },
                    '.MuiToggleButton-root': {
                      textTransform: 'none',
                      px: { xs: 1.5, sm: 2 }
                    }
                  }}
                >
                  <ToggleButton value={ALL_FILTER}>
                    All
                  </ToggleButton>
                  <ToggleButton value={OrderType.MARKETPLACE}>
                    Marketplace
                  </ToggleButton>
                  <ToggleButton value={OrderType.MERCHANT}>
                    Merchant
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
              <Button
                variant="outlined"
                startIcon={isXsScreen ? null : <FileDownloadIcon />}
                onClick={handleExportExcel}
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                {isXsScreen ? 'Export' : 'Export to Excel'}
              </Button>
            </Box>
          </Grid>


          {/* Orders DataGrid */}
          <Grid size={{ xs: 12 }}>
            <Paper 
              sx={{ 
                height: { xs: 500, sm: 600 }, 
                width: '100%',
                overflow: 'hidden',
                ...spacing.contentPadding(theme)
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
                getRowId={(row) => row?.id || ''}
                sx={{
                  '& .MuiDataGrid-cell': {
                    fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' },
                    py: { xs: 0.75, sm: 1, md: 1.5 },
                    display: 'flex',
                    alignItems: 'center'
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
          orderNumber={selectedOrder.orderNumber || ''}
          orderCustomerName={selectedOrder.customer?.name || ''}
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
      
      {/* Excel Export Dialog */}
      <OrderExcelExportDialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        onExport={handleExportConfirm}
        loading={exportLoading}
      />
    </Container>
  );
};

export default OrdersPage;
