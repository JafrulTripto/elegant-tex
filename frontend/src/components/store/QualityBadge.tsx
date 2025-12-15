import React from 'react';
import { Chip } from '@mui/material';

const QualityBadge: React.FC<{ quality?: string | null }> = ({ quality }) => {
  const q = (quality || '').toUpperCase();
  const color = q === 'NEW' ? 'success'
    : q === 'GOOD' ? 'primary'
    : q === 'FAIR' ? 'warning'
    : q === 'DAMAGED' ? 'error'
    : 'default';
  return <Chip size="small" label={q ? q.replace('_', ' ') : '-'} color={color as any} variant="outlined"/>;
};

export default QualityBadge;
