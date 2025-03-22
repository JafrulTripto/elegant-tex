import React from 'react';
import { 
  FormControl, 
  Select, 
  MenuItem, 
  SelectChangeEvent 
} from '@mui/material';
import { CalendarToday } from '@mui/icons-material';

export interface MonthSelectorOption {
  value: string;
  label: string;
  isFullYear?: boolean;
}

interface MonthYearSelectorProps {
  selectedValue: string;
  options: MonthSelectorOption[];
  onChange: (value: string, isFullYear: boolean) => void;
}

const MonthYearSelector: React.FC<MonthYearSelectorProps> = ({
  selectedValue,
  options,
  onChange
}) => {
  const handleChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    const selectedOption = options.find(option => option.value === value);
    onChange(value, selectedOption?.isFullYear || false);
  };

  return (
    <FormControl size="small">
      <Select
        value={selectedValue}
        onChange={handleChange}
        displayEmpty
        startAdornment={<CalendarToday fontSize="small" sx={{ mr: 1 }} />}
        sx={{ minWidth: 120 }}
      >
        {options.map(option => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default MonthYearSelector;
