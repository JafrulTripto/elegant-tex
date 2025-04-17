import React from 'react';
import { SearchBar } from '../common';

interface UserSearchProps {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  onFilterClick: () => void;
  activeFilterCount: number;
}

const UserSearch: React.FC<UserSearchProps> = ({
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
      placeholder="Search by name, email, or phone"
      onFilterClick={onFilterClick}
      activeFilterCount={activeFilterCount}
      showFilterButton={true}
    />
  );
};

export default UserSearch;
