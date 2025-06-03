import api from './api';
import { Order, OrderRequest, OrderFormData, OrderFilterParams, OrderStatusCount, OrderStatus } from '../types/order';

// Interface for monthly order data
export interface MonthlyOrderData {
  date: string;
  count: number;
}

// Interface for monthly order count and amount data
export interface MonthlyOrderCountAmount {
  date: string;
  count: number;
  amount: number;
}

const BASE_URL = '/orders';

export const createOrder = async (orderData: OrderFormData): Promise<Order> => {
  const formData = new FormData();
  
  // Convert OrderFormData to OrderRequest
  const orderRequest: OrderRequest = {
    orderType: orderData.orderType,
    marketplaceId: orderData.marketplaceId,
    customerId: orderData.customerId,
    customerData: orderData.customerData,
    // customerValidation is only used for frontend validation and doesn't need to be sent to the backend
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
  
  formData.append('orderRequest', new Blob([JSON.stringify(orderRequest)], {
    type: 'application/json'
  }));
  
  // Append any temporary image files
  if (orderData.products) {
    orderData.products.forEach((product) => {
      if (product.tempImages && product.tempImages.length > 0) {
        product.tempImages.forEach((file) => {
          formData.append('files', file);
        });
      }
    });
  }
  
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
    orderType: orderData.orderType,
    marketplaceId: orderData.marketplaceId,
    customerId: orderData.customerId,
    customerData: orderData.customerData,
    // customerValidation is only used for frontend validation and doesn't need to be sent to the backend
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
  
  formData.append('orderRequest', new Blob([JSON.stringify(orderRequest)], {
    type: 'application/json'
  }));
  
  // Append any temporary image files
  if (orderData.products) {
    orderData.products.forEach((product) => {
      if (product.tempImages && product.tempImages.length > 0) {
        product.tempImages.forEach((file) => {
          formData.append('files', file);
        });
      }
    });
  }
  
  const response = await api.put(`${BASE_URL}/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  
  return response.data;
};

export const updateOrderStatus = async (id: number, status: string, notes?: string): Promise<Order> => {
  try {
    const response = await api.patch(`${BASE_URL}/${id}/status`, null, {
      params: { status, notes }
    });
    return response.data;
  } catch (error) {
    // Let the component handle the error with the specific error message
    throw error;
  }
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

export const getOrderStatusCounts = async (currentMonth = true): Promise<OrderStatusCount[]> => {
  const response = await api.get(`${BASE_URL}/status-counts`, {
    params: { currentMonth }
  });
  return response.data;
};

export const getOrderStatusCountsByMonth = async (month: number, year: number): Promise<OrderStatusCount[]> => {
  const response = await api.get(`${BASE_URL}/status-counts`, {
    params: { month, year }
  });
  return response.data;
};

export const getUserOrderStatusCounts = async (userId: number, currentMonth = true): Promise<OrderStatusCount[]> => {
  const response = await api.get(`${BASE_URL}/user/${userId}/status-counts`, {
    params: { currentMonth }
  });
  return response.data;
};

export const getUserOrderStatusCountsByMonth = async (userId: number, month: number, year: number): Promise<OrderStatusCount[]> => {
  const response = await api.get(`${BASE_URL}/user/${userId}/status-counts`, {
    params: { month, year }
  });
  return response.data;
};

export const getUserOrderStatistics = async (currentMonth = true): Promise<any[]> => {
  const response = await api.get(`${BASE_URL}/user-statistics`, {
    params: { currentMonth }
  });
  return response.data;
};

export const getUserOrderStatisticsByMonth = async (month: number, year: number): Promise<any[]> => {
  const response = await api.get(`${BASE_URL}/user-statistics`, {
    params: { month, year }
  });
  return response.data;
};

export const getMarketplaceOrderStatistics = async (currentMonth = true): Promise<any[]> => {
  const response = await api.get(`${BASE_URL}/marketplace-statistics`, {
    params: { currentMonth }
  });
  return response.data;
};

export const getMarketplaceOrderStatisticsByMonth = async (month: number, year: number): Promise<any[]> => {
  const response = await api.get(`${BASE_URL}/marketplace-statistics`, {
    params: { month, year }
  });
  return response.data;
};

/**
 * Get orders for the last month, grouped by day
 * @returns Array of daily order counts for the last month
 */
export const getLastMonthOrders = async (): Promise<MonthlyOrderData[]> => {
  // Calculate date range for the last month
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 1);
  
  // Format dates for API
  const formattedStartDate = startDate.toISOString().split('T')[0];
  const formattedEndDate = endDate.toISOString().split('T')[0];

  console.log("Fetching last month orders with:", { startDate: formattedStartDate, endDate: formattedEndDate });
  
  // Use the dedicated endpoint for monthly data
  const response = await api.get(`${BASE_URL}/monthly-data`, {
    params: {
      startDate: formattedStartDate,
      endDate: formattedEndDate
    }
  });
  
  // Map the response to the expected format
  return response.data.map((item: any) => ({
    date: item.date,
    count: item.count
  }));
};

/**
 * Get monthly order count and amount data
 * @param month optional month (0-11)
 * @param year optional year
 * @param currentMonth whether to use current month if month/year not provided
 * @returns Array of daily order counts and amounts
 */
export const getMonthlyOrderCountAndAmount = async (
  month?: number,
  year?: number,
  currentMonth: boolean = true
): Promise<MonthlyOrderCountAmount[]> => {
  const response = await api.get(`${BASE_URL}/monthly-count-amount`, {
    params: { month, year, currentMonth }
  });
  
  // Map the response to the expected format
  return response.data.map((item: any) => ({
    date: item.date,
    count: item.count,
    amount: item.amount
  }));
};

/**
 * Get similar orders (returned or cancelled) based on product type and fabric
 * @param id the order ID to find similar orders for
 * @param limit maximum number of similar orders to return (default: 5)
 * @returns list of similar orders
 */
export const getSimilarOrders = async (id: number, limit: number = 5): Promise<Order[]> => {
  const response = await api.get(`${BASE_URL}/${id}/similar`, {
    params: { limit }
  });
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
  getOrderStatusCountsByMonth,
  getUserOrderStatusCounts,
  getUserOrderStatusCountsByMonth,
  getUserOrderStatistics,
  getUserOrderStatisticsByMonth,
  getMarketplaceOrderStatistics,
  getMarketplaceOrderStatisticsByMonth,
  getSimilarOrders,
  downloadBlob,
  getLastMonthOrders,
  getMonthlyOrderCountAndAmount
};

export default orderService;
