import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Button,
  useMediaQuery,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import ImagePreview from '../components/common/ImagePreview';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  People as PeopleIcon,
  ExitToApp as LogoutIcon,
  AccountCircle as AccountIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Settings as SettingsIcon,
  Storefront as StorefrontIcon,
  Category as CategoryIcon,
  ShoppingCart as ShoppingCartIcon,
  ContactPhone as ContactPhoneIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { styleUtils } from '../theme/styleUtils';
import { FooterBox, FooterText } from '../components/common/StyledComponents';

const drawerWidth = 240;

const MainLayout: React.FC = () => {
  const { authState, logout } = useAuth();
  const { theme, mode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const isActive = (path: string) => location.pathname === path;
  
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/login');
  };
  
  const handleNavigate = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const navStyle = (path: string) =>{
    return {color : isActive(path) ? theme.customColors.pinkDark : 'inherit' }
  }
  
  const hasAdminDashboardPermission = 
    authState.user?.permissions?.includes('DASHBOARD_ADMIN_VIEW') || 
    authState.user?.roles.includes('ROLE_ADMIN');
  
  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Elegant-Tex
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={() => handleNavigate('/dashboard')}>
            <ListItemIcon color="secondary">
              <DashboardIcon style={navStyle('/dashboard')}/>
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => handleNavigate('/profile')}>
            <ListItemIcon color="secondary">
              <PersonIcon style={navStyle('/profile')}/>
            </ListItemIcon>
            <ListItemText primary="Profile" />
          </ListItemButton>
        </ListItem>
        {(authState.user?.permissions?.includes('MARKETPLACE_READ') || authState.user?.roles.includes('ROLE_ADMIN')) && (
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleNavigate('/marketplaces')}>
              <ListItemIcon color="secondary">
                <StorefrontIcon style={navStyle('/marketplaces')}/>
              </ListItemIcon>
              <ListItemText primary="Marketplaces" />
            </ListItemButton>
          </ListItem>
        )}
        {(authState.user?.permissions?.includes('FABRIC_READ') || authState.user?.roles.includes('ROLE_ADMIN')) && (
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleNavigate('/fabrics')}>
              <ListItemIcon color="secondary">
                <CategoryIcon style={navStyle('/fabrics')}/>
              </ListItemIcon>
              <ListItemText primary="Fabrics" />
            </ListItemButton>
          </ListItem>
        )}
        {(authState.user?.permissions?.includes('ORDER_READ') || authState.user?.roles.includes('ROLE_ADMIN')) && (
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleNavigate('/orders')}>
              <ListItemIcon color="secondary">
                <ShoppingCartIcon style={navStyle('/orders')}/>
              </ListItemIcon>
              <ListItemText primary="Orders" />
            </ListItemButton>
          </ListItem>
        )}
        {(authState.user?.permissions?.includes('CUSTOMER_READ') || authState.user?.roles.includes('ROLE_ADMIN')) && (
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleNavigate('/customers')}>
              <ListItemIcon color="secondary">
                <ContactPhoneIcon style={navStyle('/customers')}/>
              </ListItemIcon>
              <ListItemText primary="Customers" />
            </ListItemButton>
          </ListItem>
        )}
        {(authState.user?.permissions?.includes('USER_READ') || authState.user?.roles.includes('ROLE_ADMIN')) && (
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleNavigate('/admin/users')}>
              <ListItemIcon color="secondary">
                <PeopleIcon style={navStyle('/admin/users')}/>
              </ListItemIcon>
              <ListItemText primary="User Management" />
            </ListItemButton>
          </ListItem>
        )}
        {hasAdminDashboardPermission && (
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleNavigate('/admin/settings')}>
              <ListItemIcon color="secondary">
                <SettingsIcon style={navStyle('/admin/settings')}/>
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </ListItemButton>
          </ListItem>
        )}
      </List>
    </div>
  );
  
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={styleUtils.appBar(drawerWidth)}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Elegant-Tex
          </Typography>
          {authState.isAuthenticated ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Tooltip title={mode === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}>
                <IconButton
                  color="inherit"
                  onClick={toggleTheme}
                  sx={{ mr: 1 }}
                >
                  {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
                </IconButton>
              </Tooltip>
              <IconButton
                size="large"
                edge="end"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                color="inherit"
              >
                {authState.user?.profileImageId ? (
                  <Box sx={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden' }}>
                    <ImagePreview
                      imageId={authState.user.profileImageId}
                      alt={`${authState.user.firstName || ''} ${authState.user.lastName || ''}`}
                      width={32}
                      height={32}
                      borderRadius={0}
                      fallbackText={authState.user.phone.charAt(0).toUpperCase()}
                    />
                  </Box>
                ) : (
                  <Avatar sx={{ width: 32, height: 32 }}>
                    {authState.user?.phone.charAt(0).toUpperCase()}
                  </Avatar>
                )}
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem 
                  onClick={() => {
                    handleMenuClose();
                    navigate('/profile');
                  }}
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <ListItemIcon color="secondary">
                    {authState.user?.profileImageId ? (
                      <Box sx={{ width: 24, height: 24, borderRadius: '50%', overflow: 'hidden' }}>
                        <ImagePreview
                          imageId={authState.user.profileImageId}
                          alt="Profile"
                          width={24}
                          height={24}
                          borderRadius={0}
                        />
                      </Box>
                    ) : (
                      <AccountIcon fontSize="small" />
                    )}
                  </ListItemIcon>
                  Profile
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon color="secondary">
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <div>
              <Button color="inherit" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button color="inherit" onClick={() => navigate('/register')}>
                Register
              </Button>
            </div>
          )}
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Toolbar />
        <Box sx={{ flexGrow: 1 }}>
          <Outlet />
        </Box>
        <FooterBox component="footer">
          <FooterText 
            variant="body2" 
            align="center"
          >
            © {new Date().getFullYear()} Tripzin. All rights reserved.
          </FooterText>
        </FooterBox>
      </Box>
    </Box>
  );
};

export default MainLayout;
