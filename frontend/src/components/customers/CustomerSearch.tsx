import React from 'react';
import { SearchBar } from '../common';

interface CustomerSearchProps {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  onFilterClick?: () => void;
  activeFilterCount: number;
}

const CustomerSearch: React.FC<CustomerSearchProps> = ({
  searchTerm,
  onSearchChange,
  onSearchSubmit,
  onFilterClick,
  activeFilterCount
}) => {
  return (
    <SearchBar
      searchTerm={searchTerm}
      onSearchChange={onSearchChange}
      onSearchSubmit={onSearchSubmit}
      placeholder="Search by name or phone"
      onFilterClick={onFilterClick}
      activeFilterCount={activeFilterCount}
      showFilterButton={!!onFilterClick}
    />
  );
};

export default CustomerSearch;
