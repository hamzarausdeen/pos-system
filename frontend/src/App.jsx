import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AuthLayout from './layouts/AuthLayout';
import AdminLayout from './layouts/AdminLayout';
import CashierLayout from './layouts/CashierLayout';
import Loader from './components/Loader';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const SetupPage = lazy(() => import('./pages/SetupPage'));
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'));
const CategoriesPage = lazy(() => import('./pages/admin/CategoriesPage'));
const ProductsPage = lazy(() => import('./pages/admin/ProductsPage'));
const InventoryPage = lazy(() => import('./pages/admin/InventoryPage'));
const ReportsPage = lazy(() => import('./pages/admin/ReportsPage'));
const POSPage = lazy(() => import('./pages/cashier/POSPage'));
const SalesHistoryPage = lazy(() => import('./pages/SalesHistoryPage'));

const RoleRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return user.role === 'admin' ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/pos" replace />;
};

export default function App() {
  return (
    <Suspense fallback={<Loader fullScreen label="Loading app..." />}>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/setup" element={<SetupPage />} />
        </Route>

        <Route
          element={
            <ProtectedRoute>
              <RoleRedirect />
            </ProtectedRoute>
          }
          path="/"
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="sales" element={<SalesHistoryPage />} />
        </Route>

        <Route
          path="/pos"
          element={
            <ProtectedRoute roles={["admin", "cashier"]}>
              <CashierLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<POSPage />} />
          <Route path="sales" element={<SalesHistoryPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
