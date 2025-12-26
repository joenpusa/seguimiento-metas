import React, {
  createContext,
  useState,
  useContext,
  useCallback,
} from "react";

import api from "@/api/axiosConfig";
import { useToast } from "@/components/ui/use-toast";

const AvanceContext = createContext();

export const AvanceProvider = ({ children }) => {
  const { toast } = useToast();

  const [avances, setAvances] = useState([]);
  const [loadingAvances, setLoadingAvances] = useState(false);

  // ===============================
  // NORMALIZADOR
  // ===============================
    const normalizeAvance = (a) => ({
    id: a.id_avance,
    idMeta: Number(a.id_meta),
    anio: Number(a.anio),
    trimestre: a.trimestre,
    descripcion: a.descripcion,
    cantidadAvanzada: Number(a.cantidad),
    gastoEjecutado: Number(a.gasto),
    evidenciaURL: a.url_evidencia,
    createdAt: a.created_at,
    });


  // ===============================
  // FETCH
  // ===============================
  const fetchAvances = async (params = {}) => {
    try {
      setLoadingAvances(true);

      const res = await api.get("/avances", { params });
      setAvances(res.data.map(normalizeAvance));
    } catch (err) {
      console.error("❌ Error cargando avances", err);
      setAvances([]);

      toast({
        title: "Error",
        description: "No se pudieron cargar los avances",
        variant: "destructive",
      });
    } finally {
      setLoadingAvances(false);
    }
  };

  // ===============================
  // CRUD
  // ===============================
  const addAvance = async (data) => {
    try {
      await api.post("/avances", data);
      toast({ title: "Avance registrado correctamente" });
      return true;
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "No se pudo crear el avance",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateAvance = async (id, data) => {
    try {
      await api.put(`/avances/${id}`, data);
      toast({ title: "Avance actualizado correctamente" });
      return true;
    } catch {
      toast({
        title: "Error",
        description: "No se pudo actualizar el avance",
        variant: "destructive",
      });
      return false;
    }
  };

  const removeAvance = async (id) => {
    try {
      await api.delete(`/avances/${id}`);
      setAvances((prev) => prev.filter((a) => a.id !== id));

      toast({ title: "Avance eliminado correctamente" });
      return true;
    } catch {
      toast({
        title: "Error",
        description: "No se pudo eliminar el avance",
        variant: "destructive",
      });
      return false;
    }
  };

  return (
    <AvanceContext.Provider
      value={{
        avances,
        loadingAvances,
        fetchAvances,
        addAvance,
        updateAvance,
        removeAvance,
      }}
    >
      {children}
    </AvanceContext.Provider>
  );
};

export const useAvance = () => {
  const ctx = useContext(AvanceContext);
  if (!ctx)
    throw new Error("useAvance debe usarse dentro de AvanceProvider");
  return ctx;
};
