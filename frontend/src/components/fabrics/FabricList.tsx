import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  Chip,
  IconButton,
  CardActions,
  Tooltip,
  Divider,
  Paper,
  Stack,
  useTheme
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
    <Grid container spacing={theme.customSpacing.section * 1}>
      {fabrics.map((fabric) => (
        <Grid item xs={12} sm={6} md={3} key={fabric.id}>
          <Paper 
            elevation={2} 
            sx={{ 
              height: '100%',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.shadows[8],
              }
            }}
          >
            <Card sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              border: 'none',
              borderRadius: 2,
            }}>
              <Box sx={{ position: 'relative', paddingTop: '50%', backgroundColor: '#f5f5f5' }}>
                {/* Active/Inactive Badge */}
                <Box sx={{ 
                  position: 'absolute', 
                  top: 8, 
                  right: 8, 
                  zIndex: 1,
                  backgroundColor: fabric.active ? 'rgba(46, 125, 50, 0.9)' : 'rgba(211, 47, 47, 0.9)',
                  color: 'white',
                  borderRadius: '4px',
                  padding: '2px 8px',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '0.7rem',
                  fontWeight: 'bold'
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
                {fabric.imageId ? (
                  <CardMedia
                    component="img"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                    image={getFileUrl(fabric.imageId) || ''}
                    alt={fabric.name}
                  />
                ) : (
                  <Box 
                    sx={{ 
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: theme.palette.grey[100],
                      color: theme.palette.text.secondary,
                    }}
                  >
                    <Typography variant="body2">No Image</Typography>
                  </Box>
                )}
              </Box>
              
              <CardContent sx={{ flexGrow: 1, pt: theme.customSpacing.item * 2, px: theme.customSpacing.item * 2, pb: theme.customSpacing.item }}>
                <Typography 
                  gutterBottom 
                  variant="subtitle2" 
                  component="div" 
                  sx={{ 
                    fontWeight: 600,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: 'vertical',
                    mb: 0.5,
                  }}
                >
                  {fabric.name}
                </Typography>
                
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  color: 'text.secondary',
                  fontSize: '0.7rem',
                  mb: theme.customSpacing.item
                }}>
                  <CalendarIcon fontSize="small" sx={{ mr: 0.5, fontSize: '0.75rem' }} />
                  <Typography variant="caption">
                    {formatDate(fabric.createdAt)}
                  </Typography>
                </Box>
                
                {fabric.tags.length > 0 && (
                  <Box sx={{ mt: theme.customSpacing.item / 2 }}>
                    <Stack 
                      direction="row" 
                      spacing={0.5} 
                      sx={{ 
                        flexWrap: 'wrap', 
                        gap: 0.5,
                        maxHeight: '48px',
                        overflow: 'hidden'
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
                  </Box>
                )}
              </CardContent>
              
              <Divider />
              
              <CardActions sx={{ justifyContent: 'space-between', px: theme.customSpacing.item * 2, py: theme.customSpacing.item }}>
                <Typography variant="caption" color="text.secondary">
                  ID: {fabric.id}
                </Typography>
                <Box>
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
                        '&:hover': { backgroundColor: fabric.active ? theme.palette.success.light + '20' : theme.palette.grey[300] + '40' }
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
              </CardActions>
            </Card>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default FabricList;
