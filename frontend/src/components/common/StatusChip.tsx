import React from 'react';
import { Chip } from '@mui/material';

export type StatusType = 'active' | 'inactive' | 'pending' | 'completed' | 'cancelled' | 'processing' | 'error' | 'success' | 'warning' | 'info';

interface StatusChipProps {
  status: StatusType;
  customLabel?: string;
  size?: 'small' | 'medium';
  variant?: 'filled' | 'outlined';
}

const StatusChip: React.FC<StatusChipProps> = ({
  status,
  customLabel,
  size = 'small',
  variant = 'filled'
}) => {
  
  // Define status colors and labels
  const statusConfig: Record<StatusType, { color: string, label: string }> = {
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
  
  const { color, label } = statusConfig[status];
  
  return (
    <Chip
      label={customLabel || label}
      color={color as any}
      size={size}
      variant={variant}
      sx={{
        fontWeight: 500,
        borderRadius: 1.25,
        textTransform: 'capitalize'
      }}
    />
  );
};

export default StatusChip;
