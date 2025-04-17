import React from 'react';
import { Box, Chip, Button, useTheme } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

export interface FilterChip {
  key: string;
  label: string;
  value?: string;
  color?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
}

interface FilterChipsProps {
  filters: FilterChip[];
  onRemoveFilter: (key: string, value?: string) => void;
  onClearAll: () => void;
}

const FilterChips: React.FC<FilterChipsProps> = ({
  filters,
  onRemoveFilter,
  onClearAll
}) => {
  const theme = useTheme();

  if (filters.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 1,
        mt: 1.5
      }}
    >
      {filters.map((filter, index) => (
        <Chip
          key={`${filter.key}-${filter.value || index}`}
          label={filter.label}
          color={filter.color || 'default'}
          onDelete={() => onRemoveFilter(filter.key, filter.value)}
          deleteIcon={<CloseIcon fontSize="small" />}
          size="small"
          sx={{
            borderRadius: theme.shape.borderRadius,
            fontWeight: 500,
            '& .MuiChip-deleteIcon': {
              color: 'inherit',
              opacity: 0.7,
              '&:hover': {
                opacity: 1
              }
            }
          }}
        />
      ))}
      
      {filters.length > 1 && (
        <Button
          variant="text"
          color="inherit"
          size="small"
          onClick={onClearAll}
          sx={{
            fontSize: '0.75rem',
            ml: 1,
            textTransform: 'none',
            color: theme.palette.text.secondary,
            '&:hover': {
              backgroundColor: 'transparent',
              color: theme.palette.text.primary
            }
          }}
        >
          Clear All
        </Button>
      )}
    </Box>
  );
};

export default FilterChips;
