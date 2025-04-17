import { useCallback, useMemo } from 'react';
import { useFilters, FilterParams } from './useFilters';
import { FilterChip } from '../components/common';

// Extend the base FilterParams for fabric-specific filters
export interface FabricFilterParams extends FilterParams {
  activeOnly?: boolean;
  tagIds?: string[];
}

export const useFabricFilters = (
  initialFilters?: Partial<FabricFilterParams>,
  onFilterChange?: (filters: FabricFilterParams) => void
) => {
  // Use the base useFilters hook
  const {
    filterParams,
    searchTerm,
    setSearchTerm,
    handleSearchSubmit,
    handlePageChange,
    handlePageSizeChange,
    handleSortChange,
    handleFilterApply,
    handleRemoveFilter,
    handleClearAllFilters,
    renderSortIcon
  } = useFilters(initialFilters, onFilterChange as (filters: FilterParams) => void);

  // Cast the filterParams to FabricFilterParams
  const fabricFilterParams = filterParams as FabricFilterParams;

  // Toggle active only filter
  const handleToggleActiveOnly = useCallback((value: boolean) => {
    handleFilterApply({ activeOnly: value });
  }, [handleFilterApply]);

  // Handle tag selection
  const handleTagSelection = useCallback((tagIds: string[]) => {
    handleFilterApply({ tagIds });
  }, [handleFilterApply]);

  // Get active filter chips for display
  const activeFilterChips = useMemo((): FilterChip[] => {
    const chips: FilterChip[] = [];

    // Add search filter chip
    if (fabricFilterParams.search) {
      chips.push({
        key: 'search',
        label: `Search: ${fabricFilterParams.search}`,
        color: 'primary'
      });
    }

    // Add active only filter chip
    if (fabricFilterParams.activeOnly) {
      chips.push({
        key: 'activeOnly',
        label: 'Active Only',
        color: 'success'
      });
    }

    // Add tag filter chips
    if (fabricFilterParams.tagIds && fabricFilterParams.tagIds.length > 0) {
      fabricFilterParams.tagIds.forEach(tagId => {
        chips.push({
          key: 'tagIds',
          value: tagId,
          label: `Tag: ${tagId}`,
          color: 'info'
        });
      });
    }

    return chips;
  }, [fabricFilterParams]);

  // Get active filter count
  const activeFilterCount = useMemo(() => {
    return activeFilterChips.length;
  }, [activeFilterChips]);

  return {
    filterParams: fabricFilterParams,
    searchTerm,
    setSearchTerm,
    handleSearchSubmit,
    handlePageChange,
    handlePageSizeChange,
    handleSortChange,
    handleFilterApply,
    handleRemoveFilter,
    handleClearAllFilters,
    renderSortIcon,
    handleToggleActiveOnly,
    handleTagSelection,
    activeFilterChips,
    activeFilterCount
  };
};
