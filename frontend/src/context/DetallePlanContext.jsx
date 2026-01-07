import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import api from "@/api/axiosConfig";
import { useToast } from "@/components/ui/use-toast";
import { buildTree } from "@/utils/buildTree";

const DetallePlanContext = createContext();

export const DetallePlanProvider = ({ planId, children }) => {
  const { toast } = useToast();

  const [detalles, setDetalles] = useState([]);
  const [loadingDetalles, setLoadingDetalles] = useState(false);

  // ===============================
  // NORMALIZADOR (FIJO)
  // ===============================
  const normalizeDetalle = useCallback((d) => ({
    id: d.id_detalle || d.id, // Support both formats
    idPlan: d.id_plan,
    nombre: d.nombre_detalle || d.nombre, // Support both formats might be safer
    codigo: d.codigo,
    idPadre: d.id_detalle_padre || d.idPadre,
    tipo: d.tipo,
  }), []);

  const tree = useMemo(() => buildTree(detalles), [detalles]);

  // ===============================
  // CARGAR DETALLES
  // ===============================
  const loadDetallesByPlan = useCallback(async () => {
    if (!planId) return;

    try {
      setLoadingDetalles(true);
      const res = await api.get(`/detalles-plan/${planId}`);
      setDetalles(res.data.map(normalizeDetalle));
    } catch (err) {
      console.error(err);
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
  const addDetalle = async ({ nombre, codigo, tipo, idPadre }) => {
    try {
      const res = await api.post("/detalles-plan", {
        id_plan: planId,
        nombre_detalle: nombre,
        codigo,
        tipo,
        id_detalle_padre: idPadre ?? null,
      });

      const nuevo = normalizeDetalle({
        ...res.data,
        id_plan: planId,
        nombre_detalle: nombre,
        codigo,
        tipo,
        id_detalle_padre: idPadre ?? null,
      });

      if (!nuevo.id) {
        console.error("❌ Error: ID faltante en respuesta de creación", res.data);
        toast({ title: "Error", description: "El servidor no devolvió un ID válido.", variant: "destructive" });
        return false;
      }

      setDetalles((prev) => [...prev, nuevo]);

      toast({
        title: "Detalle creado",
        description: "El elemento fue creado correctamente",
      });

      return true;
    } catch (err) {
      toast({
        title: "Error",
        description:
          err.response?.data?.message ||
          "No se pudo crear el elemento",
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
        description: "Cambios guardados",
      });

      return true;
    } catch {
      toast({
        title: "Error",
        description: "No se pudo actualizar",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteDetalle = async (id) => {
    try {
      await api.delete(`/detalles-plan/${id}`);
      setDetalles((prev) => prev.filter((d) => d.id !== id));

      toast({
        title: "Detalle eliminado",
        description: "Elemento eliminado",
      });

      return true;
    } catch (err) {
      toast({
        title: "Error",
        description:
          err.response?.data?.message ||
          "No se pudo eliminar",
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
      }}
    >
      {children}
    </DetallePlanContext.Provider>
  );
};

export const useDetallePlan = () => {
  const ctx = useContext(DetallePlanContext);
  if (!ctx) {
    throw new Error(
      "useDetallePlan debe usarse dentro de DetallePlanProvider"
    );
  }
  return ctx;
};
