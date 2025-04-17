import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormControlLabel,
  Switch,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  useTheme,
  alpha
} from '@mui/material';
import { 
  LocalOffer as TagIcon,
  CheckCircle as ActiveIcon
} from '@mui/icons-material';
import { FilterDialog, FilterTab } from '../common';
import { FabricFilterParams } from '../../hooks/useFabricFilters';

interface Tag {
  id: number;
  name: string;
}

interface FabricFilterDialogProps {
  open: boolean;
  onClose: () => void;
  onApplyFilter: (filters: Partial<FabricFilterParams>) => void;
  currentFilters: FabricFilterParams;
  tags: Tag[];
  loading?: boolean;
}

const FabricFilterDialog: React.FC<FabricFilterDialogProps> = ({
  open,
  onClose,
  onApplyFilter,
  currentFilters,
  tags,
  loading = false
}) => {
  const theme = useTheme();
  const [filters, setFilters] = useState<Partial<FabricFilterParams>>({});

  // Initialize filters from props
  useEffect(() => {
    if (open) {
      setFilters({
        activeOnly: currentFilters.activeOnly,
        tagIds: currentFilters.tagIds || []
      });
    }
  }, [currentFilters, open]);

  // Handle active only toggle
  const handleActiveOnlyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, activeOnly: e.target.checked }));
  };

  // Handle tag selection
  const handleTagChange = (event: SelectChangeEvent<string[]>) => {
    const { value } = event.target;
    setFilters(prev => ({
      ...prev,
      tagIds: typeof value === 'string' ? [value] : value
    }));
  };

  // Handle apply filter
  const handleApplyFilter = () => {
    onApplyFilter(filters);
    onClose();
  };

  // Handle clear filter
  const handleClearFilter = () => {
    const clearedFilters = {
      activeOnly: undefined,
      tagIds: []
    };
    setFilters(clearedFilters);
    onApplyFilter(clearedFilters);
    onClose();
  };

  // Count active filters
  const getActiveFilterCount = (): number => {
    let count = 0;
    if (filters.activeOnly) count++;
    if (filters.tagIds && filters.tagIds.length > 0) count++;
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
            Fabric Status
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
                  checked={!!filters.activeOnly}
                  onChange={handleActiveOnlyChange}
                  name="activeOnly"
                  color="success"
                />
              }
              label="Show active fabrics only"
            />
          </Box>
        </Box>
      )
    },
    {
      label: "Tags",
      icon: <TagIcon />,
      content: (
        <Box>
          <Typography variant="subtitle2" gutterBottom color="primary">
            Filter by Tags
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {tags.map((tag) => {
              const isSelected = filters.tagIds?.includes(tag.id.toString()) || false;
              return (
                <Chip
                  key={tag.id}
                  label={tag.name}
                  onClick={() => {
                    const currentTagIds = filters.tagIds || [];
                    const newTagIds = isSelected
                      ? currentTagIds.filter(id => id !== tag.id.toString())
                      : [...currentTagIds, tag.id.toString()];
                    setFilters(prev => ({ ...prev, tagIds: newTagIds }));
                  }}
                  color={isSelected ? 'primary' : 'default'}
                  variant={isSelected ? 'filled' : 'outlined'}
                  sx={{ 
                    borderRadius: theme.shape.borderRadius,
                    transition: 'all 0.2s',
                    '&:hover': {
                      boxShadow: isSelected ? 1 : 0,
                      bgcolor: isSelected ? 'primary.main' : alpha(theme.palette.primary.main, 0.1)
                    }
                  }}
                />
              );
            })}
          </Box>
          
          <FormControl fullWidth variant="outlined">
            <InputLabel id="tags-label">Selected Tags</InputLabel>
            <Select
              labelId="tags-label"
              id="tags"
              multiple
              value={filters.tagIds || []}
              onChange={handleTagChange}
              label="Selected Tags"
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => {
                    const tag = tags.find(t => t.id.toString() === value);
                    return (
                      <Chip 
                        key={value} 
                        label={tag ? tag.name : value} 
                        size="small"
                        sx={{ borderRadius: theme.shape.borderRadius }}
                      />
                    );
                  })}
                </Box>
              )}
            >
              {tags.map((tag) => (
                <MenuItem key={tag.id} value={tag.id.toString()}>
                  {tag.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
      title="Filter Fabrics"
      tabs={filterTabs}
      loading={loading}
      activeFilterCount={getActiveFilterCount()}
    />
  );
};

export default FabricFilterDialog;
