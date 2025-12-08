import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Tabs, 
  Tab, 
  Container,
  useTheme,
  useMediaQuery
} from '@mui/material';
import RoleManagement from '../../components/admin/RoleManagement';
import PermissionManagement from '../../components/admin/PermissionManagement';
import ProductTypeManagement from '../../components/admin/ProductTypeManagement';
import StyleCodeManagement from '../../components/admin/StyleCodeManagement';
import { 
  Security as SecurityIcon, 
  Category as CategoryIcon,
  Settings as SettingsIcon,
  VpnKey as PermissionIcon,
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
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const SettingsPage: React.FC = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeTab, setActiveTab] = useState<number>(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Define the tabs with their icons and labels
  const tabs = [
    { label: "Roles", icon: <SecurityIcon fontSize="small" /> },
    { label: "Permissions", icon: <PermissionIcon fontSize="small" /> },
    { label: "Product Types", icon: <CategoryIcon fontSize="small" /> },
    { label: "Style Codes", icon: <StyleIcon fontSize="small" /> }
  ];

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ my: { xs: 2, sm: 3 } }}>
        {/* Header Section */}
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            mb: 2,
            pb: 1,
            borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <SettingsIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography 
              variant="h5" 
              component="h1"
              sx={{ fontWeight: 500 }}
            >
              Settings
            </Typography>
          </Box>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ ml: { sm: 4 } }}
          >
            Manage system configuration, roles, and permissions
          </Typography>
        </Box>
        
        {/* Navigation Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            aria-label="settings tabs"
            variant={isSmallScreen ? "fullWidth" : "standard"}
            sx={{
              '& .MuiTab-root': {
                minHeight: { xs: 48, sm: 56 },
                py: { xs: 0.5, sm: 1 },
                textTransform: 'none',
                fontSize: { xs: '0.8rem', sm: '0.9rem' }
              }
            }}
          >
            {tabs.map((tab, index) => (
              <Tab 
                key={index}
                icon={tab.icon} 
                label={tab.label} 
                iconPosition="start"
                sx={{ 
                  minWidth: { xs: 0, sm: 120 },
                  px: { xs: 1, sm: 2 }
                }}
              />
            ))}
          </Tabs>
        </Box>
        
        {/* Content Panels */}
        <TabPanel value={activeTab} index={0}>
          <RoleManagement />
        </TabPanel>
        
        <TabPanel value={activeTab} index={1}>
          <PermissionManagement />
        </TabPanel>
        
        <TabPanel value={activeTab} index={2}>
          <ProductTypeManagement />
        </TabPanel>
        
        <TabPanel value={activeTab} index={3}>
          <StyleCodeManagement />
        </TabPanel>
      </Box>
    </Container>
  );
};

export default SettingsPage;
