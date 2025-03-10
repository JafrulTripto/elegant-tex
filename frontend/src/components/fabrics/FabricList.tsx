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
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Fabric } from '../../types/fabric';
import { getFileUrl } from '../../services/fileStorage.service';

interface FabricListProps {
  fabrics: Fabric[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const FabricList: React.FC<FabricListProps> = ({ fabrics, onEdit, onDelete }) => {
  return (
    <Grid container spacing={3}>
      {fabrics.map((fabric) => (
        <Grid item xs={12} sm={6} md={4} key={fabric.id}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {fabric.imageId && (
              <CardMedia
                component="img"
                height="140"
                image={getFileUrl(fabric.imageId) || ''}
                alt={fabric.name}
              />
            )}
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography gutterBottom variant="h6" component="div">
                {fabric.name}
              </Typography>
              <Box sx={{ mt: 1 }}>
                {fabric.tags.map((tag) => (
                  <Chip
                    key={tag.id}
                    label={tag.name}
                    size="small"
                    sx={{ mr: 0.5, mb: 0.5 }}
                  />
                ))}
              </Box>
            </CardContent>
            <CardActions>
              <Tooltip title="Edit">
                <IconButton onClick={() => onEdit(fabric.id)}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton onClick={() => onDelete(fabric.id)} color="error">
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default FabricList;
