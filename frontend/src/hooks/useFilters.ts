import { useState, useCallback } from 'react';

export interface FilterParams {
  search?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  [key: string]: any;
}

export const useFilters = (
  initialFilters?: Partial<FilterParams>,
  onFilterChange?: (filters: FilterParams) => void
) => {
  // State for search term
  const [searchTerm, setSearchTerm] = useState<string>(initialFilters?.search || '');
  
  // State for filter parameters
  const [filterParams, setFilterParams] = useState<FilterParams>({
    search: initialFilters?.search,
    page: initialFilters?.page || 0,
    size: initialFilters?.size || 10,
    sortBy: initialFilters?.sortBy || 'id',
    sortDir: initialFilters?.sortDir || 'asc',
    ...initialFilters
  });

  // Handle search form submit
  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setFilterParams(prev => ({
      ...prev,
      search: searchTerm || undefined,
      page: 0 // Reset to first page when searching
    }));
    
    if (onFilterChange) {
      onFilterChange({
        ...filterParams,
        search: searchTerm || undefined,
        page: 0
      });
    }
  }, [searchTerm, filterParams, onFilterChange]);

  // Handle page change
  const handlePageChange = useCallback((_: React.ChangeEvent<unknown>, page: number) => {
    const newParams = {
      ...filterParams,
      page: page - 1 // MUI Pagination is 1-indexed, but our API is 0-indexed
    };
    
    setFilterParams(newParams);
    
    if (onFilterChange) {
      onFilterChange(newParams);
    }
  }, [filterParams, onFilterChange]);

  // Handle page size change
  const handlePageSizeChange = useCallback((event: React.ChangeEvent<{ value: unknown }>) => {
    const newSize = parseInt(event.target.value as string, 10);
    const newParams = {
      ...filterParams,
      size: newSize,
      page: 0 // Reset to first page when changing page size
    };
    
    setFilterParams(newParams);
    
    if (onFilterChange) {
      onFilterChange(newParams);
    }
  }, [filterParams, onFilterChange]);

  // Handle sort change
  const handleSortChange = useCallback((column: string) => {
    const newParams = { ...filterParams };
    
    // If already sorting by this column, toggle direction
    if (newParams.sortBy === column) {
      newParams.sortDir = newParams.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      // Otherwise, sort by the new column in ascending order
      newParams.sortBy = column;
      newParams.sortDir = 'asc';
    }
    
    // Reset to first page when changing sort
    newParams.page = 0;
    
    setFilterParams(newParams);
    
    if (onFilterChange) {
      onFilterChange(newParams);
    }
  }, [filterParams, onFilterChange]);

  // Apply filter
  const handleFilterApply = useCallback((newFilters: Partial<FilterParams>) => {
    const newParams = {
      ...filterParams,
      ...newFilters,
      page: 0 // Reset to first page when applying filters
    };
    
    setFilterParams(newParams);
    
    if (onFilterChange) {
      onFilterChange(newParams);
    }
  }, [filterParams, onFilterChange]);

  // Remove filter
  const handleRemoveFilter = useCallback((key: string, value?: string) => {
    const newParams = { ...filterParams };
    
    if (key === 'search') {
      newParams.search = undefined;
      setSearchTerm('');
    } else if (Array.isArray(newParams[key]) && value) {
      // If it's an array filter (like roles), remove just the specific value
      newParams[key] = (newParams[key] as any[]).filter(item => item !== value);
      if (newParams[key].length === 0) {
        newParams[key] = undefined;
      }
    } else {
      // For boolean or other simple filters, just remove the key
      newParams[key] = undefined;
    }
    
    // Reset to first page when removing filters
    newParams.page = 0;
    
    setFilterParams(newParams);
    
    if (onFilterChange) {
      onFilterChange(newParams);
    }
  }, [filterParams, onFilterChange]);

  // Clear all filters
  const handleClearAllFilters = useCallback(() => {
    const clearedParams: FilterParams = {
      page: 0,
      size: filterParams.size,
      sortBy: filterParams.sortBy,
      sortDir: filterParams.sortDir
    };
    
    setFilterParams(clearedParams);
    setSearchTerm('');
    
    if (onFilterChange) {
      onFilterChange(clearedParams);
    }
  }, [filterParams, onFilterChange]);

  // Render sort icon
  const renderSortIcon = useCallback((column: string) => {
    if (filterParams.sortBy !== column) {
      return null;
    }
    
    return filterParams.sortDir === 'asc' ? 'asc' : 'desc';
  }, [filterParams.sortBy, filterParams.sortDir]);

  return {
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
  };
};
