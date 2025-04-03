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
  TableHead,
  TableRow,
  Paper,
  Avatar
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  CalendarToday as CalendarIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon
} from '@mui/icons-material';
import { Fabric } from '../../types/fabric';
import { getFileUrl } from '../../services/fileStorage.service';
import { toggleFabricActive } from '../../services/fabric.service';
import { format } from 'date-fns';

interface FabricListProps {
  fabrics: Fabric[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onToggleActive?: (fabric: Fabric) => void;
}

const FabricList: React.FC<FabricListProps> = ({ fabrics, onEdit, onDelete, onToggleActive }) => {
  const theme = useTheme();
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };
  
  return (
    <TableContainer component={Paper} elevation={2}>
      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow sx={{ backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[50] }}>
            <TableCell width="80px">Image</TableCell>
            <TableCell>Name & ID</TableCell>
            <TableCell width="120px">Created Date</TableCell>
            <TableCell>Tags</TableCell>
            <TableCell width="100px">Status</TableCell>
            <TableCell width="120px" align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
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
                    sx={{ width: 60, height: 60, borderRadius: 1 }}
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
                      borderRadius: 1,
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
                          borderRadius: 1,
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
                <Box sx={{ 
                  backgroundColor: fabric.active 
                    ? theme.palette.success.main 
                    : theme.palette.error.main,
                  color: 'white',
                  borderRadius: '4px',
                  padding: '2px 8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                  width: 'fit-content'
                }}>
                  {fabric.active ? (
                    <>
                      <ActiveIcon fontSize="small" sx={{ mr: 0.5, fontSize: '0.75rem' }} />
                      Active
                    </>
                  ) : (
                    <>
                      <InactiveIcon fontSize="small" sx={{ mr: 0.5, fontSize: '0.75rem' }} />
                      Inactive
                    </>
                  )}
                </Box>
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
