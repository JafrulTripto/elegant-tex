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
  useTheme
} from '@mui/material';
import OrderExcelExportDialog from '../components/orders/OrderExcelExportDialog';
import StatusChip from '../components/common/StatusChip';
import TakaSymble from '../components/common/TakaSymble';
import { spacing } from '../theme/styleUtils';
import Grid from '@mui/material/Grid2';
import { 
  DataGrid, 
  GridColDef,
  GridRenderCellParams,
  GridSortModel,
  GridPaginationModel,
  GridFilterModel,
  GridFilterItem
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
import { Order, OrderStatus, OrderFilterParams, STATUS_DISPLAY_OPTIONS} from '../types/order';
import { OrderType } from '../types/orderType';
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
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] });
  const [error, setError] = useState<string | null>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState<boolean>(false);
  const [exportLoading, setExportLoading] = useState<boolean>(false);

  // Convert DataGrid filter model to backend API parameters
  const convertFiltersToApiParams = (filterModel: GridFilterModel): OrderFilterParams => {
    const params: OrderFilterParams = {};
    
    // Collect all marketplace IDs for better filtering
    const marketplaceMap = new Map<string, number>();
    orders.forEach(order => {
      if (order.marketplace) {
        marketplaceMap.set(order.marketplace.name.toLowerCase(), order.marketplace.id);
      }
    });
    
    filterModel.items.forEach((item: GridFilterItem) => {
      // Skip empty values but allow 0 for numeric fields
      if (item.value === null || item.value === undefined || item.value === '') return;
      
      // Debug logging
      console.log('Filter item:', item.field, item.operator, item.value);
      
      switch (item.field) {
        case 'status':
          if (item.value && typeof item.value === 'string') {
            params.status = item.value;
          }
          break;
          
        case 'orderNumber':
          if (item.value && typeof item.value === 'string') {
            params.orderNumber = item.value.toString();
          }
          break;
          
        case 'marketplace':
          if (item.value && typeof item.value === 'string') {
            const searchValue = item.value.toLowerCase();
            
            // Check for direct merchant filtering
            if (searchValue.includes('direct') || searchValue.includes('merchant')) {
              params.isDirectMerchant = true;
            } else {
              // Find marketplace ID by name (partial match)
              for (const [name, id] of marketplaceMap.entries()) {
                if (name.includes(searchValue) || searchValue.includes(name)) {
                  params.marketplaceId = id;
                  break;
                }
              }
            }
          }
          break;
          
          case 'customer':
            if (item.value && typeof item.value === 'string') {
              params.customerName = item.value;
            }
            break;
            
          case 'deliveryChannel':
            if (item.value && typeof item.value === 'string') {
              params.deliveryChannel = item.value;
            }
            break;
            
          case 'totalAmount':
          if (item.value !== null && item.value !== undefined) {
            const amount = Number(item.value);
            if (!isNaN(amount)) {
              // Handle various DataGrid operators
              switch (item.operator) {
                case '>':
                case 'greaterThan':
                  params.minAmount = amount + 0.01; // Exclude the exact value
                  break;
                case '>=':
                case 'greaterThanOrEqual':
                  params.minAmount = amount;
                  break;
                case '<':
                case 'lessThan':
                  params.maxAmount = amount - 0.01; // Exclude the exact value
                  break;
                case '<=':
                case 'lessThanOrEqual':
                  params.maxAmount = amount;
                  break;
                case '=':
                case 'equals':
                  params.minAmount = amount;
                  params.maxAmount = amount;
                  break;
                case '!=':
                case 'not':
                  // For "not equals", we can't easily handle this with min/max
                  // Skip this filter for now
                  console.warn('Not equals operator not supported for amount filtering');
                  break;
              }
            }
          }
          break;
          
        case 'deliveryDate':
          if (item.value) {
            try {
              const date = new Date(item.value);
              const dateStr = date.toISOString().split('T')[0];
              
              switch (item.operator) {
                case 'onOrAfter':
                case 'after':
                case '>=':
                  params.startDate = dateStr;
                  break;
                case 'onOrBefore':
                case 'before':
                case '<=':
                  params.endDate = dateStr;
                  break;
                case 'is':
                case '=':
                  params.startDate = dateStr;
                  params.endDate = dateStr;
                  break;
              }
            } catch (e) {
              console.error('Invalid delivery date filter value:', item.value);
            }
          }
          break;
          
        case 'createdAt':
          if (item.value) {
            try {
              const date = new Date(item.value);
              const dateStr = date.toISOString().split('T')[0];
              
              switch (item.operator) {
                case 'onOrAfter':
                case 'after':
                case '>=':
                  params.createdStartDate = dateStr;
                  break;
                case 'onOrBefore':
                case 'before':
                case '<=':
                  params.createdEndDate = dateStr;
                  break;
                case 'is':
                case '=':
                  params.createdStartDate = dateStr;
                  params.createdEndDate = dateStr;
                  break;
              }
            } catch (e) {
              console.error('Invalid created date filter value:', item.value);
            }
          }
          break;
      }
    });
    
    return params;
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const sort = sortModel && sortModel.length > 0 && sortModel[0]
        ? `${sortModel[0].field},${sortModel[0].sort}` 
        : 'createdAt,desc';
      
      const filterParams = convertFiltersToApiParams(filterModel);
      
      const response = await orderService.getOrdersByFilters({
        ...filterParams,
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
    filterModel
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

  const handleFilterModelChange = (model: GridFilterModel) => {
    setFilterModel(model);
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
        minWidth: 100,
        filterable: true
      },
      { 
        field: 'marketplace', 
        headerName: 'Marketplace', 
        flex: 1,
        minWidth: 120,
        filterable: true,
        valueGetter: (_, row) => {
          if (!row.marketplace) {
            return 'Direct Merchant';
          }
          return row.marketplace.name;
        }
      },
      { 
        field: 'customer', 
        headerName: 'Customer', 
        flex: 1,
        minWidth: 120,
        filterable: true,
        valueGetter: (_, row) => {
          if (!row.customer) {
            return '';
          }
          return row.customer.name;
        }
      },
      { 
        field: 'deliveryChannel', 
        headerName: 'Delivery Channel', 
        flex: 1.2,
        minWidth: 140,
        filterable: true,
        type: 'singleSelect',
        valueOptions: [
          'GCC Home Delivery',
          'DCC Home Delivery',
          'SteadFast Home Delivery (Without Fitting)',
          'RedX Home Delivery (Without Fitting)',
          'Pathao Home Delivery (Without Fitting)',
          'S A Paribahan (Office Pickup)',
          'Sundarban Courier Service (Office Pickup)',
          'Janani Courier Service (Office Pickup)',
          'Korotoa Courier Service (Office Pickup)',
        ],
        renderCell: (params: GridRenderCellParams) => {
          if (!params || params.value === undefined || params.value === null) {
            return null;
          }
          return (
            <Tooltip title={params.value as string}>
              <Typography 
                variant="body2" 
                sx={{ 
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '100%'
                }}
              >
                {params.value as string}
              </Typography>
            </Tooltip>
          );
        }
      },
      { 
        field: 'totalAmount', 
        headerName: 'Amount', 
        flex: 0.9,
        minWidth: 100,
        filterable: true,
        type: 'number',
        renderCell: (params: GridRenderCellParams) => {
          if (!params || params.value === undefined || params.value === null) {
            return null;
          }
          return (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TakaSymble />
              <Typography variant="body2" sx={{ ml: 0.5 }}>
                {Number(params.value).toLocaleString()}
              </Typography>
            </Box>
          );
        }
      },
      { 
        field: 'deliveryDate', 
        headerName: 'Delivery', 
        flex: 1,
        minWidth: 110,
        filterable: true,
        type: 'date',
        valueGetter: (value) => {
          if (!value) return null;
          return new Date(value);
        },
        valueFormatter: (value) => {          
          if (!value) return '';
          try {
            // Use shorter date format on medium screens
            return format(new Date(value), isMdScreen ? 'MM/dd/yy' : 'MMM dd, yyyy');
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
        filterable: true,
        type: 'singleSelect',
        valueOptions: STATUS_DISPLAY_OPTIONS,
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
        filterable: true,
        type: 'date',
        valueGetter: (value) => {
          if (!value) return null;
          return new Date(value);
        },
        valueFormatter: (value) => {
          if (!value) return '';
          try {
            // Use shorter date format on medium screens
            return format(new Date(value), isMdScreen ? 'MM/dd/yy' : 'MMM dd, yyyy');
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
        filterable: false,
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
        ['orderNumber', 'totalAmount', 'status', 'actions'].includes(column.field)
      );
    }
    
    if (isMdScreen) {
      return baseColumns.filter(column => 
        ['orderNumber', 'marketplace', 'customer', 'totalAmount', 'status', 'actions'].includes(column.field)
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
                display: 'flex',
                justifyContent: 'flex-end',
                mb: 2
              }}
            >
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
                filterModel={filterModel}
                onFilterModelChange={handleFilterModelChange}
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
