import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";

import { useToast } from "@/components/ui/use-toast";
import api from "@/api/axiosConfig";

import {
  planDesarrolloEstructura as initialPlanEstructura,
  responsables as initialResponsables,
} from "@/context/metasData.js";

const PlanContext = createContext();

export const PlanProvider = ({ children }) => {
  const { toast } = useToast();

  const [planesDesarrollo, setPlanesDesarrollo] = useState([]);
  const [activePlanId, setActivePlanId] = useState(null);

  const [loading, setLoading] = useState(true);

  // ===============================
  // NORMALIZADORES
  // ===============================
  const normalizePlan = (p) => ({
    id: p.id_plan,
    nombrePlan: p.nombre_plan,
    vigenciaInicio: p.vigencia_inicio,
    vigenciaFin: p.vigencia_fin,
    esActivo: Number(p.es_activo),
    createdAt: p.created_at,
    estructuraPDI: JSON.parse(JSON.stringify(initialPlanEstructura)),
  });

  // ===============================
  // CARGA INICIAL
  // ===============================
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);

        // 🔹 PLANES
        const resPlanes = await api.get("/planes-desarrollo");
        const planes = resPlanes.data.map(normalizePlan);
        setPlanesDesarrollo(planes);

        const activo = planes.find((p) => p.esActivo === 1);
        setActivePlanId(activo?.id || planes[0]?.id);

      } catch (err) {
        console.error("Error cargando datos iniciales:", err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // ===============================
  // 🔥 FUNCIÓN CRÍTICA PARA METAS
  // ===============================
  const getActivePlan = useCallback(
    () => planesDesarrollo.find((p) => p.id === activePlanId),
    [planesDesarrollo, activePlanId]
  );

  // ===============================
  // CRUD PLANES DE DESARROLLO
  // ===============================

  const addPlanDesarrollo = async (nuevoPlan) => {
    try {
      const res = await api.post("/planes-desarrollo", nuevoPlan);
      const normalizado = normalizePlan(res.data);

      setPlanesDesarrollo((prev) => [...prev, normalizado]);
    } catch (err) {
      console.warn("⚠ Error API al crear plan → usando mock");

      const mock = {
        id: Date.now(),
        nombre_plan: nuevoPlan.nombrePlan,
        vigencia_inicio: nuevoPlan.vigenciaInicio,
        vigencia_fin: nuevoPlan.vigenciaFin,
        es_activo: 0,
        estructuraPDI: JSON.parse(JSON.stringify(initialPlanEstructura)),
      };

      setPlanesDesarrollo((prev) => [...prev, mock]);
    }
  };

  const updatePlanDesarrolloInfo = async (id, datos) => {
    try {
      const res = await api.put(`/planes-desarrollo/${id}`, datos);
      const actualizado = normalizePlan(res.data);

      setPlanesDesarrollo((prev) =>
        prev.map((p) => (p.id === id ? actualizado : p))
      );
    } catch {
      console.warn("⚠ Error API al actualizar → actualización local");

      setPlanesDesarrollo((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, nombre_plan: datos.nombrePlan } : p
        )
      );
    }
  };

  const deletePlanDesarrollo = async (id) => {
    try {
      await api.delete(`/planes-desarrollo/${id}`);
      setPlanesDesarrollo((prev) => prev.filter((p) => p.id !== id));
    } catch {
      console.warn("⚠ Error API al eliminar → borrando local");

      setPlanesDesarrollo((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const setActivePlanContext = async (id) => {
    try {
      await api.put(`/planes-desarrollo/${id}/activar`);
    } catch {
      console.warn("⚠ Error API al activar → solo local");
    }

    setActivePlanId(id);

    setPlanesDesarrollo((prev) =>
      prev.map((p) => ({ ...p, es_activo: p.id === id ? 1 : 0 }))
    );
  };

  // ===============================
  // CONTEXT VALUE (🔥 COMPLETO)
  // ===============================
  const contextValue = {
    planesDesarrollo,
    activePlanId,
    loading,

    // 🔥 planes
    addPlanDesarrollo,
    updatePlanDesarrolloInfo,
    getActivePlan,
    deletePlanDesarrollo,
    setActivePlanContext,

  };

  return (
    <PlanContext.Provider value={contextValue}>
      {children}
    </PlanContext.Provider>
  );
};

export const usePlan = () => {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan debe usarse dentro de PlanProvider");
  return ctx;
};
