import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterOrgPage } from './pages/auth/RegisterOrgPage';
import { AdminLayout } from './components/layout/AdminLayout';
import { OverviewPage } from './pages/admin/OverviewPage';
import { ManagersPage } from './pages/admin/ManagersPage';
import { OrganizationPage } from './pages/admin/OrganizationPage';
import { AlertsPage } from './pages/admin/AlertsPage';
import { ManagerPortal } from './pages/manager/ManagerPortal';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register-org" element={<RegisterOrgPage />} />

          {/* Company Admin Viewpoint (M1 Protected) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRole="COMPANY_ADMIN">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/overview" replace />} />
            <Route path="overview" element={<OverviewPage />} />
            <Route path="managers" element={<ManagersPage />} />
            <Route path="organization" element={<OrganizationPage />} />
            <Route path="alerts" element={<AlertsPage />} />
            <Route path="*" element={<Navigate to="/admin/overview" replace />} />
          </Route>

          {/* Manager Viewpoint (M3 Templates, M4 Tasks Protected) */}
          <Route
            path="/manager/*"
            element={
              <ProtectedRoute allowedRole="MANAGER">
                <ManagerPortal />
              </ProtectedRoute>
            }
          />

          {/* Fallbacks */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
