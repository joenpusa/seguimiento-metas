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
} from "@/context/metasData.js";

const PlanContext = createContext();

export const PlanProvider = ({ children }) => {
  const { toast } = useToast();

  const [planesDesarrollo, setPlanesDesarrollo] = useState([]);
  const [activePlanId, setActivePlanId] = useState(null);

  // ===============================
  // CATÁLOGOS
  // ===============================
  const [listaMunicipios] = useState(initialMunicipios);
  const [listaResponsables, setListaResponsables] =
    useState(initialResponsables);
  const [listaUnidadesMedida, setListaUnidadesMedida] = useState([]);

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

  const normalizeSecretaria = (s) => ({
    id: s.id_secretaria,
    nombre: s.nombre,
    esActivo: Number(s.es_activo),
  });

  const normalizeUnidad = (u) => ({
    id: u.id_unidad,
    nombre: u.nombre,
    codigo: u.codigo,
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

        // 🔹 SECRETARÍAS
        try {
          const resSecretarias = await api.get("/secretarias");
          setListaResponsables(
            resSecretarias.data.map(normalizeSecretaria)
          );
        } catch {
          setListaResponsables(initialResponsables);
        }

        // 🔹 UNIDADES
        const resUnidades = await api.get("/unidades");
        setListaUnidadesMedida(resUnidades.data.map(normalizeUnidad));
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
  // CRUD SECRETARÍAS (🔥 RESTAURADO)
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
    } catch {
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
    } catch {
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
    } catch {
      toast({
        title: "Error",
        description: "No se pudo eliminar la secretaría",
        variant: "destructive",
      });
    }
  };

  // ===============================
  // CRUD UNIDADES
  // ===============================
  const addUnidadMedida = async (nombre) => {
    try {
      const codigo = nombre
        .trim()
        .toUpperCase()
        .replace(/\s+/g, "_");

      const res = await api.post("/unidades", { nombre, codigo });

      setListaUnidadesMedida((prev) => [
        ...prev,
        { id: res.data.id, nombre, codigo },
      ]);

      return true;
    } catch {
      return false;
    }
  };

  const removeUnidadMedida = async (id) => {
    try {
      await api.delete(`/unidades/${id}`);
    } finally {
      setListaUnidadesMedida((prev) =>
        prev.filter((u) => u.id !== id)
      );
    }
  };

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

    // catálogos
    listaMunicipios,
    listaResponsables,
    listaUnidadesMedida,

    // responsables
    addResponsable,
    updateResponsableContext,
    removeResponsable,

    // unidades
    addUnidadMedida,
    removeUnidadMedida,
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
