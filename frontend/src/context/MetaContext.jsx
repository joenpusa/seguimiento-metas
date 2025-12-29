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
  // METAS GLOBALES (MetasPage)
  // ===============================
  const [metas, setMetas] = useState([]);
  const [loading, setLoading] = useState(false);

  // ===============================
  // META SELECCIONADA (DETALLE)
  // ===============================
  const [selectedMeta, setSelectedMeta] = useState(null);
  const [loadingSelectedMeta, setLoadingSelectedMeta] = useState(false);

  // ===============================
  // METAS POR INICIATIVA (Admin)
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

    //  META
    cantidad: Number(m.cantidad) || 0,

    valores: {
      valor1: Number(m.valor) || 0,
      valor2: Number(m.valor2) || 0,
      valor3: Number(m.valor3) || 0,
      valor4: Number(m.valor4) || 0,
    },

    recurrente: m.recurrente,

    //  AVANCES (NUEVOS)
    porcentajeFisico: Number(m.porcentaje_fisico) || 0,
    porcentajeFinanciero: Number(m.porcentaje_financiero) || 0,
    estadoProgreso: m.estadoProgreso || "SIN_INICIAR",

    //  RELACIONES
    id_detalle: m.id_detalle,
    id_unidad: m.id_unidad,
    unidad_nombre: m.unidad_nombre,
    id_secretaria: m.id_secretaria,
    secretaria_nombre: m.secretaria_nombre,

    municipios: m.municipios || [],
    numeroMetaManual: m.numero_meta_manual,

    linea: m.linea_id
      ? { id: m.linea_id, codigo: m.linea_codigo, nombre: m.linea_nombre }
      : null,

    componente: m.componente_id
      ? { id: m.componente_id, codigo: m.componente_codigo, nombre: m.componente_nombre }
      : null,

    apuesta: m.apuesta_id
      ? { id: m.apuesta_id, codigo: m.apuesta_codigo, nombre: m.apuesta_nombre }
      : null,

    iniciativa: m.iniciativa_id
      ? { id: m.iniciativa_id, codigo: m.iniciativa_codigo, nombre: m.iniciativa_nombre }
      : null,
  });


  const normalizeMetaDetail = (m) => ({
    id: m.id_meta,
    codigo: m.codigo,
    nombre: m.nombre,
    descripcion: m.descripcion,

    cantidad: Number(m.cantidad) || 0,
    fechaLimite: m.fecha_limite,

    // 📊 AVANCES
    porcentajeFisico: Number(m.porcentaje_fisico) || 0,
    porcentajeFinanciero: Number(m.porcentaje_financiero) || 0,
    estadoProgreso: m.estadoProgreso || "SIN_INICIAR",

    valores: {
      valor1: Number(m.valor) || 0,
      valor2: Number(m.valor2) || 0,
      valor3: Number(m.valor3) || 0,
      valor4: Number(m.valor4) || 0,
    },

    unidad: {
      id: m.id_unidad,
      nombre: m.unidad_nombre,
    },

    secretaria: {
      id: m.id_secretaria,
      nombre: m.secretaria_nombre,
    },

    municipios: Array.isArray(m.municipios) ? m.municipios : [],

    linea: m.linea_id
      ? { id: m.linea_id, codigo: m.linea_codigo, nombre: m.linea_nombre }
      : null,

    componente: m.componente_id
      ? { id: m.componente_id, codigo: m.componente_codigo, nombre: m.componente_nombre }
      : null,

    apuesta: m.apuesta_id
      ? { id: m.apuesta_id, codigo: m.apuesta_codigo, nombre: m.apuesta_nombre }
      : null,

    iniciativa: m.iniciativa_id
      ? { id: m.iniciativa_id, codigo: m.iniciativa_codigo, nombre: m.iniciativa_nombre }
      : null,
  });



  // =====================================================
  // METAS GLOBALES CON FILTROS (NUEVO)
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
  // 🔹 OBTENER META POR ID
  // ===============================
  const fetchMetaById = async (idMeta) => {
    if (!idMeta) return;

    setLoadingSelectedMeta(true);
    setSelectedMeta(null);

    try {
      const res = await api.get(`/metas/${idMeta}`);
      setSelectedMeta(normalizeMetaDetail(res.data));
    } catch (err) {
      toast({
        title: "Meta",
        description: "No se pudo cargar la información de la meta",
        variant: "destructive",
      });
    } finally {
      setLoadingSelectedMeta(false);
    }
  };

  const clearSelectedMeta = () => {
    setSelectedMeta(null);
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

        // Meta detalle
        selectedMeta,
        loadingSelectedMeta,
        fetchMetaById,
        clearSelectedMeta,
        setSelectedMeta,

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
