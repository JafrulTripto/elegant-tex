import React from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Tooltip,
  Typography,
  useTheme,
  useMediaQuery,
  SelectChangeEvent
} from '@mui/material';
import { Pagination } from '../common';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import { ProductType } from '../../types/productType';
import { format } from 'date-fns';

interface ProductTypeListProps {
  productTypes: ProductType[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onToggleActive: (id: number) => void;
  page: number;
  totalCount: number;
  rowsPerPage: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: SelectChangeEvent<number>) => void;
  loading?: boolean;
}

const ProductTypeList: React.FC<ProductTypeListProps> = ({
  productTypes,
  onEdit,
  onDelete,
  onToggleActive,
  page,
  totalCount,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  loading = false
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Box>
      <TableContainer 
        component={Paper} 
        sx={{ 
          boxShadow: 2,
          borderRadius: 2,
          overflow: 'hidden',
          position: 'relative',
          mb: 2
        }}
      >
        <Table sx={{ minWidth: isSmallScreen ? 400 : 650 }}>
          <TableHead>
            <TableRow sx={{ 
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
              '& th': { fontWeight: 600 }
            }}>
              <TableCell sx={{ py: 1.5 }}>Name</TableCell>
              <TableCell sx={{ py: 1.5 }}>Status</TableCell>
              {!isSmallScreen && <TableCell sx={{ py: 1.5 }}>Created</TableCell>}
              {!isMediumScreen && <TableCell sx={{ py: 1.5 }}>Updated</TableCell>}
              <TableCell align="right" sx={{ py: 1.5, pr: 2 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {productTypes.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={isSmallScreen ? 3 : (isMediumScreen ? 4 : 6)} 
                  align="center"
                  sx={{ py: 4 }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                    <CategoryIcon sx={{ fontSize: 40, color: 'text.secondary', opacity: 0.5 }} />
                    <Typography variant="body1" color="text.secondary">
                      No product types found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Create your first product type to get started
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              productTypes.map((productType) => (
                <TableRow 
                  key={productType.id}
                  sx={{ 
                    '&:hover': { 
                      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
                    },
                    transition: 'background-color 0.2s'
                  }}
                >
                  <TableCell>
                    <Box>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontWeight: 500,
                          fontSize: isSmallScreen ? '0.875rem' : '0.95rem'
                        }}
                      >
                        {productType.name}
                      </Typography>
                      {isSmallScreen && (
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ 
                            fontSize: '0.75rem'
                          }}
                        >
                          Created: {formatDate(productType.createdAt).split(' at')[0]}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={productType.active ? 'Active' : 'Inactive'}
                      color={productType.active ? 'success' : 'default'}
                      size="small"
                      sx={{ 
                        fontWeight: 500,
                        fontSize: '0.75rem'
                      }}
                    />
                  </TableCell>
                  {!isSmallScreen && (
                    <TableCell>
                      <Typography 
                        variant="body2"
                        sx={{
                          fontSize: '0.875rem'
                        }}
                      >
                        {formatDate(productType.createdAt)}
                      </Typography>
                    </TableCell>
                  )}
                  {!isMediumScreen && (
                    <TableCell>
                      <Typography 
                        variant="body2"
                        sx={{
                          fontSize: '0.875rem'
                        }}
                      >
                        {formatDate(productType.updatedAt)}
                      </Typography>
                    </TableCell>
                  )}
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                      <Tooltip title={productType.active ? 'Set Inactive' : 'Set Active'}>
                        <IconButton
                          onClick={() => onToggleActive(productType.id)}
                          color={productType.active ? 'success' : 'default'}
                          size="small"
                          sx={{ 
                            border: '1px solid',
                            borderColor: 'divider'
                          }}
                        >
                          {productType.active ? <ToggleOnIcon fontSize="small" /> : <ToggleOffIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          onClick={() => onEdit(productType.id)}
                          color="primary"
                          size="small"
                          sx={{ 
                            border: '1px solid',
                            borderColor: 'divider'
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          onClick={() => onDelete(productType.id)}
                          color="error"
                          size="small"
                          sx={{ 
                            border: '1px solid',
                            borderColor: 'divider'
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Enhanced Pagination */}
      <Pagination
        page={page}
        size={rowsPerPage}
        totalPages={Math.ceil(totalCount / rowsPerPage)}
        totalElements={totalCount}
        itemsCount={productTypes.length}
        loading={loading}
        onPageChange={(_, newPage) => onPageChange(null, newPage - 1)}
        onPageSizeChange={(e) => onRowsPerPageChange(e as SelectChangeEvent<number>)}
        pageSizeOptions={[5, 10, 25]}
        variant="enhanced"
        elevation={1}
      />
    </Box>
  );
};

export default ProductTypeList;
