export interface Division {
  id: number;
  name: string;
  bnName: string;
  url?: string;
  createdAt: string;
  updatedAt: string;
}

export interface District {
  id: number;
  division: Division;
  name: string;
  bnName: string;
  lat?: number;
  lon?: number;
  url?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Upazila {
  id: number;
  district: District;
  name: string;
  bnName: string;
  url?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: number;
  division: Division;
  district: District;
  upazila: Upazila;
  addressLine: string;
  postalCode?: string;
  landmark?: string;
  addressType: AddressType;
  createdAt: string;
  updatedAt: string;
}

export enum AddressType {
  PRIMARY = 'PRIMARY',
  SECONDARY = 'SECONDARY',
  SHIPPING = 'SHIPPING',
  BILLING = 'BILLING',
  OFFICE = 'OFFICE',
  HOME = 'HOME'
}

// For form handling
export interface AddressFormData {
  divisionId: number | null;
  districtId: number | null;
  upazilaId: number | null;
  addressLine: string;
  postalCode?: string;
  landmark?: string;
  addressType: AddressType;
}

// For dropdown options
export interface GeographicalOption {
  value: number;
  label: string;
  bnLabel: string;
}
