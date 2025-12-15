import { Fabric } from './fabric';

export type StoreItemQuality = 'NEW' | 'GOOD' | 'FAIR' | 'DAMAGED' | 'WRITE_OFF';
export type StoreItemSource = 'RETURNED_ORDER' | 'CANCELLED_ORDER' | 'MANUAL_ENTRY';

export interface StoreItemImage {
  id: number;
  imageId: number;
  imageUrl: string;
}

export interface StoreUserBasic {
  id: number;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface StoreProductTypeBasic {
  id: number;
  name: string;
}

export interface StoreTransaction {
  id: number;
  transactionType: 'RECEIVE' | 'USE' | 'ADJUST' | 'QUALITY_CHANGE' | 'WRITE_OFF';
  quantity: number;
  qualityBefore?: StoreItemQuality | null;
  qualityAfter?: StoreItemQuality | null;
  notes?: string;
  performedBy?: StoreUserBasic;
  transactionDate: string;
}

export interface StoreItem {
  id: number;
  sku: string;
  fabric: {
    id: number;
    name: string;
    fabricCode: string;
  };
  productType: StoreProductTypeBasic;
  styleCode?: string | null;
  quantity: number;
  quality: StoreItemQuality;
  sourceType: StoreItemSource;
  sourceOrderProductId?: number | null;
  sourceOrderNumber?: string | null;
  originalPrice?: number | null;
  notes?: string | null;
  addedBy?: StoreUserBasic | null;
  images: StoreItemImage[];
  recentTransactions: StoreTransaction[];
  createdAt: string;
  updatedAt: string;
}

export interface StoreStatistics {
  totalItems: number;
  totalQuantity: number;
  totalValue: number;
  itemsWithStock: number;
  countByQuality: Record<string, number>;
  countBySource: Record<string, number>;
  pendingApprovals: number;
  recentTransactions: number;
}

export interface ManualStoreItemRequest {
  fabricId: number;
  productTypeId: number;
  quantity: number;
  quality: StoreItemQuality | string;
  reason?: string;
  notes?: string;
}

export interface StoreAdjustment {
  id: number;
  storeItem?: { id: number; sku: string } | null;
  fabric?: { id: number; name: string; fabricCode: string } | null;
  productType?: { id: number; name: string } | null;
  requestedQuantity: number;
  currentQuantity?: number;
  quality: StoreItemQuality;
  adjustmentType: 'MANUAL_ENTRY' | 'CORRECTION' | string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reason?: string;
  notes?: string;
  requestedBy?: StoreUserBasic;
  approvedBy?: StoreUserBasic | null;
  requestedAt: string;
  reviewedAt?: string | null;
}

export interface StoreItemFilterParams {
  fabricId?: number;
  productTypeId?: number;
  quality?: StoreItemQuality | string;
  sourceType?: StoreItemSource | string;
  sku?: string;
  onlyWithStock?: boolean;
  page?: number;
  size?: number;
  sort?: string;
}

export const STORE_QUALITIES: StoreItemQuality[] = ['NEW', 'GOOD', 'FAIR', 'DAMAGED', 'WRITE_OFF'];
export const STORE_SOURCES: StoreItemSource[] = ['RETURNED_ORDER', 'CANCELLED_ORDER', 'MANUAL_ENTRY'];
