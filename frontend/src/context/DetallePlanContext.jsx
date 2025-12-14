import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import api from "@/api/axiosConfig";
import { useToast } from "@/components/ui/use-toast";
import { buildTree } from "@/utils/buildTree";
import { useMemo } from "react";

const DetallePlanContext = createContext();

export const DetallePlanProvider = ({ planId, children }) => {
  const { toast } = useToast();

  const [detalles, setDetalles] = useState([]);
  const [loadingDetalles, setLoadingDetalles] = useState(false);
  const tree = useMemo(() => buildTree(detalles), [detalles]);

  // ===============================
  // NORMALIZADOR
  // ===============================
  const normalizeDetalle = useCallback((d) => ({
    id: d.id_detalle,
    idPlan: d.id_plan,
    nombre: d.nombre_detalle,
    codigo: d.codigo,
    idPadre: d.id_detalle_padre,
  }), []);

  // ===============================
  // CARGAR DETALLES POR PLAN
  // ===============================
  const loadDetallesByPlan = useCallback(async () => {
    if (!planId) return;

    try {
      setLoadingDetalles(true);
      const res = await api.get(`/detalles-plan/${planId}`);
      setDetalles(res.data.map(normalizeDetalle));
    } catch (err) {
      console.error("Error cargando detalles del plan", err);
      setDetalles([]);
    } finally {
      setLoadingDetalles(false);
    }
  }, [planId, normalizeDetalle]);

  useEffect(() => {
    loadDetallesByPlan();
  }, [loadDetallesByPlan]);

  // ===============================
  // CRUD
  // ===============================
  const addDetalle = async (data) => {
    try {
      const res = await api.post("/detalles-plan", {
        id_plan: planId,
        nombre_detalle: data.nombre,
        codigo: data.codigo,
        id_detalle_padre: data.idPadre ?? null,
      });

      const nuevoDetalle = {
        id: res.data.id_detalle,
        idPlan: planId,
        nombre: data.nombre,
        codigo: data.codigo,
        idPadre: data.idPadre ?? null,
      };

      setDetalles((prev) => [...prev, nuevoDetalle]);

      toast({
        title: "Detalle creado",
        description: "El detalle fue registrado correctamente",
      });

      return true;
    } catch (err) {
      toast({
        title: "Error",
        description: "No se pudo crear el detalle",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateDetalle = async (id, data) => {
    try {
      await api.put(`/detalles-plan/${id}`, {
        nombre_detalle: data.nombre,
        codigo: data.codigo,
      });

      setDetalles((prev) =>
        prev.map((d) =>
          d.id === id ? { ...d, ...data } : d
        )
      );

      toast({
        title: "Detalle actualizado",
        description: "Cambios guardados correctamente",
      });

      return true;
    } catch {
      toast({
        title: "Error",
        description: "No se pudo actualizar el detalle",
        variant: "destructive",
      });
      return false;
    }
  };
  const getSiguienteCodigo = (idPadre = null) => {
    const hijos = detalles.filter(d => d.idPadre === idPadre);

    if (hijos.length === 0) {
      return idPadre ? `${idPadre}.1` : '1';
    }

    const codigos = hijos
      .map(h => h.codigo)
      .map(c => c.split('.').pop())
      .map(n => parseInt(n, 10))
      .filter(Boolean);

    const siguiente = Math.max(...codigos) + 1;

    return idPadre ? `${idPadre}.${siguiente}` : `${siguiente}`;
  };

  const deleteDetalle = async (id) => {
    try {
      await api.delete(`/detalles-plan/${id}`);

      setDetalles((prev) => prev.filter((d) => d.id !== id));

      toast({
        title: "Detalle eliminado",
        description: "El detalle fue eliminado correctamente",
      });

      return true;
    } catch (err) {
      toast({
        title: "Error",
        description:
          err.response?.data?.message ||
          "No se pudo eliminar el detalle",
        variant: "destructive",
      });
      return false;
    }
  };

  return (
    <DetallePlanContext.Provider
        value={{
            detalles,
            tree,
            loadingDetalles,
            addDetalle,
            updateDetalle,
            deleteDetalle,
            reloadDetalles: loadDetallesByPlan,
            getSiguienteCodigo 
        }}
    >
      {children}
    </DetallePlanContext.Provider>
  );
};

export const useDetallePlan = () => {
  const ctx = useContext(DetallePlanContext);
  if (!ctx)
    throw new Error(
      "useDetallePlan debe usarse dentro de DetallePlanProvider"
    );
  return ctx;
};
