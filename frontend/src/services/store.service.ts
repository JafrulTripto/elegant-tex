import api from './api';
import { Page } from '../types';
import { ManualStoreItemRequest, StoreItem, StoreItemFilterParams, StoreStatistics } from '../types/store';

const BASE_URL = '/store';

const storeService = {
  listItems: async (params: StoreItemFilterParams = {}): Promise<Page<StoreItem>> => {
    const response = await api.get(`${BASE_URL}/items`, { params });
    return response.data;
  },

  getItem: async (id: number): Promise<StoreItem> => {
    const response = await api.get(`${BASE_URL}/items/${id}`);
    return response.data;
  },

  getItemBySku: async (sku: string): Promise<StoreItem> => {
    const response = await api.get(`${BASE_URL}/items/sku/${encodeURIComponent(sku)}`);
    return response.data;
  },

  getItemsByOrder: async (orderNumber: string, page = 0, size = 10): Promise<Page<StoreItem>> => {
    const response = await api.get(`${BASE_URL}/items/by-order/${encodeURIComponent(orderNumber)}`, { params: { page, size } });
    return response.data;
  },

  deleteItem: async (id: number): Promise<void> => {
    await api.delete(`${BASE_URL}/items/${id}`);
  },

  createManualItem: async (payload: ManualStoreItemRequest): Promise<{ adjustmentId: number }> => {
    const response = await api.post(`${BASE_URL}/items/manual`, payload);
    return response.data;
  },

  approveAdjustment: async (adjustmentId: number) => {
    const response = await api.post(`${BASE_URL}/adjustments/${adjustmentId}/approve`);
    return response.data;
  },

  rejectAdjustment: async (adjustmentId: number, reason: string): Promise<void> => {
    await api.post(`${BASE_URL}/adjustments/${adjustmentId}/reject`, { reason });
  },

  updateQuality: async (id: number, quality: string, notes?: string) => {
    const response = await api.post(`${BASE_URL}/items/${id}/quality`, { quality, notes });
    return response.data;
  },

  adjustQuantity: async (id: number, quantityChange: number, notes?: string) => {
    const response = await api.post(`${BASE_URL}/items/${id}/adjust`, { quantityChange, notes });
    return response.data;
  },

  useItem: async (id: number, quantity: number, notes?: string) => {
    const response = await api.post(`${BASE_URL}/items/${id}/use`, { quantity, notes });
    return response.data;
  },

  writeOff: async (id: number, notes?: string): Promise<void> => {
    await api.post(`${BASE_URL}/items/${id}/write-off`, { notes });
  },

  statistics: async (): Promise<StoreStatistics> => {
    const response = await api.get(`${BASE_URL}/statistics`);
    return response.data;
  },

  listAdjustments: async (status: 'PENDING' | 'APPROVED' | 'REJECTED' = 'PENDING', page = 0, size = 10) => {
    const response = await api.get(`${BASE_URL}/adjustments`, { params: { status, page, size } });
    return response.data as Page<any>;
  },

  availableForProduct: async (fabricId: number, productTypeId: number) => {
    const response = await api.get(`${BASE_URL}/available`, { params: { fabricId, productTypeId } });
    return response.data as { availableItems: StoreItem[]; totalQuantity: number };
  },
};

export default storeService;
