import api from './api';
import { WorkOrder, WorkOrderStats, WorkOrderRequest, WorkOrderFilter } from '../types/workOrder';
import { ApiResponse } from '../types';

export const workOrderService = {
  getWorkOrders: async (
    page = 0, 
    size = 10, 
    sortBy = 'id', 
    sortDir = 'asc', 
    filters: WorkOrderFilter = {}
  ) => {
    const params = { 
      page, 
      size, 
      sortBy, 
      sortDir, 
      ...filters 
    };
    
    return api.get<{
      content: WorkOrder[];
      totalElements: number;
      totalPages: number;
      size: number;
      number: number;
    }>('/api/work-orders', { params });
  },
  
  getWorkOrderById: async (id: number) => {
    return api.get<ApiResponse<WorkOrder>>(`/api/work-orders/${id}`);
  },
  
  createWorkOrder: async (workOrder: WorkOrderRequest) => {
    return api.post<ApiResponse<WorkOrder>>('/api/work-orders', workOrder);
  },
  
  updateWorkOrder: async (id: number, workOrder: WorkOrderRequest) => {
    return api.put<ApiResponse<WorkOrder>>(`/api/work-orders/${id}`, workOrder);
  },
  
  deleteWorkOrder: async (id: number) => {
    return api.delete<ApiResponse<void>>(`/api/work-orders/${id}`);
  },
  
  getWorkOrderStats: async () => {
    return api.get<WorkOrderStats>('/api/work-orders/stats');
  }
};
