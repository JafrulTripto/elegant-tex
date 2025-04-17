import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  FormControlLabel,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Chip,
  SelectChangeEvent,
  Grid,
  Typography,
  useTheme,
  alpha
} from '@mui/material';
import { Role } from '../../types';

interface UserFormData {
  phone: string;
  email: string;
  firstName: string;
  lastName: string;
  roleIds: string[];
  accountVerified: boolean;
  password?: string;
}

interface UserFormProps {
  initialData?: Partial<UserFormData>;
  roles: Role[];
  onDataChange: (data: UserFormData) => void;
  editMode?: boolean;
}

const UserForm: React.FC<UserFormProps> = ({
  initialData = {},
  roles,
  onDataChange,
  editMode = false
}) => {
  const theme = useTheme();
  
  // Form state
  const [formData, setFormData] = useState<UserFormData>({
    phone: '',
    email: '',
    firstName: '',
    lastName: '',
    roleIds: [],
    accountVerified: true,
    password: ''
  });

  // Initialize form with initial data
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      ...initialData
    }));
  }, [initialData]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };
    setFormData(updatedData);
    onDataChange(updatedData);
  };

  // Handle switch change
  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    const updatedData = { ...formData, [name]: checked };
    setFormData(updatedData);
    onDataChange(updatedData);
  };

  // Handle role selection
  const handleRoleChange = (event: SelectChangeEvent<string[]>) => {
    const { value } = event.target;
    const roleIds = typeof value === 'string' ? [value] : value;
    const updatedData = { ...formData, roleIds };
    setFormData(updatedData);
    onDataChange(updatedData);
  };

  return (
    <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            name="phone"
            label="Phone"
            fullWidth
            value={formData.phone}
            onChange={handleInputChange}
            required
            variant="outlined"
            size="medium"
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            name="email"
            label="Email"
            type="email"
            fullWidth
            value={formData.email}
            onChange={handleInputChange}
            required
            variant="outlined"
            size="medium"
          />
        </Grid>
      </Grid>
      
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            name="firstName"
            label="First Name"
            fullWidth
            value={formData.firstName}
            onChange={handleInputChange}
            required
            variant="outlined"
            size="medium"
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            name="lastName"
            label="Last Name"
            fullWidth
            value={formData.lastName}
            onChange={handleInputChange}
            variant="outlined"
            size="medium"
          />
        </Grid>
      </Grid>
      
      <FormControl fullWidth>
        <InputLabel id="roles-label">Roles</InputLabel>
        <Select
          labelId="roles-label"
          multiple
          value={formData.roleIds}
          onChange={handleRoleChange}
          input={<OutlinedInput label="Roles" />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => (
                <Chip 
                  key={value} 
                  label={value.replace('ROLE_', '')} 
                  sx={{ borderRadius: theme.shape.borderRadius }}
                />
              ))}
            </Box>
          )}
        >
          {roles.map((role) => (
            <MenuItem key={role.id} value={role.name}>
              {role.name.replace('ROLE_', '')}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      {!editMode && (
        <TextField
          name="password"
          label="Password"
          type="password"
          fullWidth
          value={formData.password || ''}
          onChange={handleInputChange}
          required={!editMode}
          helperText="Minimum 6 characters"
          variant="outlined"
          size="medium"
        />
      )}
      
      <Box 
        sx={{ 
          p: 2, 
          borderRadius: theme.shape.borderRadius,
          bgcolor: alpha(theme.palette.success.main, 0.05),
          border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
        }}
      >
        <FormControlLabel
          control={
            <Switch
              checked={formData.accountVerified}
              onChange={handleSwitchChange}
              name="accountVerified"
              color="success"
            />
          }
          label={
            <Typography variant="body2">
              {formData.accountVerified ? 'Active Account' : 'Inactive Account'}
            </Typography>
          }
        />
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          {formData.accountVerified 
            ? 'User will be able to log in and access the system.' 
            : 'User will not be able to log in until account is activated.'}
        </Typography>
      </Box>
    </Box>
  );
};

export default UserForm;
