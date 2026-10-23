import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/auth/LoginPage';
import { AdminLayout } from './components/layout/AdminLayout';
import { OverviewPage } from './pages/admin/OverviewPage';
import { ManagersPage } from './pages/admin/ManagersPage';
import { OrganizationPage } from './pages/admin/OrganizationPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Company Admin Area */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/overview" replace />} />
          <Route path="overview" element={<OverviewPage />} />
          <Route path="managers" element={<ManagersPage />} />
          <Route path="organization" element={<OrganizationPage />} />
          <Route path="*" element={<Navigate to="/admin/overview" replace />} />
        </Route>

        {/* Fallbacks */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;