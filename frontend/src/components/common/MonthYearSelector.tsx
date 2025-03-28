import React from 'react';
import { 
  FormControl, 
  Select, 
  MenuItem, 
  SelectChangeEvent,
  useTheme,
  useMediaQuery
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const handleChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    const selectedOption = options.find(option => option.value === value);
    onChange(value, selectedOption?.isFullYear || false);
  };

  // Get the selected option for display
  const selectedOption = options.find(option => option.value === selectedValue);
  
  // For mobile, we might want to show a shorter label
  const getDisplayLabel = (option: MonthSelectorOption) => {
    if (!isMobile) return option.label;
    
    // If it's a month label like "January 2025", shorten to "Jan 25"
    if (!option.isFullYear && option.label.includes(' ')) {
      const parts = option.label.split(' ');
      if (parts.length === 2) {
        const month = parts[0].substring(0, 3); // First 3 chars of month
        const year = parts[1].substring(2); // Last 2 digits of year
        return `${month} ${year}`;
      }
    }
    
    return option.isFullYear ? 'Full Year' : option.label;
  };

  return (
    <FormControl 
      size="small" 
      sx={{ 
        ml: { xs: 0, sm: 0.5 },
        width: { xs: '100%', sm: 'auto' }
      }}
    >
      <Select
        value={selectedValue}
        onChange={handleChange}
        displayEmpty
        startAdornment={
          <CalendarToday 
            sx={{ 
              mr: 0.5, 
              fontSize: { xs: '0.75rem', sm: '0.8rem' } 
            }} 
          />
        }
        sx={{ 
          minWidth: { xs: '100%', sm: 105 },
          height: { xs: 32, sm: 28 },
          fontSize: { xs: '0.7rem', sm: '0.75rem' },
          '& .MuiSelect-select': {
            paddingTop: '2px',
            paddingBottom: '2px',
            paddingRight: '20px',
            paddingLeft: '8px',
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
            borderWidth: '1px',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.primary.main,
          },
          '& .MuiSvgIcon-root': {
            fontSize: '1rem',
            right: '4px',
          }
        }}
      >
        {options.map(option => (
          <MenuItem 
            key={option.value} 
            value={option.value}
            sx={{ 
              fontSize: { xs: '0.7rem', sm: '0.75rem' },
              py: 0.5,
              minHeight: 'auto'
            }}
          >
            {getDisplayLabel(option)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default MonthYearSelector;
