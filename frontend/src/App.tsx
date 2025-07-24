import React, { Suspense, FC } from 'react';
import { useAuth } from './hooks/useAuth';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { CircularProgress, Box } from '@mui/material';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';

// Layouts
import MainLayout from './layouts/MainLayout';

// Components
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import EmailVerification from './pages/EmailVerification';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminDashboard from './pages/Dashboard';
import UserDashboard from './pages/UserDashboard';
import Profile from './pages/Profile';
import MarketplacesPage from './pages/MarketplacesPage';
import MarketplaceDetailPage from './pages/MarketplaceDetailPage';
import FabricsPage from './pages/FabricsPage';
import OrdersPage from './pages/OrdersPage';
import OrderFormPage from './pages/OrderFormPage';
import OrderDetailPage from './pages/OrderDetailPage';
import CustomersPage from './pages/CustomersPage';
import MessagingPage from './pages/MessagingPage';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';
import PrivacyPolicy from './pages/Privacy';

const SettingsPage = React.lazy(() => import('./pages/admin/SettingsPage'));
const UserManagement = React.lazy(() => import('./components/admin/UserManagement'));
const UserDetailPage = React.lazy(() => import('./pages/admin/UserDetailPage'));

const DashboardRouter: FC = () => {
  const { authState } = useAuth();
  const hasAdminDashboardPermission = 
    authState.user?.permissions?.includes('DASHBOARD_ADMIN_VIEW') || 
    authState.user?.roles.includes('ROLE_ADMIN');
  
  const hasUserDashboardPermission =
    authState.user?.permissions?.includes('DASHBOARD_USER_VIEW');
  
  if (hasAdminDashboardPermission) {
    return <AdminDashboard />;
  } else if (hasUserDashboardPermission) {
    return <UserDashboard />;
  } else {
    return <Navigate to="/unauthorized" replace />;
  }
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <CssBaseline enableColorScheme />
      <ToastProvider>
        <AuthProvider>
        <Router>
          <Box sx={{ 
            bgcolor: 'background.default', 
            color: 'text.primary',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Routes>
            {/* Public routes */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/verify-email" element={<EmailVerification />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />

            
            {/* Auth routes - accessible only when not authenticated */}
            <Route element={<ProtectedRoute requireAuth={false} />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Route>
            
            {/* Protected routes - require authentication */}
            <Route element={<MainLayout />}>
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={
                  <DashboardRouter />
                } />
                <Route path="/profile" element={<Profile />} />
              </Route>

              {/* Marketplace routes */}
              <Route element={<ProtectedRoute requiredPermissions={['MARKETPLACE_READ']} />}>
                <Route path="/marketplaces" element={<MarketplacesPage />} />
                <Route path="/marketplaces/:id" element={<MarketplaceDetailPage />} />
              </Route>
              
              {/* Fabric routes */}
              <Route element={<ProtectedRoute requiredPermissions={['FABRIC_READ']} />}>
                <Route path="/fabrics" element={<FabricsPage />} />
              </Route>
              
              {/* Order routes */}
              <Route element={<ProtectedRoute requiredPermissions={['ORDER_READ']} />}>
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/orders/:id" element={<OrderDetailPage />} />
              </Route>
              
              <Route element={<ProtectedRoute requiredPermissions={['ORDER_CREATE']} />}>
                <Route path="/orders/new" element={<OrderFormPage />} />
              </Route>
              
              <Route element={<ProtectedRoute requiredPermissions={['ORDER_UPDATE']} />}>
                <Route path="/orders/:id/edit" element={<OrderFormPage />} />
              </Route>
              
              {/* Customer routes */}
              <Route element={<ProtectedRoute requiredPermissions={['CUSTOMER_READ']} />}>
                <Route path="/customers" element={<CustomersPage />} />
              </Route>
              
              {/* Messaging routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/messaging" element={<MessagingPage />} />
              </Route>
              
              {/* Admin routes */}
              <Route element={<ProtectedRoute requireAdmin={true} />}>
                <Route path="/admin/users" element={
                  <Suspense fallback={<CircularProgress />}>
                    <UserManagement />
                  </Suspense>
                } />
                <Route path="/admin/users/:id" element={
                  <Suspense fallback={<CircularProgress />}>
                    <UserDetailPage />
                  </Suspense>
                } />
                <Route path="/admin/settings" element={
                  <Suspense fallback={<CircularProgress />}>
                    <SettingsPage />
                  </Suspense>
                } />
              </Route>
              
              {/* Error routes */}
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="*" element={<NotFound />} />
            </Route>
            </Routes>
          </Box>
        </Router>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
export default App;
