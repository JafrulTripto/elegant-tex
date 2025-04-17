import React from 'react';
import { Box } from '@mui/material';
import { SearchBar } from '../common';

interface MarketplaceSearchProps {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  onFilterClick: () => void;
  activeFilterCount: number;
}

const MarketplaceSearch: React.FC<MarketplaceSearchProps> = ({
  searchTerm,
  onSearchChange,
  onSearchSubmit,
  onFilterClick,
  activeFilterCount
}) => {
  return (
    <Box sx={{ mb: 3 }}>
      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        onSearchSubmit={onSearchSubmit}
        placeholder="Search marketplaces by name"
        onFilterClick={onFilterClick}
        activeFilterCount={activeFilterCount}
        showFilterButton={true}
      />
    </Box>
  );
};

export default MarketplaceSearch;
