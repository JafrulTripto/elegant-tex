import { Division, District, Upazila, Address } from './geographical';

export interface Customer {
  id: number;
  name: string;
  phone: string;
  alternativePhone?: string;
  facebookId?: string;
  createdAt: string;
  updatedAt: string;
  // Geographical address fields
  division?: Division;
  district?: District;
  upazila?: Upazila;
  addressEntity?: Address;
  // Individual address components for display
  addressLine?: string;
  postalCode?: string;
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

export type CustomerResponse = {
  id: number;
  name: string;
  phone: string;
  address: string;
  alternativePhone: string;
  facebookId: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
};

