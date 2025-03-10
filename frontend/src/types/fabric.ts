import { Tag } from './tag';

export interface Fabric {
  id: number;
  name: string;
  imageId?: number;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
}

export interface FabricFormData {
  name: string;
  imageId?: number;
  tagNames: string[];
}
