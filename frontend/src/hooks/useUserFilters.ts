import { useCallback, useMemo } from 'react';
import { useFilters, FilterParams } from './useFilters';
import { FilterChip } from '../components/common';

// Extend the base FilterParams for user-specific filters
export interface UserFilterParams extends FilterParams {
  emailVerified?: boolean;
  accountVerified?: boolean;
  roles?: string[];
}

export const useUserFilters = (
  initialFilters?: Partial<UserFilterParams>,
  onFilterChange?: (filters: UserFilterParams) => void
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

  // Cast the filterParams to UserFilterParams
  const userFilterParams = filterParams as UserFilterParams;

  // Toggle email verified filter
  const handleToggleEmailVerified = useCallback((value: boolean | undefined) => {
    handleFilterApply({ emailVerified: value });
  }, [handleFilterApply]);

  // Toggle account verified filter
  const handleToggleAccountVerified = useCallback((value: boolean | undefined) => {
    handleFilterApply({ accountVerified: value });
  }, [handleFilterApply]);

  // Handle role selection
  const handleRoleSelection = useCallback((roles: string[]) => {
    handleFilterApply({ roles });
  }, [handleFilterApply]);

  // Get active filter chips for display
  const activeFilterChips = useMemo((): FilterChip[] => {
    const chips: FilterChip[] = [];

    // Add search filter chip
    if (userFilterParams.search) {
      chips.push({
        key: 'search',
        label: `Search: ${userFilterParams.search}`,
        color: 'primary'
      });
    }

    // Add email verified filter chip
    if (userFilterParams.emailVerified !== undefined) {
      chips.push({
        key: 'emailVerified',
        label: userFilterParams.emailVerified ? 'Email Verified' : 'Email Not Verified',
        color: userFilterParams.emailVerified ? 'success' : 'error'
      });
    }

    // Add account verified filter chip
    if (userFilterParams.accountVerified !== undefined) {
      chips.push({
        key: 'accountVerified',
        label: userFilterParams.accountVerified ? 'Active Accounts' : 'Inactive Accounts',
        color: userFilterParams.accountVerified ? 'success' : 'error'
      });
    }

    // Add role filter chips
    if (userFilterParams.roles && userFilterParams.roles.length > 0) {
      userFilterParams.roles.forEach(role => {
        chips.push({
          key: 'roles',
          value: role,
          label: `Role: ${role.replace('ROLE_', '')}`,
          color: 'info'
        });
      });
    }

    return chips;
  }, [userFilterParams]);

  // Get active filter count
  const activeFilterCount = useMemo(() => {
    return activeFilterChips.length;
  }, [activeFilterChips]);

  return {
    filterParams: userFilterParams,
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
    handleToggleEmailVerified,
    handleToggleAccountVerified,
    handleRoleSelection,
    activeFilterChips,
    activeFilterCount
  };
};
