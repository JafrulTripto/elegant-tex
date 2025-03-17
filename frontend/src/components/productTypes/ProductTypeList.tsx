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
  TablePagination
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon
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
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
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
  onRowsPerPageChange
}) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Updated At</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {productTypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body1" color="textSecondary" sx={{ py: 2 }}>
                    No product types found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              productTypes.map((productType) => (
                <TableRow key={productType.id}>
                  <TableCell>{productType.id}</TableCell>
                  <TableCell>{productType.name}</TableCell>
                  <TableCell>
                    <Chip
                      label={productType.active ? 'Active' : 'Inactive'}
                      color={productType.active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatDate(productType.createdAt)}</TableCell>
                  <TableCell>{formatDate(productType.updatedAt)}</TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Tooltip title={productType.active ? 'Set Inactive' : 'Set Active'}>
                        <IconButton
                          onClick={() => onToggleActive(productType.id)}
                          color={productType.active ? 'success' : 'default'}
                          size="small"
                        >
                          {productType.active ? <ToggleOnIcon /> : <ToggleOffIcon />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          onClick={() => onEdit(productType.id)}
                          color="primary"
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          onClick={() => onDelete(productType.id)}
                          color="error"
                          size="small"
                        >
                          <DeleteIcon />
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
      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        onPageChange={onPageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={onRowsPerPageChange}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Box>
  );
};

export default ProductTypeList;
