import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";

import { useToast } from "@/components/ui/use-toast";
import api from "@/api/axiosConfig";
import { useAuth } from "./AuthContext";

const SecretariaContext = createContext();

// ===============================
// PROVIDER
// ===============================
export const SecretariaProvider = ({ children }) => {
  const { toast } = useToast();

  const [secretarias, setSecretarias] = useState([]);
  const [loadingSecretarias, setLoadingSecretarias] = useState(false);

  // ===============================
  // NORMALIZADOR
  // ===============================
  const normalizeSecretaria = useCallback((s) => ({
    id: s.id_secretaria,
    nombre: s.nombre,
    esActivo: Number(s.es_activo),
  }), []);

  // ===============================
  // CARGA INICIAL
  // ===============================
  const { isAuthenticated } = useAuth(); // Import useAuth hook

  useEffect(() => {
    const loadSecretarias = async () => {
      if (!isAuthenticated) {
        setSecretarias([]);
        return;
      }

      try {
        setLoadingSecretarias(true);

        const res = await api.get("/secretarias");
        setSecretarias(res.data.map(normalizeSecretaria));
      } catch (err) {
        console.error("❌ Error cargando secretarías", err);

        setSecretarias([]);

        toast({
          title: "Error",
          description: "No se pudieron cargar las secretarías",
          variant: "destructive",
        });
      } finally {
        setLoadingSecretarias(false);
      }
    };

    loadSecretarias();
  }, [normalizeSecretaria, toast, isAuthenticated]);

  // ===============================
  // CRUD
  // ===============================
  const addSecretaria = async (nombre) => {
    try {
      const res = await api.post("/secretarias", {
        nombre,
        es_activo: 1,
      });

      setSecretarias((prev) => [
        ...prev,
        {
          id: res.data.id,
          nombre,
          esActivo: 1,
        },
      ]);

      toast({
        title: "Secretaría creada",
        description: "La secretaría fue registrada correctamente",
      });

      return true;
    } catch (err) {
      toast({
        title: "Error",
        description: "No se pudo crear la secretaría",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateSecretaria = async (id, data) => {
    try {
      await api.put(`/secretarias/${id}`, {
        nombre: data.nombre,
        es_activo: data.esActivo,
      });

      setSecretarias((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...data } : s))
      );

      toast({
        title: "Secretaría actualizada",
        description: "Los datos fueron actualizados correctamente",
      });

      return true;
    } catch (err) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la secretaría",
        variant: "destructive",
      });
      return false;
    }
  };

  const removeSecretaria = async (id) => {
    try {
      await api.delete(`/secretarias/${id}`);

      setSecretarias((prev) =>
        prev.filter((s) => s.id !== id)
      );

      toast({
        title: "Secretaría eliminada",
        description: "La secretaría fue eliminada correctamente",
      });

      return true;
    } catch (err) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la secretaría",
        variant: "destructive",
      });
      return false;
    }
  };

  // ===============================
  // CONTEXT VALUE
  // ===============================
  const contextValue = {
    secretarias,
    loadingSecretarias,

    addSecretaria,
    updateSecretaria,
    removeSecretaria,
  };

  return (
    <SecretariaContext.Provider value={contextValue}>
      {children}
    </SecretariaContext.Provider>
  );
};

// ===============================
// HOOK
// ===============================
export const useSecretaria = () => {
  const ctx = useContext(SecretariaContext);
  if (!ctx)
    throw new Error(
      "useSecretaria debe usarse dentro de SecretariaProvider"
    );
  return ctx;
};
