import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';

// Components
import Layout from './components/shared/Layout';

// Pages
import Login from './pages/auth/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import Inventory from './pages/admin/Inventory';
import Customers from './pages/admin/Customers';
import PosTerminal from './pages/sales/PosTerminal';
import ShiftControl from './pages/sales/ShiftControl';

// New Admin Pages
import TransactionsList from './pages/admin/TransactionsList';
import StockControl from './pages/admin/StockControl';
import Suppliers from './pages/admin/Suppliers';
import PurchaseOrders from './pages/admin/PurchaseOrders';
import CreditAccounts from './pages/admin/CreditAccounts';
import Reports from './pages/admin/Reports';
import StaffList from './pages/admin/StaffList';
import Settings from './pages/admin/Settings';

// Simple Route Guard for Auth and Role checks
function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, currentUser } = useStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && currentUser?.role !== requiredRole) {
    // Sales Person cannot access admin pages
    if (currentUser?.role === 'sales') {
      return <Navigate to="/sales/pos" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
}

function App() {
  const { theme } = useStore();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <ProtectedRoute requiredRole="admin">
              <Inventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/stock"
          element={
            <ProtectedRoute requiredRole="admin">
              <StockControl />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/suppliers"
          element={
            <ProtectedRoute requiredRole="admin">
              <Suppliers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/purchase-orders"
          element={
            <ProtectedRoute requiredRole="admin">
              <PurchaseOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/customers"
          element={
            <ProtectedRoute requiredRole="admin">
              <Customers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/credit"
          element={
            <ProtectedRoute requiredRole="admin">
              <CreditAccounts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/transactions"
          element={
            <ProtectedRoute requiredRole="admin">
              <TransactionsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute requiredRole="admin">
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/staff"
          element={
            <ProtectedRoute requiredRole="admin">
              <StaffList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute requiredRole="admin">
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* Protected Sales/Shared Routes */}
        <Route
          path="/sales/pos"
          element={
            <ProtectedRoute>
              <PosTerminal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales/shift"
          element={
            <ProtectedRoute>
              <ShiftControl />
            </ProtectedRoute>
          }
        />

        {/* Fallbacks */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

