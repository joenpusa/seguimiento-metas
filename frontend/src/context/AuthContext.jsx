import React, { createContext, useState, useContext, useEffect } from "react";
import api, { setAuthTokens } from "@/api/axiosConfig";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Cargar sesión guardada
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("accessToken");
    if (storedUser && storedToken) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  // 🔹 LOGIN
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      const { accessToken, refreshToken, user } = res.data;

      setAuthTokens(accessToken, refreshToken);
      localStorage.setItem("user", JSON.stringify(user));
      setCurrentUser(user);

      toast({
        title: "Inicio de sesión exitoso",
        description: `Bienvenido, ${user.nombre}!`,
      });

      if (user.requiereCambioClave && user.rol !== "admin") {
        toast({
          title: "Cambio de contraseña requerido",
          description: "Por favor, actualiza tu contraseña inicial.",
          duration: 7000,
        });
        navigate("/change-password");
      } else {
        navigate("/");
      }
    } catch (err) {
      toast({
        title: "Error de inicio de sesión",
        description:
          err.response?.data?.message ||
          "Credenciales incorrectas o error de conexión.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // 🔹 LOGOUT
  const logout = () => {
    setLoading(true);
    setAuthTokens(null, null);
    localStorage.removeItem("user");
    setCurrentUser(null);

    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente.",
    });

    navigate("/login");
    setLoading(false);
  };

  // 🔹 CAMBIO DE CONTRASEÑA
  const changePassword = async (currentPassword, newPassword) => {
    if (!currentUser) return;
    setLoading(true);
    try {
      await api.post("/auth/change-password", {
        userId: currentUser.id,
        currentPassword,
        newPassword,
      });

      toast({
        title: "Contraseña cambiada",
        description: "Tu contraseña ha sido actualizada exitosamente.",
      });

      const updatedUser = { ...currentUser, requiereCambioClave: false };
      setCurrentUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      navigate("/");
    } catch (err) {
      toast({
        title: "Error al cambiar contraseña",
        description:
          err.response?.data?.message || "No se pudo cambiar la contraseña.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // 🔹 RESTABLECER CONTRASEÑA (solo admin)
  const resetPassword = async (userId) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/reset-password", { userId });
      const { tempPassword } = res.data;

      toast({
        title: "Contraseña restablecida",
        description: `Nueva contraseña temporal: ${tempPassword}`,
      });
      return true;
    } catch (err) {
      toast({
        title: "Error",
        description:
          err.response?.data?.message ||
          "No se pudo restablecer la contraseña.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    loading,
    isAuthenticated: !!currentUser,
    login,
    logout,
    changePassword,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};
