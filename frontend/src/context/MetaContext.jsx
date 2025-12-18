import React, {
  createContext,
  useState,
  useContext,
} from "react";
import api from "@/api/axiosConfig";
import { useToast } from "@/components/ui/use-toast";

const MetaContext = createContext();

export const MetaProvider = ({ children }) => {
  const { toast } = useToast();

  // ===============================
  // 🔹 METAS GLOBALES (MetasPage)
  // ===============================
  const [metas, setMetas] = useState([]);
  const [loading, setLoading] = useState(false);

  // ===============================
  // 🔹 METAS POR INICIATIVA (Admin)
  // ===============================
  const [metasByDetalle, setMetasByDetalle] = useState({});
  const [loadingMetas, setLoadingMetas] = useState(false);

  // ===============================
  // NORMALIZADOR
  // ===============================
  const normalizeMeta = (m) => ({
    id: m.id_meta,
    codigo: m.codigo,
    nombre: m.nombre,
    descripcion: m.descripcion,
    cantidad: m.cantidad,
    valor: m.valor,
    valor2: m.valor2,
    valor3: m.valor3,
    valor4: m.valor4,
    recurrente: m.recurrente,
    progreso: m.progreso,
    id_detalle: m.id_detalle,
    id_unidad: m.id_unidad,
    unidad_nombre: m.unidad_nombre,
    id_secretaria: m.id_secretaria,
    secretaria_nombre: m.secretaria_nombre,
    municipios: m.municipios || [],
    numeroMetaManual: m.numero_meta_manual,
  });

  // =====================================================
  // 🔹 METAS GLOBALES CON FILTROS (NUEVO)
  // =====================================================
  const fetchMetas = async (filters = {}) => {
    if (!filters.idPlan) return;

    setLoading(true);

    try {
      const params = new URLSearchParams();

      params.append("idPlan", filters.idPlan);

      if (filters.responsableId)
        params.append("responsableId", filters.responsableId);

      if (filters.municipioId)
        params.append("municipioId", filters.municipioId);

      if (filters.q) params.append("q", filters.q);

      if (filters.estadoProgreso)
        params.append("estadoProgreso", filters.estadoProgreso);

      const res = await api.get(`/metas?${params.toString()}`);

      setMetas(res.data.map(normalizeMeta));
    } catch (err) {
      toast({
        title: "Metas",
        description: "No se pudieron cargar las metas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  // ===============================
  // METAS POR INICIATIVA
  // ===============================
  const fetchMetasByDetalle = async (idDetalle) => {
    if (!idDetalle) return;

    setLoadingMetas(true);
    try {
      const res = await api.get(`/metas/detalle/${idDetalle}`);

      setMetasByDetalle((prev) => ({
        ...prev,
        [idDetalle]: res.data.map(normalizeMeta),
      }));
    } catch {
      toast({
        title: "Metas",
        description: "No se pudieron cargar las metas",
        variant: "destructive",
      });
    } finally {
      setLoadingMetas(false);
    }
  };

  // ===============================
  // CRUD
  // ===============================
  const createMeta = async (data) => {
    try {
      await api.post("/metas", data);
      toast({ title: "Meta creada correctamente" });
      await fetchMetasByDetalle(data.id_detalle);
      return true;
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "No se pudo crear la meta",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateMeta = async (id, data) => {
    try {
      await api.put(`/metas/${id}`, data);
      toast({ title: "Meta actualizada" });
      await fetchMetasByDetalle(data.id_detalle);
      return true;
    } catch {
      toast({
        title: "Error",
        description: "No se pudo actualizar la meta",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteMeta = async (meta) => {
    try {
      await api.delete(`/metas/${meta.id}`);
      toast({ title: "Meta eliminada" });
      await fetchMetasByDetalle(meta.id_detalle);
      return true;
    } catch {
      toast({
        title: "Error",
        description: "No se pudo eliminar la meta",
        variant: "destructive",
      });
      return false;
    }
  };

  return (
    <MetaContext.Provider
      value={{
        // MetasPage
        metas,
        loading,
        fetchMetas,

        // Admin
        metasByDetalle,
        loadingMetas,
        fetchMetasByDetalle,

        // CRUD
        createMeta,
        updateMeta,
        deleteMeta,
      }}
    >
      {children}
    </MetaContext.Provider>
  );
};

export const useMeta = () => {
  const ctx = useContext(MetaContext);
  if (!ctx)
    throw new Error("useMeta debe usarse dentro de MetaProvider");
  return ctx;
};
