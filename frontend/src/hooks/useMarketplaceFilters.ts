import { useCallback, useMemo } from 'react';
import { useFilters, FilterParams } from './useFilters';
import { FilterChip } from '../components/common';

// Extend the base FilterParams for marketplace-specific filters
export interface MarketplaceFilterParams extends FilterParams {
  active?: boolean;
}

export const useMarketplaceFilters = (
  initialFilters?: Partial<MarketplaceFilterParams>,
  onFilterChange?: (filters: MarketplaceFilterParams) => void
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

  // Cast the filterParams to MarketplaceFilterParams
  const marketplaceFilterParams = filterParams as MarketplaceFilterParams;

  // Toggle active filter
  const handleToggleActive = useCallback((value: boolean | undefined) => {
    handleFilterApply({ active: value });
  }, [handleFilterApply]);

  // Get active filter chips for display
  const activeFilterChips = useMemo((): FilterChip[] => {
    const chips: FilterChip[] = [];

    // Add search filter chip
    if (marketplaceFilterParams.search) {
      chips.push({
        key: 'search',
        label: `Search: ${marketplaceFilterParams.search}`,
        color: 'primary'
      });
    }

    // Add active filter chip
    if (marketplaceFilterParams.active !== undefined) {
      chips.push({
        key: 'active',
        label: marketplaceFilterParams.active ? 'Active Only' : 'All Statuses',
        color: marketplaceFilterParams.active ? 'success' : 'default'
      });
    }

    return chips;
  }, [marketplaceFilterParams]);

  // Get active filter count
  const activeFilterCount = useMemo(() => {
    return activeFilterChips.length;
  }, [activeFilterChips]);

  return {
    filterParams: marketplaceFilterParams,
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
    handleToggleActive,
    activeFilterChips,
    activeFilterCount
  };
};
