import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback
} from "react";

import { useToast } from "@/components/ui/use-toast";
import api from "@/api/axiosConfig";

import {
  planDesarrolloEstructura as initialPlanEstructura,
  municipiosDepartamentales as initialMunicipios,
  responsables as initialResponsables,
  unidadesMedida as initialUnidadesMedida,
} from "@/context/metasData.js";

import { PlanManager } from "@/context/planContextModules/managePlans.js";
import { EstructuraPDIManager } from "@/context/planContextModules/manageEstructuraPDI.js";
import { CatalogoManager } from "@/context/planContextModules/manageCatalogos.js";
import { MetasManager } from "@/context/planContextModules/metasManager.js";
import { AvancesManager as AvancesManagerCreator } from "@/context/planContextModules/avancesManager.js";
import { manageAvancesInMetas } from "@/context/planContextModules/manageAvancesInMetas.js";

const PlanContext = createContext();

export const PlanProvider = ({ children }) => {
  const { toast } = useToast();

  const [planesDesarrollo, setPlanesDesarrollo] = useState([]);
  const [activePlanId, setActivePlanId] = useState(null);

  // Catálogos mock hasta que tu backend esté listo
  const [listaMunicipios, setListaMunicipios] = useState(initialMunicipios);
  const [listaResponsables, setListaResponsables] =
    useState(initialResponsables);
  const [listaUnidadesMedida, setListaUnidadesMedida] =
    useState(initialUnidadesMedida);

  const [loading, setLoading] = useState(true);

  // ============================================================
  // 🔹 Normalizador: backend → frontend
  // ============================================================
  const normalizePlan = (p) => ({
    id: p.id_plan,
  nombrePlan: p.nombre_plan,           
  vigenciaInicio: p.vigencia_inicio,   
  vigenciaFin: p.vigencia_fin,         
  esActivo: Number(p.es_activo),
  createdAt: p.created_at,
  estructuraPDI: JSON.parse(JSON.stringify(initialPlanEstructura))
  });

  // ============================================================
  // 🔹 Intentar cargar desde API, fallback a mock si falla
  // ============================================================
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);

        const res = await api.get("/planes-desarrollo");
        let planes = res.data;

        if (!planes || planes.length === 0) {
          console.warn("⚠ No hay planes en la API → usando modo temporal");
          throw new Error("No data → fallback");
        }

        const normalizados = planes.map(normalizePlan);
        setPlanesDesarrollo(normalizados);

        const activo = normalizados.find((p) => p.es_activo === 1);
        setActivePlanId(activo?.id || normalizados[0]?.id);

        console.log("🟢 Datos cargados desde API");
      } catch (err) {
        console.error("❌ Error cargando desde API:", err.message);

        // fallback seguro
        console.log("🟡 Usando datos temporales (mock)");
        setPlanesDesarrollo([
          {
            id: 1,
            nombre_plan: "Plan de Desarrollo Temporal",
            vigencia_inicio: "2024-01-01",
            vigencia_fin: "2027-12-31",
            es_activo: 1,
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

  // ============================================================
  // CRUD usando API pero sin romper si falla (mock)
  // ============================================================

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

  // ============================================================
  // Getters
  // ============================================================
  const getActivePlan = useCallback(
    () => planesDesarrollo.find((p) => p.id === activePlanId),
    [planesDesarrollo, activePlanId]
  );

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
  };

  return (
    <PlanContext.Provider value={contextValue}>
      {children}
    </PlanContext.Provider>
  );
};

export const usePlan = () => {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan debe usarse dentro de un PlanProvider");
  return ctx;
};
