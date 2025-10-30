import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import Layout from '@/components/Layout';
import MetasPage from '@/pages/MetasPage';
import AvancesPage from '@/pages/AvancesPage';
import InformesPage from '@/pages/InformesPage';
import AdminPlanPage from '@/pages/AdminPlanPage';
import LoginPage from '@/pages/LoginPage';
import { MetasProvider } from '@/context/MetasContext';
import { PlanProvider } from '@/context/PlanContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import ChangePasswordPage from '@/pages/ChangePasswordPage';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && currentUser.rol !== requiredRole && currentUser.rol !== 'admin') {
    // Si se requiere un rol específico y el usuario no lo tiene (y no es admin, que tiene acceso a todo)
    // Podríamos redirigir a una página de "Acceso Denegado" o al Dashboard.
    // Por ahora, redirigimos al Dashboard.
    return <Navigate to="/" replace />;
  }


  return children;
};

function App() {
  return (
    <AuthProvider>
      <PlanProvider>
        <MetasProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="metas" element={<MetasPage />} />
              <Route path="avances" element={<AvancesPage />} />
              <Route path="informes" element={<InformesPage />} />
              <Route path="admin-plan" element={<AdminPlanPage />} />
              <Route path="change-password" element={
                <ProtectedRoute>
                  <ChangePasswordPage />
                </ProtectedRoute>
              } />
            </Route>
          </Routes>
        </MetasProvider>
      </PlanProvider>
    </AuthProvider>
  );
}

export default App;