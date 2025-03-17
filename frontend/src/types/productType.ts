export interface ProductType {
  id: number;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductTypeFormData {
  name: string;
  active: boolean;
}
