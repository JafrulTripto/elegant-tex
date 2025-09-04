/**
 * Business Unit types for order separation
 */

export enum BusinessUnit {
  MIRPUR = 'MIRPUR',
  TONGI = 'TONGI'
}

export interface BusinessUnitOption {
  value: BusinessUnit;
  label: string;
}

export const BUSINESS_UNIT_OPTIONS: BusinessUnitOption[] = [
  { value: BusinessUnit.MIRPUR, label: 'Mirpur' },
  { value: BusinessUnit.TONGI, label: 'Tongi' }
];

export const getBusinessUnitLabel = (businessUnit: BusinessUnit): string => {
  const option = BUSINESS_UNIT_OPTIONS.find(opt => opt.value === businessUnit);
  return option?.label || businessUnit;
};

export const getBusinessUnitFromString = (value: string): BusinessUnit | null => {
  return Object.values(BusinessUnit).find(unit => unit === value) || null;
};
