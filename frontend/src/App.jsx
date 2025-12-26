import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "@/pages/Dashboard";
import Layout from "@/components/Layout";
import MetasPage from "@/pages/MetasPage";
import AvancesPage from "@/pages/AvancesPage";
import InformesPage from "@/pages/InformesPage";
import AdminPlanPage from "@/pages/AdminPlanPage";
import LoginPage from "@/pages/LoginPage";
import ChangePasswordPage from "@/pages/ChangePasswordPage";

import { AuthProvider, useAuth } from "@/context/AuthContext";
import { PlanProvider } from "@/context/PlanContext";
import { MetaProvider } from "@/context/MetaContext";
import { SecretariaProvider } from "@/context/SecretariaContext";
import { MunicipioProvider } from "@/context/MunicipioContext";
import { UnidadProvider } from "@/context/UnidadContext";
import { ProgramacionProvider } from "@/context/ProgramacionContext";
import { AvanceProvider } from "@/context/AvanceContext";

/* ===============================
   RUTA PROTEGIDA
================================ */
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

  if (
    requiredRole &&
    currentUser.rol !== requiredRole &&
    currentUser.rol !== "admin"
  ) {
    return <Navigate to="/" replace />;
  }

  return children;
};

/* ===============================
   APP
================================ */
function App() {
  return (
    <AuthProvider>
      <UnidadProvider>
        <SecretariaProvider>
          <MunicipioProvider>
            <PlanProvider>
              <MetaProvider>
                <ProgramacionProvider>
                  <AvanceProvider>
                    <Routes>
                      {/* 🔓 Público */}
                      <Route path="/login" element={<LoginPage />} />

                      {/* 🔐 Protegido */}
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
                        <Route
                          path="change-password"
                          element={<ChangePasswordPage />}
                        />
                      </Route>
                    </Routes>
                  </AvanceProvider>
                </ProgramacionProvider>
              </MetaProvider>
            </PlanProvider>
          </MunicipioProvider>
        </SecretariaProvider>
      </UnidadProvider>
    </AuthProvider>
  );
}

export default App;
