export interface Customer {
  id: number;
  name: string;
  phone: string;
  address: string;
  alternativePhone?: string;
  facebookId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerRequest {
  name: string;
  phone: string;
  address: string;
  alternativePhone?: string;
  facebookId?: string;
}
