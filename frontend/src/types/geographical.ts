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

// For dropdown options
export interface GeographicalOption {
  value: number;
  label: string;
  bnLabel: string;
}

// For address form data
export interface AddressFormData {
  divisionId: number | null;
  districtId: number | null;
  upazilaId: number | null;
  addressLine: string;
  postalCode?: string;
}
export interface Address {
  id: number;
  divisionId: number;
  districtId: number;
  upazilaId: number;
  addressLine: string;
  postalCode?: string;
  formattedAddress: string;
  createdAt: string;
  updatedAt: string;
}
