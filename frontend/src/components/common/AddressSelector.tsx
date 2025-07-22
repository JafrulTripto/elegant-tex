import React, { useState, useEffect } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  Typography,
  Grid,
  SelectChangeEvent
} from '@mui/material';
import { geographicalService } from '../../services/geographical.service';
import { GeographicalOption, AddressFormData } from '../../types/geographical';

interface AddressSelectorProps {
  value: AddressFormData;
  onChange: (address: AddressFormData) => void;
  error?: {
    divisionId?: string;
    districtId?: string;
    upazilaId?: string;
    addressLine?: string;
  };
  disabled?: boolean;
  required?: boolean;
}

const AddressSelector: React.FC<AddressSelectorProps> = ({
  value,
  onChange,
  error,
  disabled = false,
  required = false
}) => {
  const [divisions, setDivisions] = useState<GeographicalOption[]>([]);
  const [districts, setDistricts] = useState<GeographicalOption[]>([]);
  const [upazilas, setUpazilas] = useState<GeographicalOption[]>([]);
  const [loading, setLoading] = useState({
    divisions: false,
    districts: false,
    upazilas: false
  });

  // Load divisions on component mount
  useEffect(() => {
    loadDivisions();
  }, []);

  // Load districts when division changes
  useEffect(() => {
    if (value.divisionId) {
      loadDistricts(value.divisionId);
    } else {
      setDistricts([]);
      setUpazilas([]);
    }
  }, [value.divisionId]);

  // Load upazilas when district changes
  useEffect(() => {
    if (value.districtId) {
      loadUpazilas(value.districtId);
    } else {
      setUpazilas([]);
    }
  }, [value.districtId]);

  const loadDivisions = async () => {
    try {
      setLoading(prev => ({ ...prev, divisions: true }));
      const divisionOptions = await geographicalService.getDivisionOptions();
      setDivisions(divisionOptions);
    } catch (error) {
      console.error('Error loading divisions:', error);
    } finally {
      setLoading(prev => ({ ...prev, divisions: false }));
    }
  };

  const loadDistricts = async (divisionId: number) => {
    try {
      setLoading(prev => ({ ...prev, districts: true }));
      const districtOptions = await geographicalService.getDistrictOptions(divisionId);
      setDistricts(districtOptions);
    } catch (error) {
      console.error('Error loading districts:', error);
    } finally {
      setLoading(prev => ({ ...prev, districts: false }));
    }
  };

  const loadUpazilas = async (districtId: number) => {
    try {
      setLoading(prev => ({ ...prev, upazilas: true }));
      const upazilaOptions = await geographicalService.getUpazilaOptions(districtId);
      setUpazilas(upazilaOptions);
    } catch (error) {
      console.error('Error loading upazilas:', error);
    } finally {
      setLoading(prev => ({ ...prev, upazilas: false }));
    }
  };

  const handleDivisionChange = (event: SelectChangeEvent<number>) => {
    const divisionId = event.target.value as number;
    onChange({
      ...value,
      divisionId,
      districtId: null,
      upazilaId: null
    });
  };

  const handleDistrictChange = (event: SelectChangeEvent<number>) => {
    const districtId = event.target.value as number;
    onChange({
      ...value,
      districtId,
      upazilaId: null
    });
  };

  const handleUpazilaChange = (event: SelectChangeEvent<number>) => {
    const upazilaId = event.target.value as number;
    onChange({
      ...value,
      upazilaId
    });
  };

  const handleAddressLineChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...value,
      addressLine: event.target.value
    });
  };

  const handlePostalCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...value,
      postalCode: event.target.value
    });
  };


  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Address Information
      </Typography>
      
      <Grid container spacing={2}>
        {/* Address Line - Always full width at the top */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label={`Address Line ${required ? '*' : ''}`}
            value={value.addressLine}
            onChange={handleAddressLineChange}
            error={!!error?.addressLine}
            helperText={error?.addressLine}
            disabled={disabled}
            multiline
            rows={2}
            placeholder="Enter detailed address (house/building number, street, area)"
          />
        </Grid>

        {/* Division Selector - Responsive grid */}
        <Grid item xs={12} sm={6} md={6} lg={3}>
          <FormControl fullWidth error={!!error?.divisionId} disabled={disabled}>
            <InputLabel>Division {required && '*'}</InputLabel>
            <Select
              value={value.divisionId || ''}
              onChange={handleDivisionChange}
              label={`Division ${required ? '*' : ''}`}
            >
              <MenuItem value="">
                <em>Select Division</em>
              </MenuItem>
              {divisions.map((division) => (
                <MenuItem key={division.value} value={division.value}>
                  {division.label} ({division.bnLabel})
                </MenuItem>
              ))}
            </Select>
            {error?.divisionId && (
              <Typography variant="caption" color="error">
                {error.divisionId}
              </Typography>
            )}
          </FormControl>
        </Grid>

        {/* District Selector - Responsive grid */}
        <Grid item xs={12} sm={6} md={6} lg={3}>
          <FormControl 
            fullWidth 
            error={!!error?.districtId} 
            disabled={disabled || !value.divisionId || loading.districts}
          >
            <InputLabel>District {required && '*'}</InputLabel>
            <Select
              value={value.districtId || ''}
              onChange={handleDistrictChange}
              label={`District ${required ? '*' : ''}`}
            >
              <MenuItem value="">
                <em>Select District</em>
              </MenuItem>
              {districts.map((district) => (
                <MenuItem key={district.value} value={district.value}>
                  {district.label} ({district.bnLabel})
                </MenuItem>
              ))}
            </Select>
            {error?.districtId && (
              <Typography variant="caption" color="error">
                {error.districtId}
              </Typography>
            )}
          </FormControl>
        </Grid>

        {/* Upazila Selector - Responsive grid */}
        <Grid item xs={12} sm={6} md={6} lg={3}>
          <FormControl 
            fullWidth 
            error={!!error?.upazilaId} 
            disabled={disabled || !value.districtId || loading.upazilas}
          >
            <InputLabel>Upazila {required && '*'}</InputLabel>
            <Select
              value={value.upazilaId || ''}
              onChange={handleUpazilaChange}
              label={`Upazila ${required ? '*' : ''}`}
            >
              <MenuItem value="">
                <em>Select Upazila</em>
              </MenuItem>
              {upazilas.map((upazila) => (
                <MenuItem key={upazila.value} value={upazila.value}>
                  {upazila.label} ({upazila.bnLabel})
                </MenuItem>
              ))}
            </Select>
            {error?.upazilaId && (
              <Typography variant="caption" color="error">
                {error.upazilaId}
              </Typography>
            )}
          </FormControl>
        </Grid>

        {/* Postal Code - Responsive grid */}
        <Grid item xs={12} sm={6} md={6} lg={3}>
          <TextField
            fullWidth
            label="Postal Code"
            value={value.postalCode || ''}
            onChange={handlePostalCodeChange}
            disabled={disabled}
            placeholder="Enter postal code"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddressSelector;
