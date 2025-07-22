export interface Customer {
  id: number;
  name: string;
  phone: string;
  alternativePhone?: string;
  facebookId?: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerRequest {
  name: string;
  phone: string;
  divisionId: number;
  districtId: number;
  upazilaId: number;
  addressLine: string;
  postalCode?: string;
  alternativePhone?: string;
  facebookId?: string;
}

