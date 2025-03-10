import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, Alert, Snackbar, CircularProgress } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import WorkOrderStats from '../components/workOrders/WorkOrderStats';
import WorkOrderTable from '../components/workOrders/WorkOrderTable';
import WorkOrderDialog from '../components/workOrders/WorkOrderDialog';
import { workOrderService } from '../services/workOrder.service';
import { userService } from '../services/user.service';
import { WorkOrder, WorkOrderStats as Stats, WorkOrderFilter, WorkOrderRequest } from '../types/workOrder';
import { User } from '../types';
import { useAuth } from '../hooks/useAuth';

const WorkOrdersPage: React.FC = () => {
  const { authState } = useAuth();
  const isAdmin = authState.user?.roles.some(role => role === 'ROLE_ADMIN');
  
  const [state, setState] = useState({
    workOrders: [] as WorkOrder[],
    stats: {
      submitted: 0,
      gcSnSubmitted: 0,
      rtvFixed: 0,
      saved: 0,
      totalProcessed: 0
    } as Stats,
    users: [] as User[],
    loading: true,
    dialogLoading: false,
    error: null as string | null,
    success: null as string | null,
    page: 0,
    totalPages: 0,
    rowsPerPage: 10,
    sortBy: 'clientDueDate',
    sortDir: 'asc',
    filters: {} as WorkOrderFilter,
    selectedWorkOrder: null as WorkOrder | null,
    openDialog: false,
  });
  
  const fetchWorkOrders = async (
    pageParam = state.page,
    rowsPerPageParam = state.rowsPerPage,
    sortByParam = state.sortBy,
    sortDirParam = state.sortDir,
    filtersParam = state.filters
  ) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const response = await workOrderService.getWorkOrders(
        pageParam,
        rowsPerPageParam,
        sortByParam,
        sortDirParam,
        filtersParam
      );      
      
      const statsResponse = await workOrderService.getWorkOrderStats();
      console.log(statsResponse);
      
      setState(prev => ({
        ...prev,
        workOrders: response.data.content,
        totalPages: response.data.totalPages,
        stats: statsResponse.data,
        loading: false,
        error: null
      }));
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err.message || 'Failed to load work orders'
      }));
    }
  };
  
  const fetchUsers = async () => {
    if (!isAdmin) return;
    
    try {
      const response = await userService.getAllUsers();
      console.log('Users response:', response);
      setState(prev => ({
        ...prev,
        users: Array.isArray(response.data) ? response.data : []
      }));
    } catch (err: any) {
      console.error('Failed to load users:', err);
    }
  };
  
  useEffect(() => {
    fetchWorkOrders();
    fetchUsers();
  }, []);
  
  const handlePageChange = (page: number) => {
    setState(prev => ({ ...prev, page }));
    fetchWorkOrders(page, state.rowsPerPage, state.sortBy, state.sortDir, state.filters);
  };
  
  const handleRowsPerPageChange = (rowsPerPage: number) => {
    setState(prev => ({ ...prev, rowsPerPage, page: 0 }));
    fetchWorkOrders(0, rowsPerPage, state.sortBy, state.sortDir, state.filters);
  };
  
  const handleSortChange = (sortBy: string, sortDir: string) => {
    setState(prev => ({ ...prev, sortBy, sortDir }));
    fetchWorkOrders(state.page, state.rowsPerPage, sortBy, sortDir, state.filters);
  };
  
  const handleFilterChange = (filters: WorkOrderFilter) => {
    setState(prev => ({ ...prev, filters, page: 0 }));
    fetchWorkOrders(0, state.rowsPerPage, state.sortBy, state.sortDir, filters);
  };
  
  const handleOpenCreateDialog = () => {
    setState(prev => ({ ...prev, selectedWorkOrder: null, openDialog: true }));
  };
  
  const handleOpenEditDialog = (workOrder: WorkOrder) => {
    setState(prev => ({ ...prev, selectedWorkOrder: workOrder, openDialog: true }));
  };
  
  const handleCloseDialog = () => {
    setState(prev => ({ ...prev, openDialog: false }));
  };
  
  const handleSaveWorkOrder = async (workOrderData: WorkOrderRequest) => {
    try {
      setState(prev => ({ ...prev, dialogLoading: true }));
      
      if (state.selectedWorkOrder) {
        // Update existing work order
        await workOrderService.updateWorkOrder(state.selectedWorkOrder.id, workOrderData);
        setState(prev => ({
          ...prev,
          dialogLoading: false,
          openDialog: false,
          success: 'Work order updated successfully'
        }));
      } else {
        // Create new work order
        await workOrderService.createWorkOrder(workOrderData);
        setState(prev => ({
          ...prev,
          dialogLoading: false,
          openDialog: false,
          success: 'Work order created successfully'
        }));
      }
      
      // Refresh work orders
      fetchWorkOrders();
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        dialogLoading: false,
        error: err.message || 'Failed to save work order'
      }));
    }
  };
  
  const handleDeleteWorkOrder = async (workOrder: WorkOrder) => {
    if (!window.confirm(`Are you sure you want to delete work order ${workOrder.woNumber}?`)) {
      return;
    }
    
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      await workOrderService.deleteWorkOrder(workOrder.id);
      
      setState(prev => ({
        ...prev,
        loading: false,
        success: 'Work order deleted successfully'
      }));
      
      // Refresh work orders
      fetchWorkOrders();
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err.message || 'Failed to delete work order'
      }));
    }
  };
  
  const handleCloseSnackbar = () => {
    setState(prev => ({ ...prev, success: null, error: null }));
  };
  
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Work Orders</Typography>
        {isAdmin && (
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
          >
            New Work Order
          </Button>
        )}
      </Box>
      
      <WorkOrderStats stats={state.stats} loading={state.loading} />
      
      <Paper sx={{ mt: 3, p: 2 }}>
        {state.loading && state.workOrders.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <WorkOrderTable 
            workOrders={state.workOrders}
            loading={state.loading}
            page={state.page}
            totalPages={state.totalPages}
            rowsPerPage={state.rowsPerPage}
            sortBy={state.sortBy}
            sortDir={state.sortDir}
            filters={state.filters}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            onSortChange={handleSortChange}
            onFilterChange={handleFilterChange}
            onEdit={isAdmin ? handleOpenEditDialog : () => {}}
            onDelete={isAdmin ? handleDeleteWorkOrder : () => {}}
          />
        )}
      </Paper>
      
      {isAdmin && (
        <WorkOrderDialog 
          open={state.openDialog}
          workOrder={state.selectedWorkOrder}
          users={state.users}
          loading={state.dialogLoading}
          onClose={handleCloseDialog}
          onSave={handleSaveWorkOrder}
        />
      )}
      
      <Snackbar 
        open={!!state.success} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {state.success}
        </Alert>
      </Snackbar>
      
      <Snackbar 
        open={!!state.error} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {state.error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default WorkOrdersPage;
