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
  ToggleOff as ToggleOffIcon,
  Link as LinkIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { Marketplace } from '../../types/marketplace';
import { getFileUrl } from '../../services/fileStorage.service';
import { toggleMarketplaceActive } from '../../services/marketplace.service';
import { format } from 'date-fns';
import { Link as RouterLink } from 'react-router-dom';

interface MarketplaceListProps {
  marketplaces: Marketplace[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onToggleActive?: (marketplace: Marketplace) => void;
  viewMode?: 'grid' | 'list';
}

const MarketplaceList: React.FC<MarketplaceListProps> = ({ 
  marketplaces, 
  onEdit, 
  onDelete, 
  onToggleActive,
  viewMode = 'grid' 
}) => {
  const theme = useTheme();
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };
  
  // Render grid view
  const renderGridView = () => (
    <Grid container spacing={theme.customSpacing.section * 1}>
      {marketplaces.map((marketplace) => (
        <Grid item xs={12} sm={6} md={3} key={marketplace.id}>
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
              <Box 
                component={RouterLink}
                to={`/marketplaces/${marketplace.id}`}
                sx={{ 
                  position: 'relative', 
                  paddingTop: '50%', 
                  backgroundColor: '#f5f5f5',
                  textDecoration: 'none'
                }}
              >
                {/* Active/Inactive Badge */}
                <Box sx={{ 
                  position: 'absolute', 
                  top: 8, 
                  right: 8, 
                  zIndex: 1,
                  backgroundColor: marketplace.active ? 'rgba(46, 125, 50, 0.9)' : 'rgba(211, 47, 47, 0.9)',
                  color: 'white',
                  borderRadius: '4px',
                  padding: '2px 8px',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '0.7rem',
                  fontWeight: 'bold'
                }}>
                  {marketplace.active ? (
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
                {marketplace.imageId ? (
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
                    image={getFileUrl(marketplace.imageId) || ''}
                    alt={marketplace.name}
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
              
              <CardContent 
                component={RouterLink}
                to={`/marketplaces/${marketplace.id}`}
                sx={{ 
                  flexGrow: 1, 
                  pt: theme.customSpacing.item * 2, 
                  px: theme.customSpacing.item * 2, 
                  pb: theme.customSpacing.item,
                  textDecoration: 'none',
                  color: 'inherit'
                }}
              >
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
                  {marketplace.name}
                </Typography>
                
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  color: 'text.secondary',
                  fontSize: '0.7rem',
                  mb: theme.customSpacing.item / 2
                }}>
                  <CalendarIcon fontSize="small" sx={{ mr: 0.5, fontSize: '0.75rem' }} />
                  <Typography variant="caption">
                    {formatDate(marketplace.createdAt)}
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  color: 'text.secondary',
                  fontSize: '0.7rem',
                  mb: theme.customSpacing.item,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  <LinkIcon fontSize="small" sx={{ mr: 0.5, fontSize: '0.75rem' }} />
                  <Typography 
                    variant="caption"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {marketplace.pageUrl}
                  </Typography>
                </Box>
                
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
                    <Chip
                      icon={<PeopleIcon style={{ fontSize: '0.75rem' }} />}
                      label={`${marketplace.members.length} members`}
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
                  </Stack>
                </Box>
              </CardContent>
              
              <Divider />
              
              <CardActions sx={{ justifyContent: 'space-between', px: theme.customSpacing.item * 2, py: theme.customSpacing.item }}>
                <Typography variant="caption" color="text.secondary">
                  ID: {marketplace.id}
                </Typography>
                <Box>
                  <Tooltip title={marketplace.active ? "Set Inactive" : "Set Active"}>
                    <IconButton 
                      onClick={async () => {
                        if (onToggleActive) {
                          onToggleActive(marketplace);
                        } else {
                          try {
                            await toggleMarketplaceActive(marketplace.id);
                            // The parent component should handle refreshing the list
                          } catch (err) {
                            console.error('Error toggling marketplace status:', err);
                          }
                        }
                      }}
                      size="small"
                      color={marketplace.active ? "success" : "default"}
                      sx={{ 
                        '&:hover': { backgroundColor: marketplace.active ? theme.palette.success.light + '20' : theme.palette.grey[300] + '40' }
                      }}
                    >
                      {marketplace.active ? <ToggleOnIcon fontSize="small" /> : <ToggleOffIcon fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton 
                      onClick={() => onEdit(marketplace.id)}
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
                      onClick={() => onDelete(marketplace.id)} 
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
  
  // Render list view
  const renderListView = () => (
    <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
      {marketplaces.map((marketplace, index) => (
        <React.Fragment key={marketplace.id}>
          {index > 0 && <Divider />}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            p: 2,
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.02)'
            }
          }}>
            {/* Image */}
            <Box 
              component={RouterLink}
              to={`/marketplaces/${marketplace.id}`}
              sx={{ 
                position: 'relative',
                width: { xs: '100%', sm: 120 },
                height: { xs: 100, sm: 80 },
                flexShrink: 0,
                mr: { sm: 2 },
                mb: { xs: 1, sm: 0 },
                borderRadius: 1,
                overflow: 'hidden',
                backgroundColor: '#f5f5f5',
                textDecoration: 'none'
              }}
            >
              {marketplace.imageId ? (
                <CardMedia
                  component="img"
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                  image={getFileUrl(marketplace.imageId) || ''}
                  alt={marketplace.name}
                />
              ) : (
                <Box 
                  sx={{ 
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
              
              {/* Status Badge */}
              <Box sx={{ 
                position: 'absolute', 
                top: 4, 
                right: 4, 
                zIndex: 1,
                backgroundColor: marketplace.active ? 'rgba(46, 125, 50, 0.9)' : 'rgba(211, 47, 47, 0.9)',
                color: 'white',
                borderRadius: '4px',
                padding: '1px 6px',
                display: 'flex',
                alignItems: 'center',
                fontSize: '0.65rem',
                fontWeight: 'bold'
              }}>
                {marketplace.active ? (
                  <>
                    <ActiveIcon fontSize="small" sx={{ mr: 0.5, fontSize: '0.7rem' }} />
                    Active
                  </>
                ) : (
                  <>
                    <InactiveIcon fontSize="small" sx={{ mr: 0.5, fontSize: '0.7rem' }} />
                    Inactive
                  </>
                )}
              </Box>
            </Box>
            
            {/* Content */}
            <Box sx={{ 
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', sm: 'center' },
                flexDirection: { xs: 'column', sm: 'row' },
                mb: 1
              }}>
                <Typography 
                  component={RouterLink}
                  to={`/marketplaces/${marketplace.id}`}
                  variant="subtitle1" 
                  sx={{ 
                    fontWeight: 600,
                    color: 'text.primary',
                    textDecoration: 'none',
                    '&:hover': {
                      color: 'primary.main',
                      textDecoration: 'underline'
                    }
                  }}
                >
                  {marketplace.name}
                </Typography>
                
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  mt: { xs: 0.5, sm: 0 }
                }}>
                  <Tooltip title={marketplace.active ? "Set Inactive" : "Set Active"}>
                    <IconButton 
                      onClick={async () => {
                        if (onToggleActive) {
                          onToggleActive(marketplace);
                        } else {
                          try {
                            await toggleMarketplaceActive(marketplace.id);
                          } catch (err) {
                            console.error('Error toggling marketplace status:', err);
                          }
                        }
                      }}
                      size="small"
                      color={marketplace.active ? "success" : "default"}
                      sx={{ 
                        '&:hover': { backgroundColor: marketplace.active ? theme.palette.success.light + '20' : theme.palette.grey[300] + '40' }
                      }}
                    >
                      {marketplace.active ? <ToggleOnIcon fontSize="small" /> : <ToggleOffIcon fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton 
                      onClick={() => onEdit(marketplace.id)}
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
                      onClick={() => onDelete(marketplace.id)} 
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
              </Box>
              
              <Box sx={{ 
                display: 'flex',
                flexWrap: 'wrap',
                gap: 2,
                mb: 1
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  color: 'text.secondary',
                  fontSize: '0.75rem',
                }}>
                  <CalendarIcon fontSize="small" sx={{ mr: 0.5, fontSize: '0.75rem' }} />
                  <Typography variant="caption">
                    {formatDate(marketplace.createdAt)}
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  color: 'text.secondary',
                  fontSize: '0.75rem',
                  maxWidth: '250px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  <LinkIcon fontSize="small" sx={{ mr: 0.5, fontSize: '0.75rem' }} />
                  <Typography 
                    variant="caption"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {marketplace.pageUrl}
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  color: 'text.secondary',
                  fontSize: '0.75rem',
                }}>
                  <PeopleIcon fontSize="small" sx={{ mr: 0.5, fontSize: '0.75rem' }} />
                  <Typography variant="caption">
                    {marketplace.members.length} members
                  </Typography>
                </Box>
              </Box>
              
              <Typography variant="caption" color="text.secondary">
                ID: {marketplace.id}
              </Typography>
            </Box>
          </Box>
        </React.Fragment>
      ))}
    </Paper>
  );
  
  return viewMode === 'grid' ? renderGridView() : renderListView();
};

export default MarketplaceList;
