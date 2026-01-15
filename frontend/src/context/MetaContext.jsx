import React, {
  createContext,
  useState,
  useContext,
  useEffect,
} from "react";
import api from "@/api/axiosConfig";
import { useToast } from "@/components/ui/use-toast";
import { usePlan } from "@/context/PlanContext";

const MetaContext = createContext();

export const MetaProvider = ({ children }) => {
  const { toast } = useToast();
  const { activePlan, loading: loadingPlan } = usePlan();
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

    // IMPORTANTE: Para el form pasamos valores planos
    val1_pro: Number(m.val1_pro) || 0,
    val2_pro: Number(m.val2_pro) || 0,
    val3_pro: Number(m.val3_pro) || 0,
    val4_pro: Number(m.val4_pro) || 0,

    val1_sgp: Number(m.val1_sgp) || 0,
    val1_reg: Number(m.val1_reg) || 0,
    val1_cre: Number(m.val1_cre) || 0,
    val1_mun: Number(m.val1_mun) || 0,
    val1_otr: Number(m.val1_otr) || 0,

    val2_sgp: Number(m.val2_sgp) || 0,
    val2_reg: Number(m.val2_reg) || 0,
    val2_cre: Number(m.val2_cre) || 0,
    val2_mun: Number(m.val2_mun) || 0,
    val2_otr: Number(m.val2_otr) || 0,

    val3_sgp: Number(m.val3_sgp) || 0,
    val3_reg: Number(m.val3_reg) || 0,
    val3_cre: Number(m.val3_cre) || 0,
    val3_mun: Number(m.val3_mun) || 0,
    val3_otr: Number(m.val3_otr) || 0,

    val4_sgp: Number(m.val4_sgp) || 0,
    val4_reg: Number(m.val4_reg) || 0,
    val4_cre: Number(m.val4_cre) || 0,
    val4_mun: Number(m.val4_mun) || 0,
    val4_otr: Number(m.val4_otr) || 0,

    recurrente: m.recurrente ? true : false,
    fecha_limite: m.fecha_limite,

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

    municipios: m.municipios || [], // En lista general a veces viene string o array
    numeroMetaManual: m.numero_meta_manual,

    // POBLACION (Solo si el query las trae, en "Filtered" vienen select *)
    cantidad_0_5: m.cantidad_0_5 || 0,
    cantidad_6_12: m.cantidad_6_12 || 0,
    cantidad_13_17: m.cantidad_13_17 || 0,
    cantidad_18_24: m.cantidad_18_24 || 0,
    cantidad_25_62: m.cantidad_25_62 || 0,
    cantidad_65_mas: m.cantidad_65_mas || 0,

    cantesp_mujer: m.cantesp_mujer || 0,
    cantesp_discapacidad: m.cantesp_discapacidad || 0,
    cantesp_etnia: m.cantesp_etnia || 0,
    cantesp_victima: m.cantesp_victima || 0,
    cantesp_desmovilizado: m.cantesp_desmovilizado || 0,
    cantesp_lgtbi: m.cantesp_lgtbi || 0,
    cantesp_migrante: m.cantesp_migrante || 0,
    cantesp_indigente: m.cantesp_indigente || 0,
    cantesp_privado: m.cantesp_privado || 0,


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
    fecha_limite: m.fecha_limite, // Corregido nombre propiedad para coincidir con form

    // Valores planos para form
    val1_pro: Number(m.val1_pro) || 0,
    val2_pro: Number(m.val2_pro) || 0,
    val3_pro: Number(m.val3_pro) || 0,
    val4_pro: Number(m.val4_pro) || 0,

    val1_sgp: Number(m.val1_sgp) || 0,
    val1_reg: Number(m.val1_reg) || 0,
    val1_cre: Number(m.val1_cre) || 0,
    val1_mun: Number(m.val1_mun) || 0,
    val1_otr: Number(m.val1_otr) || 0,

    val2_sgp: Number(m.val2_sgp) || 0,
    val2_reg: Number(m.val2_reg) || 0,
    val2_cre: Number(m.val2_cre) || 0,
    val2_mun: Number(m.val2_mun) || 0,
    val2_otr: Number(m.val2_otr) || 0,

    val3_sgp: Number(m.val3_sgp) || 0,
    val3_reg: Number(m.val3_reg) || 0,
    val3_cre: Number(m.val3_cre) || 0,
    val3_mun: Number(m.val3_mun) || 0,
    val3_otr: Number(m.val3_otr) || 0,

    val4_sgp: Number(m.val4_sgp) || 0,
    val4_reg: Number(m.val4_reg) || 0,
    val4_cre: Number(m.val4_cre) || 0,
    val4_mun: Number(m.val4_mun) || 0,
    val4_otr: Number(m.val4_otr) || 0,

    recurrente: m.recurrente ? true : false,

    // AVANCES
    porcentajeFisico: Number(m.porcentaje_fisico) || 0,
    porcentajeFinanciero: Number(m.porcentaje_financiero) || 0,
    estadoProgreso: m.estadoProgreso || "SIN_INICIAR",

    // Relaciones ID para form
    id_unidad: m.id_unidad,
    id_secretaria: m.id_secretaria,

    unidad: {
      id: m.id_unidad,
      nombre: m.unidad_nombre,
    },

    secretaria: {
      id: m.id_secretaria,
      nombre: m.secretaria_nombre,
    },

    municipios: Array.isArray(m.municipios) ? m.municipios : [],

    // POBLACION
    cantidad_0_5: m.cantidad_0_5 || 0,
    cantidad_6_12: m.cantidad_6_12 || 0,
    cantidad_13_17: m.cantidad_13_17 || 0,
    cantidad_18_24: m.cantidad_18_24 || 0,
    cantidad_25_62: m.cantidad_25_62 || 0,
    cantidad_65_mas: m.cantidad_65_mas || 0,

    cantesp_mujer: m.cantesp_mujer || 0,
    cantesp_discapacidad: m.cantesp_discapacidad || 0,
    cantesp_etnia: m.cantesp_etnia || 0,
    cantesp_victima: m.cantesp_victima || 0,
    cantesp_desmovilizado: m.cantesp_desmovilizado || 0,
    cantesp_lgtbi: m.cantesp_lgtbi || 0,
    cantesp_migrante: m.cantesp_migrante || 0,
    cantesp_indigente: m.cantesp_indigente || 0,
    cantesp_privado: m.cantesp_privado || 0,

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
  //  CARGA INICIAL AUTOMÁTICA DE METAS
  // =====================================================
  useEffect(() => {
    if (loadingPlan) return;
    if (!activePlan?.id) return;

    fetchMetas({ idPlan: activePlan.id });
  }, [loadingPlan, activePlan?.id]);

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
    if (!idDetalle || !activePlan?.id) return;

    setLoadingMetas(true);
    try {
      const res = await api.get(
        `/metas/detalle/${idDetalle}`,
        { params: { idPlan: activePlan.id } }
      );

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
      const normalized = normalizeMetaDetail(res.data);
      setSelectedMeta(normalized);
      return normalized; // Retornamos para uso directo
    } catch (err) {
      toast({
        title: "Meta",
        description: "No se pudo cargar la información de la meta",
        variant: "destructive",
      });
      return null;
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
      await fetchMetas({ idPlan: activePlan.id });
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
      await fetchMetas({ idPlan: activePlan.id });
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

  const deleteMeta = async (id, idDetalle) => {
    try {
      await api.delete(`/metas/${id}`);
      toast({ title: "Meta eliminada" });

      await fetchMetasByDetalle(idDetalle);
      await fetchMetas({ idPlan: activePlan.id });

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
