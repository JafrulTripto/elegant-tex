import React from 'react';
import { 
  Box, 
  TextField, 
  InputAdornment, 
  IconButton, 
  useTheme, 
  Button, 
  Tooltip,
  alpha
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Clear as ClearIcon,
  FilterList as FilterIcon 
} from '@mui/icons-material';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  placeholder?: string;
  rightActions?: React.ReactNode;
  onFilterClick?: () => void;
  activeFilterCount?: number;
  showFilterButton?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  onSearchSubmit,
  placeholder = 'Search...',
  rightActions,
  onFilterClick,
  activeFilterCount = 0,
  showFilterButton = false
}) => {
  const theme = useTheme();

  // Create filter button component
  const filterButton = showFilterButton && onFilterClick ? (
    <InputAdornment position="end">
      <Box sx={{ 
        borderLeft: `1px solid ${alpha(theme.palette.text.primary, 0.2)}`,
        pl: 1,
        ml: 0.5
      }}>
        <Tooltip title="Filter">
          <Button
            onClick={onFilterClick}
            size="small"
            sx={{
              minWidth: 'auto',
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              position: 'relative',
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
              color: theme.palette.primary.contrastText,
              '&:hover': {
                background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                boxShadow: `0 2px 4px ${alpha(theme.palette.primary.main, 0.25)}`
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            <FilterIcon fontSize="small" sx={{ mr: 0.5 }} />
            Filters
            {activeFilterCount > 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  backgroundColor: theme.palette.secondary.main,
                  color: theme.palette.secondary.contrastText,
                  borderRadius: '50%',
                  width: 20,
                  height: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  boxShadow: `0 2px 4px ${alpha(theme.palette.common.black, 0.2)}`
                }}
              >
                {activeFilterCount}
              </Box>
            )}
          </Button>
        </Tooltip>
      </Box>
    </InputAdornment>
  ) : null;

  return (
    <Box
      component="form"
      onSubmit={onSearchSubmit}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        width: '100%'
      }}
    >
      <TextField
        fullWidth
        placeholder={placeholder}
        value={searchTerm}
        onChange={onSearchChange}
        variant="outlined"
        size="small"
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 1.25, // 5px (assuming 1 = 4px)
            transition: 'box-shadow 0.2s ease-in-out',
            '&:hover': {
              boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.1)}`
            },
            '&.Mui-focused': {
              boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.15)}`
            }
          }
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: (
            <>
              {searchTerm && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => {
                      const event = {
                        target: { value: '' }
                      } as React.ChangeEvent<HTMLInputElement>;
                      onSearchChange(event);
                    }}
                    edge={showFilterButton ? undefined : "end"}
                    aria-label="clear search"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              )}
              {filterButton}
            </>
          )
        }}
      />
      
      {rightActions && !showFilterButton && (
        <Box sx={{ flexShrink: 0 }}>
          {rightActions}
        </Box>
      )}
    </Box>
  );
};

export default SearchBar;
