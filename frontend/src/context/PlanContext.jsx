import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";

import { useToast } from "@/components/ui/use-toast";
import api from "@/api/axiosConfig";
import { useAuth } from "./AuthContext";

const PlanContext = createContext();

export const PlanProvider = ({ children }) => {
  const { toast } = useToast();

  const [planesDesarrollo, setPlanesDesarrollo] = useState([]);
  const [activePlanId, setActivePlanId] = useState(null);
  const [loading, setLoading] = useState(true);

  // ===============================
  // NORMALIZADOR
  // ===============================
  const normalizePlan = (p) => ({
    id: p.id_plan,
    nombrePlan: p.nombre_plan,
    vigenciaInicio: p.vigencia_inicio,
    vigenciaFin: p.vigencia_fin,
    esActivo: Number(p.es_activo),
    createdAt: p.created_at,
  });

  // ===============================
  // CARGA INICIAL
  // ===============================
  // ===============================
  // AUTH
  // ===============================
  const { isAuthenticated } = useAuth(); // Import useAuth hook first! (Checking imports...)

  // ===============================
  // CARGA INICIAL
  // ===============================
  useEffect(() => {
    const loadInitialData = async () => {
      if (!isAuthenticated) {
        setPlanesDesarrollo([]);
        setActivePlanId(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const res = await api.get("/planes-desarrollo");
        const planes = res.data.map(normalizePlan);

        setPlanesDesarrollo(planes);

        const storedPlanId = localStorage.getItem("activePlanId");

        if (storedPlanId && planes.some(p => p.id === Number(storedPlanId))) {
          setActivePlanId(Number(storedPlanId));
        } else {
          const activo = planes.find((p) => p.esActivo === 1);
          setActivePlanId(activo?.id || planes[0]?.id || null);
        }
      } catch (err) {
        console.error("Error cargando planes:", err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [isAuthenticated]);

  // ===============================
  // PLAN ACTIVO
  // ===============================
  const getActivePlan = useCallback(
    () => planesDesarrollo.find((p) => p.id === activePlanId),
    [planesDesarrollo, activePlanId]
  );

  // ===============================
  // CRUD PLANES
  // ===============================
  const addPlanDesarrollo = async (nuevoPlan) => {
    try {
      const res = await api.post("/planes-desarrollo", nuevoPlan);
      setPlanesDesarrollo((prev) => [
        ...prev,
        normalizePlan(res.data),
      ]);
    } catch {
      toast({
        title: "Error",
        description: "No se pudo crear el plan",
        variant: "destructive",
      });
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
      toast({
        title: "Error",
        description: "No se pudo actualizar el plan",
        variant: "destructive",
      });
    }
  };

  const deletePlanDesarrollo = async (id) => {
    try {
      await api.delete(`/planes-desarrollo/${id}`);
      setPlanesDesarrollo((prev) =>
        prev.filter((p) => p.id !== id)
      );
    } catch {
      toast({
        title: "Error",
        description: "No se pudo eliminar el plan",
        variant: "destructive",
      });
    }
  };

  const setActivePlanContext = async (id) => {
    try {
      await api.put(`/planes-desarrollo/${id}/activar`);
    } catch {
      console.warn("Error activando plan, solo local");
    }

    localStorage.setItem("activePlanId", id);

    setActivePlanId(id);
    setPlanesDesarrollo((prev) =>
      prev.map((p) => ({
        ...p,
        esActivo: p.id === id ? 1 : 0,
      }))
    );
  };

  const activePlan = planesDesarrollo.find(
    (p) => p.id === activePlanId
  );

  return (
    <PlanContext.Provider
      value={{
        planesDesarrollo,
        activePlanId,
        loading,
        getActivePlan,
        activePlan,
        addPlanDesarrollo,
        updatePlanDesarrolloInfo,
        deletePlanDesarrollo,
        setActivePlanContext,
      }}
    >
      {children}
    </PlanContext.Provider>
  );
};

export const usePlan = () => {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan debe usarse dentro de PlanProvider");
  return ctx;
};
