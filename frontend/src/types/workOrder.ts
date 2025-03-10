import { User } from '.';

export interface WorkOrder {
  id: number;
  woNumber: string;
  workType: string;
  client: string;
  photoCount?: number;
  state?: string;
  clientDueDate: string;
  updater?: string;
  orderStatus: string;
  remarkCategory?: string;
  startTime?: string;
  endTime?: string;
  numberOfBids?: number;
  bidAmount?: number;
  isRush: boolean;
  user?: User;
  createdAt: string;
  updatedAt: string;
}

export interface WorkOrderStats {
  submitted: number;
  gcSnSubmitted: number;
  rtvFixed: number;
  saved: number;
  totalProcessed: number;
}

export interface WorkOrderFilter {
  woNumber?: string;
  workType?: string;
  client?: string;
  state?: string;
  orderStatus?: string;
  updater?: string;
  isRush?: boolean;
  startDate?: string;
  endDate?: string;
  userId?: number;
}

export interface WorkOrderRequest {
  woNumber: string;
  workType: string;
  client: string;
  photoCount?: number;
  state?: string;
  clientDueDate: string;
  updater?: string;
  orderStatus: string;
  remarkCategory?: string;
  startTime?: string;
  endTime?: string;
  numberOfBids?: number;
  bidAmount?: number;
  isRush: boolean;
  userId?: number;
}

export interface WorkOrdersPageState {
  workOrders: WorkOrder[];
  stats: WorkOrderStats;
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  rowsPerPage: number;
  sortBy: string;
  sortDir: string;
  filters: WorkOrderFilter;
  selectedWorkOrder: WorkOrder | null;
  openDialog: boolean;
}
