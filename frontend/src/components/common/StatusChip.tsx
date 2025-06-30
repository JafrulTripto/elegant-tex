import React from 'react';
import { Chip, useTheme, SxProps, Theme } from '@mui/material';
import { getStatusColor, getStatusContrastText, getDisplayStatus } from '../../utils/statusConfig';

// Generic status types for non-order statuses
export type GenericStatusType = 'active' | 'inactive' | 'pending' | 'completed' | 'cancelled' | 'processing' | 'error' | 'success' | 'warning' | 'info';

// Combined status type that can be either a generic status or any order status
export type StatusType = GenericStatusType | string;

interface StatusChipProps {
  status: StatusType;
  customLabel?: string;
  size?: 'small' | 'medium';
  variant?: 'filled' | 'outlined';
  isOrderStatus?: boolean;
  sx?: SxProps<Theme>;
}

const StatusChip: React.FC<StatusChipProps> = ({
  status,
  customLabel,
  size = 'small',
  variant = 'filled',
  isOrderStatus = false,
  sx
}) => {
  const theme = useTheme();
  
  // Define generic status colors and labels (for non-order statuses)
  const genericStatusConfig: Record<GenericStatusType, { color: string, label: string }> = {
    active: { color: 'success', label: 'Active' },
    inactive: { color: 'error', label: 'Inactive' },
    pending: { color: 'warning', label: 'Pending' },
    completed: { color: 'success', label: 'Completed' },
    cancelled: { color: 'error', label: 'Cancelled' },
    processing: { color: 'info', label: 'Processing' },
    error: { color: 'error', label: 'Error' },
    success: { color: 'success', label: 'Success' },
    warning: { color: 'warning', label: 'Warning' },
    info: { color: 'info', label: 'Info' }
  };
  
  // If it's an order status, use our centralized status configuration
  if (isOrderStatus) {
    const displayLabel = customLabel || getDisplayStatus(status);
    const backgroundColor = getStatusColor(status, theme.palette.mode);
    const textColor = getStatusContrastText(status);
    
    return (
      <Chip
        label={displayLabel}
        size={size}
        variant={variant}
        sx={{
          backgroundColor,
          color: textColor,
          fontWeight: 500,
          borderRadius: 1.25,
          textTransform: 'capitalize',
          ...sx
        }}
      />
    );
  }
  
  // For generic statuses, use the original approach
  const statusKey = status as GenericStatusType;
  const { color, label } = genericStatusConfig[statusKey] || 
    { color: 'default', label: status };
  
  return (
    <Chip
      label={customLabel || label}
      color={color as any}
      size={size}
      variant={variant}
        sx={{
          fontWeight: 500,
          borderRadius: 1.25,
          textTransform: 'capitalize',
          ...sx
        }}
    />
  );
};

export default StatusChip;
