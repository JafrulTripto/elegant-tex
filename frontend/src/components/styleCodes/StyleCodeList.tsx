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
  Style as StyleIcon
} from '@mui/icons-material';
import { StyleCode } from '../../types/styleCode';
import { format } from 'date-fns';

interface StyleCodeListProps {
  styleCodes: StyleCode[];
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

const StyleCodeList: React.FC<StyleCodeListProps> = ({
  styleCodes,
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
              <TableCell sx={{ py: 1.5 }}>Code</TableCell>
              <TableCell sx={{ py: 1.5 }}>Name</TableCell>
              <TableCell sx={{ py: 1.5 }}>Status</TableCell>
              {!isSmallScreen && <TableCell sx={{ py: 1.5 }}>Created</TableCell>}
              {!isMediumScreen && <TableCell sx={{ py: 1.5 }}>Updated</TableCell>}
              <TableCell align="right" sx={{ py: 1.5, pr: 2 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {styleCodes.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={isSmallScreen ? 4 : (isMediumScreen ? 5 : 6)} 
                  align="center"
                  sx={{ py: 4 }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                    <StyleIcon sx={{ fontSize: 40, color: 'text.secondary', opacity: 0.5 }} />
                    <Typography variant="body1" color="text.secondary">
                      No style codes found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Create your first style code to get started
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              styleCodes.map((styleCode) => (
                <TableRow 
                  key={styleCode.id}
                  sx={{ 
                    '&:hover': { 
                      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
                    },
                    transition: 'background-color 0.2s'
                  }}
                >
                  <TableCell>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontWeight: 600,
                        fontSize: isSmallScreen ? '0.875rem' : '0.95rem',
                        color: 'primary.main'
                      }}
                    >
                      {styleCode.code}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontWeight: 500,
                          fontSize: isSmallScreen ? '0.875rem' : '0.95rem'
                        }}
                      >
                        {styleCode.name}
                      </Typography>
                      {isSmallScreen && (
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ 
                            fontSize: '0.75rem'
                          }}
                        >
                          Created: {formatDate(styleCode.createdAt).split(' at')[0]}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={styleCode.active ? 'Active' : 'Inactive'}
                      color={styleCode.active ? 'success' : 'default'}
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
                        {formatDate(styleCode.createdAt)}
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
                        {formatDate(styleCode.updatedAt)}
                      </Typography>
                    </TableCell>
                  )}
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                      <Tooltip title={styleCode.active ? 'Set Inactive' : 'Set Active'}>
                        <IconButton
                          onClick={() => onToggleActive(styleCode.id)}
                          color={styleCode.active ? 'success' : 'default'}
                          size="small"
                          sx={{ 
                            border: '1px solid',
                            borderColor: 'divider'
                          }}
                        >
                          {styleCode.active ? <ToggleOnIcon fontSize="small" /> : <ToggleOffIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          onClick={() => onEdit(styleCode.id)}
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
                          onClick={() => onDelete(styleCode.id)}
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
        itemsCount={styleCodes.length}
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

export default StyleCodeList;
