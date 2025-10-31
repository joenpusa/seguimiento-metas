import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '@/config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Cargar sesión guardada
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      setCurrentUser(JSON.parse(storedUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
  }, []);

  // 🔹 LOGIN: valida contra el backend real
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      const { token, user } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setCurrentUser(user);

      toast({
        title: 'Inicio de Sesión Exitoso',
        description: `Bienvenido, ${user.nombre}!`,
      });

      if (user.requiereCambioClave && user.rol !== 'admin') {
        toast({
          title: 'Cambio de Contraseña Requerido',
          description: 'Por favor, actualiza tu contraseña inicial.',
          duration: 7000,
        });
        navigate('/change-password');
      } else {
        navigate('/');
      }
    } catch (err) {
      toast({
        title: 'Error de Inicio de Sesión',
        description: err.response?.data?.message || 'Credenciales incorrectas o error de conexión.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // 🔹 LOGOUT
  const logout = async () => {
    setLoading(true);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setCurrentUser(null);
    toast({
      title: 'Sesión Cerrada',
      description: 'Has cerrado sesión correctamente.',
    });
    navigate('/login');
    setLoading(false);
  };

  // 🔹 CAMBIO DE CONTRASEÑA (requiere token)
  const changePassword = async (currentPassword, newPassword) => {
    if (!currentUser) return;

    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/auth/change-password`, {
        userId: currentUser.id,
        currentPassword,
        newPassword,
      });

      toast({
        title: 'Contraseña Cambiada',
        description: 'Tu contraseña ha sido actualizada exitosamente.',
      });

      // Actualizar localmente el flag de cambio de clave
      const updatedUser = { ...currentUser, requiereCambioClave: false };
      setCurrentUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      navigate('/');
    } catch (err) {
      toast({
        title: 'Error al Cambiar Contraseña',
        description: err.response?.data?.message || 'No se pudo cambiar la contraseña.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // 🔹 RESTABLECER CONTRASEÑA (solo admin)
  const resetPassword = async (userId) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/reset-password`, { userId });
      const { tempPassword } = res.data;

      toast({
        title: 'Contraseña Restablecida',
        description: `Nueva contraseña temporal: ${tempPassword}`,
      });
      return true;
    } catch (err) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'No se pudo restablecer la contraseña.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Obtener token actual
  const getToken = () => localStorage.getItem('token');

  const value = {
    currentUser,
    loading,
    isAuthenticated: !!currentUser,
    login,
    logout,
    changePassword,
    resetPassword,
    getToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
