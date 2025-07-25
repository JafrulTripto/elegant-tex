import { useMemo } from 'react';
import { useFilters, FilterParams } from './useFilters';
import { FilterChip } from '../components/common';
import { CustomerType } from '../types/customer';

// Extend the base FilterParams for customer-specific filters
export interface CustomerFilterParams extends FilterParams {
  customerType?: CustomerType;
}

export const useCustomerFilters = (
  initialFilters?: Partial<CustomerFilterParams>,
  onFilterChange?: (filters: CustomerFilterParams) => void
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

  // Cast the filterParams to CustomerFilterParams
  const customerFilterParams = filterParams as CustomerFilterParams;

  // Get active filter chips for display
  const activeFilterChips = useMemo((): FilterChip[] => {
    const chips: FilterChip[] = [];

    // Add search filter chip
    if (customerFilterParams.search) {
      chips.push({
        key: 'search',
        label: `Search: ${customerFilterParams.search}`,
        color: 'primary'
      });
    }

    // Add customer type filter chip
    if (customerFilterParams.customerType) {
      chips.push({
        key: 'customerType',
        label: `Type: ${customerFilterParams.customerType}`,
        color: 'secondary'
      });
    }

    return chips;
  }, [customerFilterParams]);

  // Get active filter count
  const activeFilterCount = useMemo(() => {
    return activeFilterChips.length;
  }, [activeFilterChips]);

  return {
    filterParams: customerFilterParams,
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
    activeFilterChips,
    activeFilterCount
  };
};
