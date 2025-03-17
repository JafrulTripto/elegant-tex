import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab, Paper, Grid, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import RoleManagement from '../../components/admin/RoleManagement';
import PermissionManagement from '../../components/admin/PermissionManagement';
import ProductTypeManagement from '../../components/admin/ProductTypeManagement';
import { 
  Security as SecurityIcon, 
  Category as CategoryIcon, 
  Style as StyleIcon 
} from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const a11yProps = (index: number) => {
  return {
    id: `settings-tab-${index}`,
    'aria-controls': `settings-tabpanel-${index}`,
  };
};

const SettingsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('roles-permissions');
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    // Reset tab value when changing sections
    if (section === 'roles-permissions') {
      setTabValue(0);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Settings
      </Typography>
      
      <Grid container spacing={3}>
        {/* Navigation Menu */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <List>
              <ListItem 
                onClick={() => handleSectionChange('roles-permissions')}
                sx={{ 
                  cursor: 'pointer',
                  bgcolor: activeSection === 'roles-permissions' ? 'rgba(0, 0, 0, 0.08)' : 'transparent'
                }}
              >
                <ListItemIcon><SecurityIcon /></ListItemIcon>
                <ListItemText primary="Roles & Permissions" />
              </ListItem>
              
              <ListItem 
                onClick={() => handleSectionChange('product-types')}
                sx={{ 
                  cursor: 'pointer',
                  bgcolor: activeSection === 'product-types' ? 'rgba(0, 0, 0, 0.08)' : 'transparent'
                }}
              >
                <ListItemIcon><CategoryIcon /></ListItemIcon>
                <ListItemText primary="Product Types" />
              </ListItem>
            </List>
          </Paper>
        </Grid>
        
        {/* Content Area */}
        <Grid item xs={12} md={9}>
          <Paper sx={{ p: 3 }}>
            {activeSection === 'roles-permissions' && (
              <Box>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                  <Tabs 
                    value={tabValue} 
                    onChange={handleTabChange} 
                    aria-label="roles and permissions tabs"
                  >
                    <Tab label="Roles" {...a11yProps(0)} />
                    <Tab label="Permissions" {...a11yProps(1)} />
                  </Tabs>
                </Box>
                
                <TabPanel value={tabValue} index={0}>
                  <RoleManagement />
                </TabPanel>
                
                <TabPanel value={tabValue} index={1}>
                  <PermissionManagement />
                </TabPanel>
              </Box>
            )}
            
            {activeSection === 'product-types' && (
              <ProductTypeManagement />
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SettingsPage;
