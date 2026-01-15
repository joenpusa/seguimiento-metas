import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
} from "react";

import api from "@/api/axiosConfig";
import { useToast } from "@/components/ui/use-toast";
import { usePlan } from "@/context/PlanContext";


const AvanceContext = createContext();

export const AvanceProvider = ({ children }) => {
  const { toast } = useToast();
  const { activePlan } = usePlan();

  const [avances, setAvances] = useState([]);
  const [loadingAvances, setLoadingAvances] = useState(false);

  // ===============================
  // NORMALIZADOR
  // ===============================
  const normalizeAvance = (a) => {
    // Calcular total gasto sumando los campos nuevos
    const totalGasto =
      (Number(a.gasto_pro) || 0) +
      (Number(a.gasto_cre) || 0) +
      (Number(a.gasto_sgp) || 0) +
      (Number(a.gasto_reg) || 0) +
      (Number(a.gasto_otr) || 0) +
      (Number(a.gasto_mun) || 0);

    return {
      id: a.id_avance,
      idMeta: Number(a.id_meta),
      codigoMeta: a.meta_numero,
      metaNumero: a.meta_numero,
      metaNombre: a.meta_nombre,
      anio: Number(a.anio),
      trimestre: a.trimestre,
      descripcion: a.descripcion,
      cantidadAvanzada: Number(a.cantidad),

      // Gastos individualizados
      gasto_pro: Number(a.gasto_pro) || 0,
      gasto_cre: Number(a.gasto_cre) || 0,
      gasto_sgp: Number(a.gasto_sgp) || 0,
      gasto_reg: Number(a.gasto_reg) || 0,
      gasto_otr: Number(a.gasto_otr) || 0,
      gasto_mun: Number(a.gasto_mun) || 0,

      // Gasto total (para visualización rápida)
      gastoEjecutado: totalGasto,

      evidenciaURL: a.url_evidencia,
      createdAt: a.created_at,
      porcentajeFisico: Number(a.porcentaje_fisico ?? 0),
      porcentajeFinanciero: Number(a.porcentaje_financiero ?? 0),
      esUltimo: a.es_ultimo === 1,

      // Poblacion
      cantidad_0_5: Number(a.cantidad_0_5) || 0,
      cantidad_6_12: Number(a.cantidad_6_12) || 0,
      cantidad_13_17: Number(a.cantidad_13_17) || 0,
      cantidad_18_24: Number(a.cantidad_18_24) || 0,
      cantidad_25_62: Number(a.cantidad_25_62) || 0,
      cantidad_65_mas: Number(a.cantidad_65_mas) || 0,

      cantesp_mujer: Number(a.cantesp_mujer) || 0,
      cantesp_discapacidad: Number(a.cantesp_discapacidad) || 0,
      cantesp_etnia: Number(a.cantesp_etnia) || 0,
      cantesp_victima: Number(a.cantesp_victima) || 0,
      cantesp_desmovilizado: Number(a.cantesp_desmovilizado) || 0,
      cantesp_lgtbi: Number(a.cantesp_lgtbi) || 0,
      cantesp_migrante: Number(a.cantesp_migrante) || 0,
      cantesp_indigente: Number(a.cantesp_indigente) || 0,
      cantesp_privado: Number(a.cantesp_privado) || 0,
    };
  };


  // ===============================
  // FETCH
  // ===============================
  const fetchAvances = useCallback(async (params = {}) => {
    if (!activePlan?.id) return; // Guard clause

    try {
      setLoadingAvances(true);

      const res = await api.get("/avances", {
        params: { ...params, idPlan: activePlan.id }
      });

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
  }, [activePlan, toast]);

  const fetchAvanceById = useCallback(async (id) => {
    try {
      const res = await api.get(`/avances/${id}`);
      return normalizeAvance(res.data);
    } catch (err) {
      console.error("Error cargando avance por ID", err);
      toast({
        title: "Error",
        description: "No se pudo cargar la información del avance",
        variant: "destructive",
      });
      return null;
    }
  }, [toast]);


  // ===============================
  // FETCH DE DATOS INICIALES
  // ===============================
  useEffect(() => {
    if (!activePlan?.id) return;

    fetchAvances({
      idPlan: activePlan.id,
    });
  }, [activePlan?.id]);


  // ===============================
  // CRUD
  // ===============================
  const addAvance = async (data) => {
    try {
      await api.post("/avances", data);
      toast({ title: "Avance registrado correctamente" });
      if (activePlan?.id) {
        fetchAvances({ idPlan: activePlan.id });
      }
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
      if (activePlan?.id) {
        fetchAvances({ idPlan: activePlan.id });
      }
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
        fetchAvanceById,
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
