import React from 'react';
import { TableHead, TableRow, TableCell, Box, SxProps, Theme } from '@mui/material';
import { ArrowUpward as ArrowUpIcon, ArrowDownward as ArrowDownIcon } from '@mui/icons-material';

export interface Column {
  id: string;
  label: string;
  sortable: boolean;
  align?: 'left' | 'right' | 'center';
  width?: string | number;
}

interface SortableTableHeadProps {
  columns: Column[];
  sortBy: string;
  sortDir: 'asc' | 'desc';
  onSort: (column: string) => void;
  headerRowSx?: SxProps<Theme>;
}

const SortableTableHead: React.FC<SortableTableHeadProps> = ({
  columns,
  sortBy,
  sortDir,
  onSort,
  headerRowSx
}) => {
  // Render sort icon
  const renderSortIcon = (column: string) => {
    if (sortBy !== column) {
      return null;
    }
    
    return sortDir === 'asc' ? 
      <ArrowUpIcon fontSize="small" sx={{ ml: 0.5 }} /> : 
      <ArrowDownIcon fontSize="small" sx={{ ml: 0.5 }} />;
  };

  return (
    <TableHead>
      <TableRow sx={headerRowSx}>
        {columns.map((column) => (
          <TableCell
            key={column.id}
            align={column.align || 'left'}
            width={column.width}
            sx={{
              fontWeight: 600,
              whiteSpace: 'nowrap',
              cursor: column.sortable ? 'pointer' : 'default',
              userSelect: 'none',
              backgroundColor: 'background.paper',
              borderBottom: '2px solid',
              borderBottomColor: 'divider',
              '&:hover': {
                backgroundColor: column.sortable ? 'action.hover' : 'background.paper'
              }
            }}
            onClick={() => column.sortable && onSort(column.id)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {column.label}
              {column.sortable && renderSortIcon(column.id)}
            </Box>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

export default SortableTableHead;
