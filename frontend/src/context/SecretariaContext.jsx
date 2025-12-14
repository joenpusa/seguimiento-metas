import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";

import { useToast } from "@/components/ui/use-toast";
import api from "@/api/axiosConfig";

const SecretariaContext = createContext();

// ===============================
// PROVIDER
// ===============================
export const SecretariaProvider = ({ children }) => {
  const { toast } = useToast();

  const [listaResponsables, setListaResponsables] = useState([]);

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
  useEffect(() => {
    const loadSecretarias = async () => {
      try {
        setLoadingSecretarias(true);

        const res = await api.get("/secretarias");
        setListaResponsables(res.data.map(normalizeSecretaria));
      } catch (err) {
        console.error("❌ Error cargando secretarías", err);

        setListaResponsables([]);

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
  }, [normalizeSecretaria]);

  // ===============================
  // CRUD SECRETARÍAS
  // ===============================
  const addResponsable = async (nombre) => {
    try {
      const res = await api.post("/secretarias", {
        nombre,
        es_activo: 1,
      });

      setListaResponsables((prev) => [
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

  const updateResponsableContext = async (id, data) => {
    try {
      await api.put(`/secretarias/${id}`, {
        nombre: data.nombre,
        es_activo: data.esActivo,
      });

      setListaResponsables((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...data } : r))
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

  const removeResponsable = async (id) => {
    try {
      await api.delete(`/secretarias/${id}`);

      setListaResponsables((prev) =>
        prev.filter((r) => r.id !== id)
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
    listaResponsables,
    loadingSecretarias,

    // CRUD
    addResponsable,
    updateResponsableContext,
    removeResponsable,
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
