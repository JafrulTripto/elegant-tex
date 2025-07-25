import { Marketplace } from './marketplace';
import { Fabric } from './fabric';
import { Customer } from './customer';
import { OrderType } from './orderType';

export interface Order {
  id: number;
  orderNumber: string;
  orderType: OrderType;
  marketplace?: Marketplace;
  customer: Customer;
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
  orderType: OrderType;
  marketplaceId?: number;
  customerId?: number;
  customerData?: {
    name: string;
    phone: string;
    divisionId: number;
    districtId: number;
    upazilaId: number;
    addressLine: string;
    postalCode?: string;
    alternativePhone?: string;
    facebookId?: string;
  };
  customerValidation?: any; // Added for validation purposes
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
  existingImages?: OrderProductImage[];
}

export interface OrderFilterParams {
  orderType?: OrderType;
  status?: string;
  startDate?: string;
  endDate?: string;
  createdStartDate?: string;
  createdEndDate?: string;
  marketplaceId?: number;
  isDirectMerchant?: boolean;
  customerName?: string;
  orderNumber?: string;
  deliveryChannel?: string;
  minAmount?: number;
  maxAmount?: number;
  createdById?: number;
  page?: number;
  size?: number;
  sort?: string;
}

export interface OrderStatusCount {
  status: string;
  count: number;
}

export type OrderStatus = 
  'ORDER_CREATED' | 'APPROVED' | 'BOOKING' | 'PRODUCTION' | 
  'QA' | 'READY' | 'DELIVERED' | 'RETURNED' | 'CANCELLED' |
  'Order Created' | 'Approved' | 'Booking' | 'Production' | 
  'QA' | 'Ready' | 'Delivered' | 'Returned' | 'Cancelled';

export const ORDER_STATUSES = {
  // Backend versions
  ORDER_CREATED: 'ORDER_CREATED',
  APPROVED: 'APPROVED',
  BOOKING: 'BOOKING',
  PRODUCTION: 'PRODUCTION',
  QA: 'QA',
  READY: 'READY',
  DELIVERED: 'DELIVERED',
  RETURNED: 'RETURNED',
  CANCELLED: 'CANCELLED'
};

// Frontend display versions
export const ORDER_STATUS_DISPLAY = {
  'Order Created': 'Order Created',
  'Approved': 'Approved',
  'Booking': 'Booking',
  'Production': 'Production',
  'QA': 'QA',
  'Ready': 'Ready',
  'Delivered': 'Delivered',
  'Returned': 'Returned',
  'Cancelled': 'Cancelled'
};

export const STATUS_OPTIONS = [
  'ORDER_CREATED',
  'APPROVED',
  'BOOKING',
  'PRODUCTION',
  'QA',
  'READY',
  'DELIVERED',
  'RETURNED',
  'CANCELLED'
];

export const STATUS_DISPLAY_OPTIONS = [
  'Order Created',
  'Approved',
  'Booking',
  'Production',
  'QA',
  'Ready',
  'Delivered',
  'Returned',
  'Cancelled'
];

// Status colors are now managed in the statusConfig.ts utility

export const DELIVERY_CHANNELS = [
  'GCC Home Delivery',
  'DCC Home Delivery',
  'SteadFast Home Delivery (Without Fitting)',
  'RedX Home Delivery (Without Fitting)',
  'Pathao Home Delivery (Without Fitting)',
  'S A Paribahan (Office Pickup)',
  'Sundarban Courier Service (Office Pickup)',
  'Janani Courier Service (Office Pickup)',
  'Korotoa Courier Service (Office Pickup)',
];
// Product types are now managed in the database and accessed via API

export interface OrderRequest {
  orderType: OrderType;
  marketplaceId?: number;
  customerId?: number;
  customerData?: {
    name: string;
    phone: string;
    divisionId: number;
    districtId: number;
    upazilaId: number;
    addressLine: string;
    postalCode?: string;
    alternativePhone?: string;
    facebookId?: string;
  };
  customerValidation?: any; // Added for validation purposes
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
