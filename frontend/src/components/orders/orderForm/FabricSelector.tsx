import React, { memo } from 'react';
import {
  Autocomplete,
  Avatar,
  Box,
  TextField,
  Typography
} from '@mui/material';
import { Fabric } from '../../../types/fabric';
import { getFileUrl } from '../../../services/fileStorage.service';

interface FabricSelectorProps {
  fabrics: Fabric[];
  selectedFabricId: number;
  onFabricChange: (fabricId: number) => void;
  handleFabricListScroll: (event: React.UIEvent<HTMLUListElement>) => void;
  loadingFabrics: boolean;
  error?: boolean;
  helperText?: string;
}

const FabricSelector: React.FC<FabricSelectorProps> = memo(({
  fabrics,
  selectedFabricId,
  onFabricChange,
  handleFabricListScroll,
  loadingFabrics,
  error,
  helperText
}) => {
  // Function to render fabric option with image
  const renderFabricOption = (props: React.ComponentPropsWithRef<'li'>, fabric: Fabric) => {
    const { key, ...otherProps } = props;
    return (
      <li key={key} {...otherProps}>
        <Box display="flex" alignItems="center" gap={1}>
          {fabric.imageId ? (
            <Avatar 
              src={getFileUrl(fabric.imageId) || undefined}
              alt={fabric.name}
              variant="rounded"
              sx={{ width: 40, height: 40 }}
            >
              {fabric.name.charAt(0)}
            </Avatar>
          ) : (
            <Avatar 
              variant="rounded"
              sx={{ width: 40, height: 40 }}
            >
              {fabric.name.charAt(0)}
            </Avatar>
          )}
          <Box>
            <Typography>{fabric.name}</Typography>
            {fabric.fabricCode && (
              <Typography variant="caption" color="text.secondary">
                Code: {fabric.fabricCode}
              </Typography>
            )}
          </Box>
        </Box>
      </li>
    );
  };

  return (
    <Autocomplete
      options={fabrics}
      getOptionLabel={(option) => option.name}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      value={fabrics.find(f => f.id === selectedFabricId) || null}
      onChange={(_, newValue) => {
        onFabricChange(newValue?.id || 0);
      }}
      renderInput={(params) => (
        <TextField 
          {...params} 
          label="Fabric" 
          required
          error={error}
          helperText={helperText}
        />
      )}
      renderOption={renderFabricOption}
      ListboxProps={{
        onScroll: handleFabricListScroll
      }}
      loading={loadingFabrics}
      loadingText="Loading fabrics..."
    />
  );
});

export default FabricSelector;
