import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  SelectChangeEvent
} from '@mui/material';
import { BusinessUnit, BUSINESS_UNIT_OPTIONS } from '../../types/businessUnit';

interface BusinessUnitSelectorProps {
  value: BusinessUnit;
  onChange: (value: BusinessUnit) => void;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
}

const BusinessUnitSelector: React.FC<BusinessUnitSelectorProps> = ({
  value,
  onChange,
  error = false,
  helperText,
  disabled = false,
  required = false,
  size = 'medium',
  fullWidth = true
}) => {
  const handleChange = (event: SelectChangeEvent<string>) => {
    const selectedValue = event.target.value as BusinessUnit;
    onChange(selectedValue);
  };

  return (
    <FormControl 
      fullWidth={fullWidth} 
      error={error} 
      disabled={disabled}
      size={size}
      required={required}
    >
      <InputLabel id="business-unit-select-label">
        Business Unit{required && ' *'}
      </InputLabel>
      <Select
        labelId="business-unit-select-label"
        id="business-unit-select"
        value={value}
        label={`Business Unit${required ? ' *' : ''}`}
        onChange={handleChange}
      >
        {BUSINESS_UNIT_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      {helperText && (
        <FormHelperText>{helperText}</FormHelperText>
      )}
    </FormControl>
  );
};

export default BusinessUnitSelector;
