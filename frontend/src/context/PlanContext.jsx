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
  municipiosDepartamentales as initialMunicipios,
  responsables as initialResponsables,
  unidadesMedida as initialUnidadesMedida,
} from "@/context/metasData.js";

const PlanContext = createContext();

export const PlanProvider = ({ children }) => {
  const { toast } = useToast();

  const [planesDesarrollo, setPlanesDesarrollo] = useState([]);
  const [activePlanId, setActivePlanId] = useState(null);

  // catálogos
  const [listaMunicipios, setListaMunicipios] = useState(initialMunicipios);
  const [listaResponsables, setListaResponsables] =
    useState(initialResponsables);
  const [listaUnidadesMedida, setListaUnidadesMedida] =
    useState(initialUnidadesMedida);

  const [loading, setLoading] = useState(true);

  // ===============================
  // Normalizadores
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

  const normalizeSecretaria = (s) => ({
    id: s.id_secretaria,
    nombre: s.nombre,
    esActivo: Number(s.es_activo),
  });

  // ===============================
  // Carga inicial
  // ===============================
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);

        // 🔹 PLANES
        const resPlanes = await api.get("/planes-desarrollo");
        const normalizados = resPlanes.data.map(normalizePlan);
        setPlanesDesarrollo(normalizados);

        const activo = normalizados.find((p) => p.esActivo === 1);
        setActivePlanId(activo?.id || normalizados[0]?.id);

        // 🔹 SECRETARÍAS
        try {
          const resSecretarias = await api.get("/secretarias");
          setListaResponsables(
            resSecretarias.data.map(normalizeSecretaria)
          );
        } catch {
          console.warn("⚠ Secretarías API falló → mock");
          setListaResponsables(initialResponsables);
        }
      } catch (err) {
        console.warn("⚠ API caída → usando mock general");

        setPlanesDesarrollo([
          {
            id: 1,
            nombrePlan: "Plan Temporal",
            vigenciaInicio: "2024-01-01",
            vigenciaFin: "2027-12-31",
            esActivo: 1,
            estructuraPDI: JSON.parse(JSON.stringify(initialPlanEstructura)),
          },
        ]);
        setActivePlanId(1);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // ===============================
  // CRUD PLANES
  // ===============================
  const addPlanDesarrollo = async (nuevoPlan) => {
    try {
      const res = await api.post("/planes-desarrollo", nuevoPlan);
      setPlanesDesarrollo((prev) => [...prev, normalizePlan(res.data)]);
    } catch {
      setPlanesDesarrollo((prev) => [
        ...prev,
        {
          id: Date.now(),
          nombrePlan: nuevoPlan.nombrePlan,
          vigenciaInicio: nuevoPlan.vigenciaInicio,
          vigenciaFin: nuevoPlan.vigenciaFin,
          esActivo: 0,
          estructuraPDI: JSON.parse(JSON.stringify(initialPlanEstructura)),
        },
      ]);
    }
  };

  const updatePlanDesarrolloInfo = async (id, datos) => {
    try {
      const res = await api.put(`/planes-desarrollo/${id}`, datos);
      setPlanesDesarrollo((prev) =>
        prev.map((p) => (p.id === id ? normalizePlan(res.data) : p))
      );
    } catch {
      setPlanesDesarrollo((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, nombrePlan: datos.nombrePlan } : p
        )
      );
    }
  };

  const deletePlanDesarrollo = async (id) => {
    try {
      await api.delete(`/planes-desarrollo/${id}`);
    } catch {}
    setPlanesDesarrollo((prev) => prev.filter((p) => p.id !== id));
  };

  const setActivePlanContext = async (id) => {
    try {
      await api.put(`/planes-desarrollo/${id}/activar`);
    } catch {}
    setActivePlanId(id);
    setPlanesDesarrollo((prev) =>
      prev.map((p) => ({ ...p, esActivo: p.id === id ? 1 : 0 }))
    );
  };

  const getActivePlan = useCallback(
    () => planesDesarrollo.find((p) => p.id === activePlanId),
    [planesDesarrollo, activePlanId]
  );

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
        { id: res.data.id, nombre, esActivo: 1 },
      ]);
      return true;
    } catch {
      setListaResponsables((prev) => [
        ...prev,
        { id: Date.now(), nombre, esActivo: 1 },
      ]);
      return true;
    }
  };

  const updateResponsableContext = async (id, data) => {
    try {
      await api.put(`/secretarias/${id}`, {
        nombre: data.nombre,
        es_activo: data.esActivo,
      });
    } catch {}

    setListaResponsables((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...data } : r))
    );
    return true;
  };

  const removeResponsable = async (id) => {
    try {
      await api.delete(`/secretarias/${id}`);
    } catch {}
    setListaResponsables((prev) => prev.filter((r) => r.id !== id));
  };

  // ===============================
  // CONTEXT VALUE
  // ===============================
  const contextValue = {
    planesDesarrollo,
    activePlanId,
    loading,

    addPlanDesarrollo,
    updatePlanDesarrolloInfo,
    deletePlanDesarrollo,
    setActivePlanContext,
    getActivePlan,

    listaMunicipios,
    listaResponsables,
    listaUnidadesMedida,

    addResponsable,
    updateResponsableContext,
    removeResponsable,
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
