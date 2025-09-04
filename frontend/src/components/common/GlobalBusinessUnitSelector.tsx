import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Box,
  Typography
} from '@mui/material';
import { BUSINESS_UNIT_OPTIONS } from '../../types/businessUnit';

interface GlobalBusinessUnitSelectorProps {
  value?: string;
  onChange: (value: string | undefined) => void;
  size?: 'small' | 'medium';
}

const GlobalBusinessUnitSelector: React.FC<GlobalBusinessUnitSelectorProps> = ({
  value,
  onChange,
  size = 'small'
}) => {
  const handleChange = (event: SelectChangeEvent<string>) => {
    const selectedValue = event.target.value;
    onChange(selectedValue === 'ALL' ? undefined : selectedValue);
  };

  return (
    <Box display="flex" alignItems="center" gap={1}>
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', minWidth: 'fit-content' }}>
        Business Unit:
      </Typography>
      <FormControl size={size} sx={{ minWidth: 120 }}>
        <InputLabel id="global-business-unit-select-label" sx={{ fontSize: '0.8rem' }}>
          Business Unit
        </InputLabel>
        <Select
          labelId="global-business-unit-select-label"
          id="global-business-unit-select"
          value={value || 'ALL'}
          label="Business Unit"
          onChange={handleChange}
          sx={{ 
            fontSize: '0.8rem',
            '& .MuiSelect-select': {
              py: 0.75
            }
          }}
        >
          <MenuItem value="ALL" sx={{ fontSize: '0.8rem' }}>
            All Business Units
          </MenuItem>
          {BUSINESS_UNIT_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value} sx={{ fontSize: '0.8rem' }}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default GlobalBusinessUnitSelector;
