import React from 'react';
import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Pagination as MuiPagination,
  SelectChangeEvent,
  useTheme,
  Paper,
  useMediaQuery
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
  variant?: 'standard' | 'enhanced';
  elevation?: number;
  backgroundColor?: string;
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
  pageSizeOptions = [10, 25, 50, 100],
  variant = 'enhanced',
  elevation = 1,
  backgroundColor
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Calculate the range of items being displayed
  const startItem = totalElements === 0 ? 0 : page * size + 1;
  const endItem = Math.min((page + 1) * size, page * size + itemsCount);
  
  // Determine background color based on theme and provided prop
  const bgColor = backgroundColor || 
    (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)');
  
  // Standard variant (simple layout)
  if (variant === 'standard') {
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
  }
  
  // Enhanced variant (styled container with better responsive layout)
  return (
    <Paper 
      elevation={elevation} 
      sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap',
        backgroundColor: bgColor,
        borderRadius: 2,
        p: 1.5,
        flexDirection: { xs: 'column', md: 'row' },
        gap: { xs: 2, md: 0 }
      }}
    >
      {/* Pagination Info */}
      <Box sx={{ mb: { xs: 1, md: 0 }, width: { xs: '100%', md: 'auto' } }}>
        {itemsCount > 0 && (
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              fontSize: isSmallScreen ? '0.75rem' : '0.875rem',
              textAlign: { xs: 'center', md: 'left' }
            }}
          >
            Showing {startItem} to {endItem} of {totalElements} entries
          </Typography>
        )}
      </Box>
      
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
        flexWrap: 'wrap',
        justifyContent: { xs: 'center', md: 'flex-end' },
        width: { xs: '100%', md: 'auto' }
      }}>
        {/* Page Size Selection */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ fontSize: isSmallScreen ? '0.75rem' : '0.875rem' }}
          >
            Rows per page:
          </Typography>
          <FormControl 
            size="small" 
            variant="outlined" 
            sx={{ 
              minWidth: 70,
              '& .MuiOutlinedInput-root': {
                borderRadius: 1,
                fontSize: isSmallScreen ? '0.75rem' : '0.875rem'
              }
            }}
          >
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
            siblingCount={isSmallScreen ? 0 : 1}
            size={isSmallScreen ? "small" : "medium"}
            sx={{
              '& .MuiPaginationItem-root': {
                borderRadius: theme.shape.borderRadius,
                fontSize: isSmallScreen ? '0.75rem' : '0.875rem'
              }
            }}
          />
        )}
      </Box>
    </Paper>
  );
};

export default Pagination;
