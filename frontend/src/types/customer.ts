import { Address } from "./geographical";

export interface Customer {
  id: number;
  name: string;
  phone: string;
  alternativePhone?: string;
  facebookId?: string;
  address: Address;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerRequest {
  id?: number | undefined;
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

