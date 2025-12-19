import React, {
  createContext,
  useState,
  useContext,
  useEffect,
} from "react";
import api, { setAuthTokens } from "@/api/axiosConfig";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  // ===============================
  // SESIÓN
  // ===============================
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ===============================
  // USUARIOS (ADMIN)
  // ===============================
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // ===============================
  // NORMALIZADOR
  // ===============================
  const normalizeUser = (u) => ({
    id: u.id_usuario,
    email: u.email,
    nombre: u.nombre,
    rol: u.rol,
    id_secretaria: u.id_secretaria,
    requiereCambioClave: Number(u.requiereCambioClave),
    es_activo: Number(u.es_activo ?? 1),
  });

  // ===============================
  // CARGAR SESIÓN GUARDADA
  // ===============================
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    if (storedUser && accessToken) {
      setAuthTokens(accessToken, refreshToken); // ✅ CLAVE
      setCurrentUser(JSON.parse(storedUser));
    }

    setLoading(false); // ✅ FIN DE REHIDRATACIÓN
  }, []);
  // ===============================
  // CARGAR USUARIOS (ADMIN)
  // ===============================
  const fetchUsers = async () => {
    if (!currentUser || currentUser.rol !== "admin") {
      setUsers([]);
      return;
    }

    setUsersLoading(true);
    try {
      const res = await api.get("/users");
      setUsers(res.data.map(normalizeUser));
    } catch (err) {
      toast({
        title: "Usuarios",
        description: "No se pudieron cargar los usuarios",
        variant: "destructive",
      });
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentUser]);

  // ===============================
  // LOGIN
  // ===============================
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
        description: `Bienvenido, ${user.nombre}`,
      });

      if (user.requiereCambioClave && user.rol !== "admin") {
        navigate("/change-password");
      } else {
        navigate("/");
      }
    } catch (err) {
      toast({
        title: "Error",
        description:
          err.response?.data?.message ||
          "Credenciales incorrectas o error de conexión",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // LOGOUT
  // ===============================
  const logout = () => {
    setAuthTokens(null, null);
    localStorage.removeItem("user");
    setCurrentUser(null);
    setUsers([]);
    navigate("/login");
  };

  // ===============================
  // CAMBIO DE CONTRASEÑA
  // ===============================
  const changePassword = async (currentPassword, newPassword) => {
    if (!currentUser) return;

    setLoading(true);
    try {
      await api.post("/auth/change-password", {
        userId: currentUser.id,
        currentPassword,
        newPassword,
      });

      const updatedUser = {
        ...currentUser,
        requiereCambioClave: false,
      };

      setCurrentUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      toast({
        title: "Contraseña actualizada",
      });

      navigate("/");
    } catch (err) {
      toast({
        title: "Error",
        description:
          err.response?.data?.message ||
          "No se pudo cambiar la contraseña",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // CRUD USUARIOS
  // ===============================
  const createUserContext = async (data) => {
    try {
      await api.post("/users", {
        email: data.email,
        nombre: data.nombre,
        rol: data.rol,
        id_secretaria: data.id_secretaria,
      });

      await fetchUsers();

      toast({
        title: "Usuario creado",
        description: data.email,
      });

      return true;
    } catch (err) {
      toast({
        title: "Error",
        description:
          err.response?.data?.message || "No se pudo crear el usuario",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateUserContext = async (id, data) => {
    try {
      await api.put(`/users/${id}`, {
        nombre: data.nombre,
        rol: data.rol,
        id_secretaria: data.id_secretaria,
        es_activo: data.es_activo,
      });

      await fetchUsers();

      toast({
        title: "Usuario actualizado",
      });

      return true;
    } catch {
      toast({
        title: "Error",
        description: "No se pudo actualizar el usuario",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteUserContext = async (id) => {
    try {
      await api.delete(`/users/${id}`);
      await fetchUsers();

      toast({
        title: "Usuario eliminado",
      });

      return true;
    } catch (err) {
      toast({
        title: "Error al eliminar",
        description:
          err.response?.data?.message ||
          "No se pudo eliminar el usuario",
        variant: "destructive",
      });

      console.error("Error delete user:", err);
      return false;
    }
  };


  // ===============================
  // CONTEXT VALUE
  // ===============================
  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        isAuthenticated: !!currentUser,

        // auth
        login,
        logout,
        changePassword,

        // usuarios
        _users: users,
        usersLoading,
        createUserContext,
        updateUserContext,
        deleteUserContext,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx)
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
};
