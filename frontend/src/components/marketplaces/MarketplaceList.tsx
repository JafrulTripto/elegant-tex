import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  Pagination,
  CircularProgress,
  Button,
  Chip,
  Stack,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import { Marketplace } from '../../types/marketplace';
import { getMarketplaces } from '../../services/marketplace.service';
import { getFileUrl } from '../../services/fileStorage.service';
import ImagePreview from '../common/ImagePreview';

interface MarketplaceListProps {
  onCreateClick?: () => void;
}

const MarketplaceList: React.FC<MarketplaceListProps> = ({ onCreateClick }) => {
  const [marketplaces, setMarketplaces] = useState<Marketplace[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const pageSize = 6;

  useEffect(() => {
    const fetchMarketplaces = async () => {
      try {
        setLoading(true);
        const response = await getMarketplaces(page, pageSize);
        setMarketplaces(response.content);
        setTotalPages(response.totalPages);
        setLoading(false);
      } catch (err) {
        setError('Failed to load marketplaces');
        setLoading(false);
        console.error('Error fetching marketplaces:', err);
      }
    };

    fetchMarketplaces();
  }, [page]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value - 1); // API is 0-indexed, MUI Pagination is 1-indexed
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', my: 4 }}>
        <Typography color="error">{error}</Typography>
        <Button variant="outlined" onClick={() => setPage(0)} sx={{ mt: 2 }}>
          Try Again
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h5" component="h2">
          Marketplaces
        </Typography>
        {onCreateClick && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={onCreateClick}
          >
            Create Marketplace
          </Button>
        )}
      </Box>

      {marketplaces.length === 0 ? (
        <Box sx={{ textAlign: 'center', my: 4, p: 3, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            No marketplaces found
          </Typography>
          {onCreateClick && (
            <Button
              variant="outlined"
              color="primary"
              startIcon={<AddIcon />}
              onClick={onCreateClick}
            >
              Create Your First Marketplace
            </Button>
          )}
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {marketplaces.map((marketplace) => (
              <Grid item xs={12} sm={6} md={4} key={marketplace.id}>
                <Card
                  component={RouterLink}
                  to={`/marketplaces/${marketplace.id}`}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    textDecoration: 'none',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                >
                  <ImagePreview
                    imageId={marketplace.imageId}
                    alt={marketplace.name}
                    height={180}
                    fallbackImage="/vite.svg"
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="div">
                      {marketplace.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {marketplace.pageUrl}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      <Chip
                        size="small"
                        label={`${marketplace.members.length} members`}
                        color="primary"
                        variant="outlined"
                      />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page + 1}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default MarketplaceList;
