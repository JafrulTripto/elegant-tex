import { Marketplace } from './marketplace';
import { Fabric } from './fabric';

export interface Order {
  id: number;
  marketplace: Marketplace;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerAlternativePhone?: string;
  customerFacebookId?: string;
  deliveryChannel: string;
  deliveryCharge: number;
  deliveryDate: string;
  status: string;
  totalAmount: number;
  createdBy: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  products: OrderProduct[];
  statusHistory: OrderStatusHistory[];
}

export interface OrderProduct {
  id?: number;
  productType: string;
  fabric: Fabric;
  fabricId: number;
  quantity: number;
  price: number;
  description?: string;
  subtotal?: number;
  createdAt?: string;
  updatedAt?: string;
  images: OrderProductImage[];
  tempImageBase64?: string[];
  imageIds?: number[];
}

export interface OrderProductImage {
  id?: number;
  imageId: number;
  imageUrl: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderStatusHistory {
  id: number;
  status: string;
  notes?: string;
  timestamp: string;
  updatedBy: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface OrderFormData {
  marketplaceId: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerAlternativePhone?: string;
  customerFacebookId?: string;
  deliveryChannel: string;
  deliveryCharge: number;
  deliveryDate: string;
  products: OrderProductFormData[];
}

export interface OrderProductFormData {
  id?: number;
  productType: string;
  fabricId: number;
  quantity: number;
  price: number;
  description?: string;
  imageIds?: number[];
  tempImageBase64?: string[];
  tempImages?: File[];
  tempFiles?: File[];
}

export interface OrderFilterParams {
  status?: string;
  startDate?: string;
  endDate?: string;
  marketplaceId?: number;
  customerName?: string;
  createdById?: number;
  page?: number;
  size?: number;
  sort?: string;
}

export interface OrderStatusCount {
  status: string;
  count: number;
}

export type OrderStatus = 'CREATED' | 'IN_PROGRESS' | 'IN_QA' | 'DELIVERED' | 'RETURNED' | 
                         'Created' | 'In Progress' | 'In QA' | 'Delivered' | 'Returned';

export const ORDER_STATUSES = {
  CREATED: 'CREATED',
  IN_PROGRESS: 'IN_PROGRESS',
  IN_QA: 'IN_QA',
  DELIVERED: 'DELIVERED',
  RETURNED: 'RETURNED',
  
  // Frontend display versions
  Created: 'Created',
  'In Progress': 'In Progress',
  'In QA': 'In QA',
  Delivered: 'Delivered',
  Returned: 'Returned'
};

export const STATUS_OPTIONS = [
  'CREATED',
  'IN_PROGRESS',
  'IN_QA',
  'DELIVERED',
  'RETURNED'
];

export const STATUS_DISPLAY_OPTIONS = [
  'Created',
  'In Progress',
  'In QA',
  'Delivered',
  'Returned'
];

export const ORDER_STATUS_COLORS = {
  CREATED: '#1890ff',
  IN_PROGRESS: '#faad14',
  IN_QA: '#722ed1',
  DELIVERED: '#52c41a',
  RETURNED: '#f5222d',
  
  // Frontend display versions
  Created: '#1890ff',
  'In Progress': '#faad14',
  'In QA': '#722ed1',
  Delivered: '#52c41a',
  Returned: '#f5222d'
};

export const DELIVERY_CHANNELS = [
  'Courier Service',
  'Self Pickup',
  'Home Delivery',
  'Third-party Delivery'
];

export const PRODUCT_TYPES = [
  'Shirt',
  'Pants',
  'Dress',
  'Skirt',
  'Blouse',
  'Jacket',
  'Coat',
  'Sweater',
  'T-shirt',
  'Jeans',
  'Suit',
  'Uniform',
  'Other'
];

export interface OrderRequest {
  marketplaceId: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerAlternativePhone?: string;
  customerFacebookId?: string;
  deliveryChannel: string;
  deliveryCharge: number;
  deliveryDate: string;
  products: OrderProductRequest[];
}

export interface OrderProductRequest {
  id?: number;
  productType: string;
  fabricId: number;
  quantity: number;
  price: number;
  description?: string;
  imageIds?: number[];
  tempImageBase64?: string[];
}
