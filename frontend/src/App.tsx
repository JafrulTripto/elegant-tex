import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { CircularProgress, Box } from '@mui/material';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

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
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import MarketplacesPage from './pages/MarketplacesPage';
import MarketplaceDetailPage from './pages/MarketplaceDetailPage';
import FabricsPage from './pages/FabricsPage';
import OrdersPage from './pages/OrdersPage';
import OrderFormPage from './pages/OrderFormPage';
import OrderDetailPage from './pages/OrderDetailPage';
import CustomersPage from './pages/CustomersPage';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';

// Lazy loaded components
const SettingsPage = React.lazy(() => import('./pages/admin/SettingsPage'));
const UserManagement = React.lazy(() => import('./components/admin/UserManagement'));

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <CssBaseline enableColorScheme />
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
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/marketplaces" element={<MarketplacesPage />} />
                <Route path="/marketplaces/:id" element={<MarketplaceDetailPage />} />
                <Route path="/fabrics" element={<FabricsPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/orders/new" element={<OrderFormPage />} />
                <Route path="/orders/:id" element={<OrderDetailPage />} />
                <Route path="/orders/:id/edit" element={<OrderFormPage />} />
                <Route path="/customers" element={<CustomersPage />} />
              </Route>
              
              {/* Admin routes */}
              <Route element={<ProtectedRoute requireAdmin={true} />}>
                <Route path="/admin/users" element={
                  <Suspense fallback={<CircularProgress />}>
                    <UserManagement />
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
    </ThemeProvider>
  );
}
export default App;
