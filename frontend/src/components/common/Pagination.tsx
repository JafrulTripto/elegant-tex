import React from 'react';
import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Pagination as MuiPagination,
  SelectChangeEvent,
  useTheme
} from '@mui/material';

interface PaginationProps {
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
  itemsCount: number;
  loading?: boolean;
  onPageChange: (event: React.ChangeEvent<unknown>, page: number) => void;
  onPageSizeChange: (event: SelectChangeEvent) => void;
  pageSizeOptions?: number[];
}

const Pagination: React.FC<PaginationProps> = ({
  page,
  size,
  totalPages,
  totalElements,
  itemsCount,
  loading = false,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100]
}) => {
  const theme = useTheme();
  
  // Calculate the range of items being displayed
  const startItem = totalElements === 0 ? 0 : page * size + 1;
  const endItem = Math.min((page + 1) * size, page * size + itemsCount);
  
  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      flexWrap: 'wrap',
      gap: 2
    }}>
      {/* Pagination Info */}
      <Box>
        {itemsCount > 0 && (
          <Typography variant="body2" color="text.secondary">
            Showing {startItem} to {endItem} of {totalElements} entries
          </Typography>
        )}
      </Box>
      
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
        flexWrap: 'wrap'
      }}>
        {/* Page Size Selection */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Rows per page:
          </Typography>
          <FormControl size="small" variant="outlined" sx={{ minWidth: 80 }}>
            <Select
              value={size.toString()}
              onChange={onPageSizeChange}
              disabled={loading}
              sx={{ 
                '& .MuiSelect-select': { 
                  py: 0.5, 
                  px: 1.5 
                },
                borderRadius: theme.shape.borderRadius
              }}
            >
              {pageSizeOptions.map(option => (
                <MenuItem key={option} value={option.toString()}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        
        {/* Pagination Controls */}
        {totalPages > 0 && (
          <MuiPagination
            count={totalPages}
            page={page + 1} // MUI Pagination is 1-indexed, but our API is 0-indexed
            onChange={onPageChange}
            color="primary"
            disabled={loading}
            showFirstButton
            showLastButton
            siblingCount={1}
            size="medium"
            sx={{
              '& .MuiPaginationItem-root': {
                borderRadius: theme.shape.borderRadius
              }
            }}
          />
        )}
      </Box>
    </Box>
  );
};

export default Pagination;
