import { User } from './index';

export interface Marketplace {
  id: number;
  name: string;
  pageUrl: string;
  imageId?: number;
  active: boolean;
  members: User[];
  createdAt: string;
  updatedAt: string;
}

export interface MarketplaceFormData {
  name: string;
  pageUrl: string;
  imageId?: number;
  active: boolean;
  memberIds: number[];
}
