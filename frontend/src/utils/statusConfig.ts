import { PaletteMode } from '@mui/material';

// Define all possible order statuses
export type OrderStatusType = 
  'ORDER_CREATED' | 'APPROVED' | 'BOOKING' | 'PRODUCTION' | 
  'QA' | 'READY' | 'DELIVERED' | 'RETURNED' | 'CANCELLED' |
  'Order Created' | 'Approved' | 'Booking' | 'Production' | 
  'QA' | 'Ready' | 'Delivered' | 'Returned' | 'Cancelled';

// Define color configuration for each status
interface StatusColorConfig {
  light: string;  // Color for light theme
  dark: string;   // Color for dark theme
  contrastText: string; // Text color that works on both backgrounds
}

// Define complete status configuration
interface StatusConfig {
  colors: StatusColorConfig;
  label: string;
  backendValue: string;
  displayValue: string;
}

// Map of all status configurations
const STATUS_CONFIGS: Record<string, StatusConfig> = {
  // Backend versions
  ORDER_CREATED: {
    colors: {
      light: '#1890ff',
      dark: '#177ddc',
      contrastText: '#ffffff'
    },
    label: 'Order Created',
    backendValue: 'ORDER_CREATED',
    displayValue: 'Order Created'
  },
  APPROVED: {
    colors: {
      light: '#13c2c2',
      dark: '#08979c',
      contrastText: '#ffffff'
    },
    label: 'Approved',
    backendValue: 'APPROVED',
    displayValue: 'Approved'
  },
  BOOKING: {
    colors: {
      light: '#722ed1',
      dark: '#531dab',
      contrastText: '#ffffff'
    },
    label: 'Booking',
    backendValue: 'BOOKING',
    displayValue: 'Booking'
  },
  PRODUCTION: {
    colors: {
      light: '#eb2f96',
      dark: '#c41d7f',
      contrastText: '#ffffff'
    },
    label: 'Production',
    backendValue: 'PRODUCTION',
    displayValue: 'Production'
  },
  QA: {
    colors: {
      light: '#faad14',
      dark: '#d48806',
      contrastText: '#000000'
    },
    label: 'QA',
    backendValue: 'QA',
    displayValue: 'QA'
  },
  READY: {
    colors: {
      light: '#a0d911',
      dark: '#7cb305',
      contrastText: '#000000'
    },
    label: 'Ready',
    backendValue: 'READY',
    displayValue: 'Ready'
  },
  DELIVERED: {
    colors: {
      light: '#52c41a',
      dark: '#389e0d',
      contrastText: '#ffffff'
    },
    label: 'Delivered',
    backendValue: 'DELIVERED',
    displayValue: 'Delivered'
  },
  RETURNED: {
    colors: {
      light: '#fa8c16',
      dark: '#d46b08',
      contrastText: '#ffffff'
    },
    label: 'Returned',
    backendValue: 'RETURNED',
    displayValue: 'Returned'
  },
  CANCELLED: {
    colors: {
      light: '#f5222d',
      dark: '#cf1322',
      contrastText: '#ffffff'
    },
    label: 'Cancelled',
    backendValue: 'CANCELLED',
    displayValue: 'Cancelled'
  }
};

// Map for looking up configs by display value
const DISPLAY_TO_BACKEND_MAP: Record<string, string> = {
  'Order Created': 'ORDER_CREATED',
  'Approved': 'APPROVED',
  'Booking': 'BOOKING',
  'Production': 'PRODUCTION',
  'QA': 'QA',
  'Ready': 'READY',
  'Delivered': 'DELIVERED',
  'Returned': 'RETURNED',
  'Cancelled': 'CANCELLED'
};

// Helper functions
export const getStatusColor = (status: string, mode: PaletteMode): string => {
  // Check if the status is a display value and convert to backend value if needed
  const backendStatus = DISPLAY_TO_BACKEND_MAP[status] || status;
  const config = STATUS_CONFIGS[backendStatus] || STATUS_CONFIGS['ORDER_CREATED'];
  return mode === 'light' ? config.colors.light : config.colors.dark;
};

export const getStatusContrastText = (status: string): string => {
  // Check if the status is a display value and convert to backend value if needed
  const backendStatus = DISPLAY_TO_BACKEND_MAP[status] || status;
  const config = STATUS_CONFIGS[backendStatus] || STATUS_CONFIGS['ORDER_CREATED'];
  return config.colors.contrastText;
};

export const getDisplayStatus = (backendStatus: string): string => {
  const config = STATUS_CONFIGS[backendStatus];
  return config ? config.displayValue : backendStatus;
};

export const getBackendStatus = (displayStatus: string): string => {
  return DISPLAY_TO_BACKEND_MAP[displayStatus] || displayStatus;
};

// Export the status configurations for direct access if needed
export const STATUS_CONFIGS_MAP = STATUS_CONFIGS;

// Export backend and frontend status arrays for convenience
export const BACKEND_STATUSES = [
  'ORDER_CREATED',
  'APPROVED',
  'BOOKING',
  'PRODUCTION',
  'QA',
  'READY',
  'DELIVERED',
  'RETURNED',
  'CANCELLED'
];

export const DISPLAY_STATUSES = [
  'Order Created',
  'Approved',
  'Booking',
  'Production',
  'QA',
  'Ready',
  'Delivered',
  'Returned',
  'Cancelled'
];
