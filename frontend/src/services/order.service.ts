import api from './api';
import { Order, OrderRequest, OrderFormData, OrderFilterParams, OrderStatusCount, OrderStatus } from '../types/order';

const BASE_URL = '/orders';

export const createOrder = async (orderData: OrderFormData): Promise<Order> => {
  const formData = new FormData();
  
  // Convert OrderFormData to OrderRequest
  const orderRequest: OrderRequest = {
    marketplaceId: orderData.marketplaceId,
    customerName: orderData.customerName,
    customerPhone: orderData.customerPhone,
    customerAddress: orderData.customerAddress,
    customerAlternativePhone: orderData.customerAlternativePhone,
    customerFacebookId: orderData.customerFacebookId,
    deliveryChannel: orderData.deliveryChannel,
    deliveryCharge: orderData.deliveryCharge,
    deliveryDate: orderData.deliveryDate,
    products: orderData.products.map(product => ({
      id: product.id,
      productType: product.productType,
      fabricId: product.fabricId,
      quantity: product.quantity,
      price: product.price,
      description: product.description,
      imageIds: product.imageIds,
      tempImageBase64: product.tempImageBase64
    }))
  };
  
  formData.append('orderRequest', JSON.stringify(orderRequest));
  
  // Append any temporary image files
  orderData.products.forEach((product, productIndex) => {
    if (product.tempFiles && product.tempFiles.length > 0) {
      product.tempFiles.forEach((file, fileIndex) => {
        formData.append(`files_${productIndex}_${fileIndex}`, file);
      });
    }
  });
  
  const response = await api.post(BASE_URL, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  
  return response.data;
};

export const getOrderById = async (id: number): Promise<Order> => {
  const response = await api.get(`${BASE_URL}/${id}`);
  return response.data;
};

export const getAllOrders = async (page = 0, size = 10): Promise<{ content: Order[], totalElements: number }> => {
  const response = await api.get(BASE_URL, {
    params: { page, size }
  });
  return response.data;
};

export const updateOrder = async (id: number, orderData: OrderFormData): Promise<Order> => {
  const formData = new FormData();
  
  // Convert OrderFormData to OrderRequest
  const orderRequest: OrderRequest = {
    marketplaceId: orderData.marketplaceId,
    customerName: orderData.customerName,
    customerPhone: orderData.customerPhone,
    customerAddress: orderData.customerAddress,
    customerAlternativePhone: orderData.customerAlternativePhone,
    customerFacebookId: orderData.customerFacebookId,
    deliveryChannel: orderData.deliveryChannel,
    deliveryCharge: orderData.deliveryCharge,
    deliveryDate: orderData.deliveryDate,
    products: orderData.products.map(product => ({
      id: product.id,
      productType: product.productType,
      fabricId: product.fabricId,
      quantity: product.quantity,
      price: product.price,
      description: product.description,
      imageIds: product.imageIds,
      tempImageBase64: product.tempImageBase64
    }))
  };
  
  formData.append('orderRequest', JSON.stringify(orderRequest));
  
  // Append any temporary image files
  orderData.products.forEach((product, productIndex) => {
    if (product.tempFiles && product.tempFiles.length > 0) {
      product.tempFiles.forEach((file, fileIndex) => {
        formData.append(`files_${productIndex}_${fileIndex}`, file);
      });
    }
  });
  
  const response = await api.put(`${BASE_URL}/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  
  return response.data;
};

export const updateOrderStatus = async (id: number, status: string, notes?: string): Promise<Order> => {
  const response = await api.patch(`${BASE_URL}/${id}/status`, { status, notes });
  return response.data;
};

export const deleteOrder = async (id: number): Promise<void> => {
  await api.delete(`${BASE_URL}/${id}`);
};

export const getOrdersByFilters = async (
  filters: OrderFilterParams,
  page = 0,
  size = 10
): Promise<{ content: Order[], totalElements: number }> => {
  const response = await api.get(`${BASE_URL}/filter`, {
    params: {
      ...filters,
      page,
      size
    }
  });
  return response.data;
};

export const generateOrderPdf = async (id: number): Promise<Blob> => {
  const response = await api.get(`${BASE_URL}/${id}/pdf`, {
    responseType: 'blob'
  });
  return response.data;
};

export const generateOrdersExcel = async (
  status?: OrderStatus | string,
  startDate?: string,
  endDate?: string
): Promise<Blob> => {
  const response = await api.get(`${BASE_URL}/excel`, {
    params: { status, startDate, endDate },
    responseType: 'blob'
  });
  return response.data;
};

export const getOrderStatusCounts = async (): Promise<OrderStatusCount[]> => {
  const response = await api.get(`${BASE_URL}/status-counts`);
  return response.data;
};

export const downloadBlob = (blob: Blob, fileName: string): void => {
  // Create a URL for the blob
  const url = window.URL.createObjectURL(blob);
  
  // Create a temporary link element
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  
  // Append to the document
  document.body.appendChild(link);
  
  // Trigger the download
  link.click();
  
  // Clean up
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);
};

const orderService = {
  createOrder,
  getOrderById,
  getAllOrders,
  updateOrder,
  updateOrderStatus,
  deleteOrder,
  getOrdersByFilters,
  generateOrderPdf,
  generateOrdersExcel,
  getOrderStatusCounts,
  downloadBlob
};

export default orderService;
