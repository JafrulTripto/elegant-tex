import { Division, District, Upazila, Address } from './geographical';

export interface Customer {
  id: number;
  name: string;
  phone: string;
  address: string;
  alternativePhone?: string;
  facebookId?: string;
  createdAt: string;
  updatedAt: string;
  // Geographical address fields (optional for backward compatibility)
  division?: Division;
  district?: District;
  upazila?: Upazila;
  addressEntity?: Address;
  // Individual address components for display
  addressLine?: string;
  postalCode?: string;
  landmark?: string;
}

export interface CustomerRequest {
  name: string;
  phone: string;
  address: string;
  alternativePhone?: string;
  facebookId?: string;
  // Geographical address fields for new address system
  divisionId?: number | null;
  districtId?: number | null;
  upazilaId?: number | null;
  addressLine?: string;
  postalCode?: string;
  landmark?: string;
  useGeographicalAddress?: boolean;
}
