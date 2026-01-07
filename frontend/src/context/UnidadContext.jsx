import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import api from "@/api/axiosConfig";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "./AuthContext";

const UnidadContext = createContext();

export const UnidadProvider = ({ children }) => {
  const { toast } = useToast();

  const [unidades, setUnidades] = useState([]);
  const [loadingUnidades, setLoadingUnidades] = useState(false);

  // ===============================
  // NORMALIZADOR
  // ===============================
  const normalizeUnidad = (u) => ({
    id: u.id_unidad,
    nombre: u.nombre,
    codigo: u.codigo,
  });

  // ===============================
  // CARGAR UNIDADES
  // ===============================
  const { isAuthenticated } = useAuth();

  const fetchUnidades = useCallback(async () => {
    if (!isAuthenticated) {
      setUnidades([]);
      return;
    }

    setLoadingUnidades(true);
    try {
      const res = await api.get("/unidades");
      setUnidades(res.data.map(normalizeUnidad));
    } catch (err) {
      toast({
        title: "Unidades de medida",
        description: "No se pudieron cargar las unidades",
        variant: "destructive",
      });
      setUnidades([]);
    } finally {
      setLoadingUnidades(false);
    }
  }, [isAuthenticated, toast]);

  useEffect(() => {
    fetchUnidades();
  }, [fetchUnidades]);

  // ===============================
  // CREAR
  // ===============================
  const addUnidad = async (nombre) => {
    try {
      const codigo = nombre
        .trim()
        .toUpperCase()
        .replace(/\s+/g, "_");

      const res = await api.post("/unidades", { nombre, codigo });

      await fetchUnidades();

      toast({
        title: "Unidad creada",
        description: nombre,
      });

      return true;
    } catch (err) {
      toast({
        title: "Error",
        description:
          err.response?.data?.message ||
          "No se pudo crear la unidad",
        variant: "destructive",
      });
      return false;
    }
  };

  // ===============================
  // ELIMINAR
  // ===============================
  const removeUnidad = async (id) => {
    try {
      await api.delete(`/unidades/${id}`);
      setUnidades((prev) => prev.filter((u) => u.id !== id));

      toast({
        title: "Unidad eliminada",
      });

      return true;
    } catch (err) {
      toast({
        title: "Error",
        description:
          err.response?.data?.message ||
          "No se pudo eliminar la unidad",
        variant: "destructive",
      });
      return false;
    }
  };

  return (
    <UnidadContext.Provider
      value={{
        unidades,
        loadingUnidades,
        fetchUnidades,
        addUnidad,
        removeUnidad,
      }}
    >
      {children}
    </UnidadContext.Provider>
  );
};

export const useUnidad = () => {
  const ctx = useContext(UnidadContext);
  if (!ctx)
    throw new Error(
      "useUnidad debe usarse dentro de UnidadProvider"
    );
  return ctx;
};
