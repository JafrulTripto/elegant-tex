import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormControlLabel,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  useTheme,
  alpha
} from '@mui/material';
import { 
  CheckCircle as ActiveIcon,
  Sort as SortIcon
} from '@mui/icons-material';
import { FilterDialog, FilterTab } from '../common';
import { MarketplaceFilterParams } from '../../hooks/useMarketplaceFilters';

interface MarketplaceFilterDialogProps {
  open: boolean;
  onClose: () => void;
  onApplyFilter: (filters: Partial<MarketplaceFilterParams>) => void;
  currentFilters: MarketplaceFilterParams;
  loading?: boolean;
}

const MarketplaceFilterDialog: React.FC<MarketplaceFilterDialogProps> = ({
  open,
  onClose,
  onApplyFilter,
  currentFilters,
  loading = false
}) => {
  const theme = useTheme();
  const [filters, setFilters] = useState<Partial<MarketplaceFilterParams>>({});

  // Initialize filters from props
  useEffect(() => {
    if (open) {
      setFilters({
        active: currentFilters.active,
        sortBy: currentFilters.sortBy || 'id',
        sortDir: currentFilters.sortDir || 'asc'
      });
    }
  }, [currentFilters, open]);

  // Handle active only toggle
  const handleActiveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, active: e.target.checked ? true : undefined }));
  };

  // Handle sort by change
  const handleSortByChange = (event: SelectChangeEvent) => {
    setFilters(prev => ({ ...prev, sortBy: event.target.value }));
  };

  // Handle sort direction change
  const handleSortDirChange = (event: SelectChangeEvent) => {
    setFilters(prev => ({ ...prev, sortDir: event.target.value as 'asc' | 'desc' }));
  };

  // Handle apply filter
  const handleApplyFilter = () => {
    onApplyFilter(filters);
    onClose();
  };

  // Handle clear filter
  const handleClearFilter = () => {
    const clearedFilters: Partial<MarketplaceFilterParams> = {
      active: undefined,
      sortBy: 'id',
      sortDir: 'asc'
    };
    setFilters(clearedFilters);
    onApplyFilter(clearedFilters);
    onClose();
  };

  // Count active filters
  const getActiveFilterCount = (): number => {
    let count = 0;
    if (filters.active !== undefined) count++;
    if (filters.sortBy && filters.sortBy !== 'id') count++;
    if (filters.sortDir && filters.sortDir !== 'asc') count++;
    return count;
  };

  // Create filter tabs
  const filterTabs: FilterTab[] = [
    {
      label: "Status",
      icon: <ActiveIcon />,
      content: (
        <Box>
          <Typography variant="subtitle2" gutterBottom color="primary">
            Marketplace Status
          </Typography>
          
          <Box sx={{ 
            p: 2, 
            borderRadius: theme.shape.borderRadius,
            bgcolor: alpha(theme.palette.success.main, 0.05),
            border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
          }}>
            <FormControlLabel
              control={
                <Switch
                  checked={!!filters.active}
                  onChange={handleActiveChange}
                  name="active"
                  color="success"
                />
              }
              label="Show active marketplaces only"
            />
          </Box>
        </Box>
      )
    },
    {
      label: "Sorting",
      icon: <SortIcon />,
      content: (
        <Box>
          <Typography variant="subtitle2" gutterBottom color="primary">
            Sort Options
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="sort-by-label">Sort By</InputLabel>
              <Select
                labelId="sort-by-label"
                id="sort-by"
                value={filters.sortBy || 'id'}
                onChange={handleSortByChange}
                label="Sort By"
              >
                <MenuItem value="id">ID</MenuItem>
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="createdAt">Created Date</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth variant="outlined">
              <InputLabel id="sort-dir-label">Sort Direction</InputLabel>
              <Select
                labelId="sort-dir-label"
                id="sort-dir"
                value={filters.sortDir || 'asc'}
                onChange={handleSortDirChange}
                label="Sort Direction"
              >
                <MenuItem value="asc">Ascending</MenuItem>
                <MenuItem value="desc">Descending</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      )
    }
  ];

  return (
    <FilterDialog
      open={open}
      onClose={onClose}
      onApplyFilter={handleApplyFilter}
      onClearFilter={handleClearFilter}
      title="Filter Marketplaces"
      tabs={filterTabs}
      loading={loading}
      activeFilterCount={getActiveFilterCount()}
    />
  );
};

export default MarketplaceFilterDialog;
