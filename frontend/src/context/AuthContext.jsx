import React, { createContext, useState, useContext, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

const AuthContext = createContext();

const initialUsers = [
  { id: 'admin-user-id', email: 'admin@example.com', nombre: 'Administrador Principal', rol: 'admin', password: 'adminpass', requiereCambioClave: false },
  { id: 'resp1-user-id', email: 'responsable1@example.com', nombre: 'Secretaría General', rol: 'responsable', password: 'resppass', requiereCambioClave: true },
  { id: 'resp2-user-id', email: 'responsable2@example.com', nombre: 'Oficina de Planeación', rol: 'responsable', password: 'resppass', requiereCambioClave: true },
];

// Helper para generar contraseñas aleatorias (simulado)
const generateRandomPassword = (length = 10) => {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
  let password = "";
  for (let i = 0, n = charset.length; i < length; ++i) {
    password += charset.charAt(Math.floor(Math.random() * n));
  }
  return password;
};


export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null); 
  const [users, setUsers] = useState(() => {
    const storedUsers = localStorage.getItem('app_users');
    return storedUsers ? JSON.parse(storedUsers) : initialUsers;
  });
  const [loading, setLoading] = useState(false); // Para simular cargas de API
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('app_users', JSON.stringify(users));
  }, [users]);

  const login = async (email, password) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simular delay

    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      setCurrentUser(user);
      toast({ title: 'Inicio de Sesión Exitoso', description: `Bienvenido, ${user.nombre}!` });
      if (user.requiereCambioClave && user.rol !== 'admin') {
        navigate('/change-password');
        toast({ title: 'Cambio de Contraseña Requerido', description: 'Por favor, actualiza tu contraseña inicial.', variant: 'default', duration: 7000 });
      } else {
        navigate('/');
      }
    } else {
      toast({ title: 'Error de Inicio de Sesión', description: 'Credenciales incorrectas.', variant: 'destructive' });
    }
    setLoading(false);
  };

  const logout = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    setCurrentUser(null);
    toast({ title: 'Sesión Cerrada', description: 'Has cerrado sesión correctamente.' });
    navigate('/login');
    setLoading(false);
  };

  const createUserContext = (email, nombre, rol) => {
    setLoading(true);
    if (users.find(u => u.email === email)) {
      toast({ title: 'Error', description: 'El email ya está en uso.', variant: 'destructive' });
      setLoading(false);
      return false;
    }
    const newPassword = generateRandomPassword();
    const newUser = { 
      id: uuidv4(), 
      email, 
      nombre, 
      rol, 
      password: newPassword, 
      requiereCambioClave: true 
    };
    setUsers(prevUsers => [...prevUsers, newUser]);
    toast({ title: 'Usuario Creado', description: `Usuario ${email} creado. Contraseña temporal: ${newPassword}` });
    setLoading(false);
    return true;
  };

  const resetPasswordContext = (userId) => {
    setLoading(true);
    const newPassword = generateRandomPassword();
    let userEmail = '';
    setUsers(prevUsers => prevUsers.map(u => {
      if (u.id === userId) {
        userEmail = u.email;
        return { ...u, password: newPassword, requiereCambioClave: true };
      }
      return u;
    }));
    toast({ title: 'Contraseña Restablecida', description: `Contraseña para ${userEmail} restablecida a: ${newPassword}` });
    setLoading(false);
    return true;
  };
  
  const updateUserRoleContext = (userId, newRol) => {
    setLoading(true);
    let userEmail = '';
    setUsers(prevUsers => prevUsers.map(u => {
      if (u.id === userId) {
        userEmail = u.email;
        // El admin no puede cambiar su propio rol
        if (u.rol === 'admin' && newRol !== 'admin') {
           toast({ title: 'Acción no permitida', description: 'El administrador principal no puede cambiar su propio rol.', variant: 'destructive' });
           return u; 
        }
        return { ...u, rol: newRol };
      }
      return u;
    }));
    if (userEmail) { // Solo mostrar toast si se encontró y actualizó el usuario
        toast({ title: 'Rol Actualizado', description: `Rol para ${userEmail} actualizado a ${newRol}.` });
    }
    setLoading(false);
    return true;
  };

  const changePasswordContext = (userId, currentPassword, newPassword) => {
    setLoading(true);
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      toast({ title: 'Error', description: 'Usuario no encontrado.', variant: 'destructive' });
      setLoading(false);
      return false;
    }

    const user = users[userIndex];
    if (user.password !== currentPassword) {
      toast({ title: 'Error', description: 'La contraseña actual es incorrecta.', variant: 'destructive' });
      setLoading(false);
      return false;
    }

    setUsers(prevUsers => {
      const updatedUsers = [...prevUsers];
      updatedUsers[userIndex] = { ...user, password: newPassword, requiereCambioClave: false };
      return updatedUsers;
    });
    
    // Actualizar currentUser también si es el usuario logueado
    if (currentUser && currentUser.id === userId) {
        setCurrentUser(prev => ({...prev, password: newPassword, requiereCambioClave: false }));
    }

    toast({ title: 'Contraseña Cambiada', description: 'Tu contraseña ha sido actualizada exitosamente.' });
    navigate('/'); // Redirigir al dashboard o a donde corresponda
    setLoading(false);
    return true;
  };
  
  const getAllUsersContext = () => {
    return users;
  };
  
  const deleteUserContext = (userId) => {
    setLoading(true);
    const userToDelete = users.find(u => u.id === userId);
    if (userToDelete && userToDelete.rol === 'admin') {
      toast({ title: 'Acción no permitida', description: 'No se puede eliminar al administrador principal.', variant: 'destructive' });
      setLoading(false);
      return false;
    }
    setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
    toast({ title: 'Usuario Eliminado', description: `Usuario ${userToDelete ? userToDelete.email : ''} eliminado.` });
    setLoading(false);
    return true;
  };


  const value = {
    currentUser,
    loading,
    isAuthenticated: !!currentUser,
    login,
    logout,
    createUserContext,
    resetPasswordContext,
    updateUserRoleContext,
    changePasswordContext,
    getAllUsersContext,
    deleteUserContext,
    // Para la simulacion de AdminUsuarios
    _users: users, 
    _setUsers: setUsers 
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