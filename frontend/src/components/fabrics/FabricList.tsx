import React from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Stack,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Avatar,
  alpha
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  CalendarToday as CalendarIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon
} from '@mui/icons-material';
import { Fabric } from '../../types/fabric';
import { getFileUrl } from '../../services/fileStorage.service';
import { toggleFabricActive } from '../../services/fabric.service';
import { format } from 'date-fns';
import { SortableTableHead, StatusChip } from '../common';
import type { Column } from '../common';

interface FabricListProps {
  fabrics: Fabric[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onToggleActive?: (fabric: Fabric) => void;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  onSort?: (column: string) => void;
}

const FabricList: React.FC<FabricListProps> = ({ 
  fabrics, 
  onEdit, 
  onDelete, 
  onToggleActive,
  sortBy = 'id',
  sortDir = 'asc',
  onSort
}) => {
  const theme = useTheme();
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };

  const columns: Column[] = [
    { id: 'image', label: 'Image', sortable: false, width: 80 },
    { id: 'name', label: 'Name & ID', sortable: true },
    { id: 'createdAt', label: 'Created Date', sortable: true, width: 120 },
    { id: 'tags', label: 'Tags', sortable: false },
    { id: 'active', label: 'Status', sortable: true, width: 100 },
    { id: 'actions', label: 'Actions', sortable: false, width: 120, align: 'right' }
  ];
  
  return (
    <TableContainer 
      component={Paper} 
      elevation={2} 
      sx={{ 
        borderRadius: 1.25,
        transition: 'box-shadow 0.2s ease-in-out',
        '&:hover': {
          boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.08)}`
        }
      }}
    >
      <Table sx={{ minWidth: 650 }}>
        <SortableTableHead 
          columns={columns} 
          sortBy={sortBy} 
          sortDir={sortDir} 
          onSort={onSort || (() => {})} 
        />
        <TableBody>
          {fabrics.map((fabric) => (
            <TableRow 
              key={fabric.id}
              sx={{ 
                '&:hover': { 
                  backgroundColor: theme.palette.action.hover 
                },
                transition: 'background-color 0.2s ease'
              }}
            >
              {/* Image Column */}
              <TableCell>
                {fabric.imageId ? (
                  <Avatar
                    variant="rounded"
                    src={getFileUrl(fabric.imageId) || ''}
                    alt={fabric.name}
                    sx={{ width: 60, height: 60, borderRadius: 1.25 }}
                  />
                ) : (
                  <Box 
                    sx={{ 
                      width: 60, 
                      height: 60, 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100],
                      color: theme.palette.text.secondary,
                      borderRadius: 1.25,
                      fontSize: '0.75rem'
                    }}
                  >
                    No Image
                  </Box>
                )}
              </TableCell>
              
              {/* Name & ID Column */}
              <TableCell>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    fontWeight: 600,
                    mb: 0.5
                  }}
                >
                  {fabric.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ID: {fabric.id}
                </Typography>
              </TableCell>
              
              {/* Created Date Column */}
              <TableCell>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  color: 'text.secondary',
                  fontSize: '0.7rem'
                }}>
                  <CalendarIcon fontSize="small" sx={{ mr: 0.5, fontSize: '0.75rem' }} />
                  <Typography variant="caption">
                    {formatDate(fabric.createdAt)}
                  </Typography>
                </Box>
              </TableCell>
              
              {/* Tags Column */}
              <TableCell>
                {fabric.tags.length > 0 ? (
                  <Stack 
                    direction="row" 
                    spacing={0.5} 
                    sx={{ 
                      flexWrap: 'wrap', 
                      gap: 0.5
                    }}
                  >
                    {fabric.tags.map((tag) => (
                      <Chip
                        key={tag.id}
                        label={tag.name}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ 
                          borderRadius: 1.25,
                          height: '20px',
                          '& .MuiChip-label': {
                            px: 0.75,
                            fontSize: '0.65rem',
                          }
                        }}
                      />
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="caption" color="text.secondary">
                    No tags
                  </Typography>
                )}
              </TableCell>
              
              {/* Status Column */}
              <TableCell>
                <StatusChip 
                  status={fabric.active ? 'active' : 'inactive'} 
                />
              </TableCell>
              
              {/* Actions Column */}
              <TableCell align="right">
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Tooltip title={fabric.active ? "Set Inactive" : "Set Active"}>
                    <IconButton 
                      onClick={async () => {
                        if (onToggleActive) {
                          onToggleActive(fabric);
                        } else {
                          try {
                            await toggleFabricActive(fabric.id);
                            // The parent component should handle refreshing the list
                          } catch (err) {
                            console.error('Error toggling fabric status:', err);
                          }
                        }
                      }}
                      size="small"
                      color={fabric.active ? "success" : "default"}
                      sx={{ 
                        '&:hover': { 
                          backgroundColor: fabric.active 
                            ? theme.palette.success.light + '20' 
                            : (theme.palette.mode === 'dark' 
                                ? theme.palette.grey[700] + '40' 
                                : theme.palette.grey[300] + '40')
                        }
                      }}
                    >
                      {fabric.active ? <ToggleOnIcon fontSize="small" /> : <ToggleOffIcon fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton 
                      onClick={() => onEdit(fabric.id)}
                      size="small"
                      sx={{ 
                        color: theme.palette.primary.main,
                        '&:hover': { backgroundColor: theme.palette.primary.light + '20' }
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton 
                      onClick={() => onDelete(fabric.id)} 
                      color="error"
                      size="small"
                      sx={{ 
                        '&:hover': { backgroundColor: theme.palette.error.light + '20' }
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default FabricList;
