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

  // 🔑 Metas agrupadas por iniciativa (id_detalle)
  const [metasByDetalle, setMetasByDetalle] = useState({});
  const [loadingMetas, setLoadingMetas] = useState(false);

  // ===============================
  // NORMALIZADOR
  // ===============================
  const normalizeMeta = (m) => ({
    id: m.id_meta,
    nombre: m.nombre,
    descripcion: m.descripcion,
    cantidad: m.cantidad,
    valor: m.valor,
    valor2: m.valor2,
    valor3: m.valor3,
    valor4: m.valor4,
    recurrente: m.recurrente,
    id_detalle: m.id_detalle,
    id_unidad: m.id_unidad,
    unidad_nombre: m.unidad_nombre,
    id_secretaria: m.id_secretaria,
    secretaria_nombre: m.secretaria_nombre,
    municipios: m.municipios || [],
  });

  // ===============================
  // CARGAR METAS POR INICIATIVA
  // ===============================
  const fetchMetasByDetalle = async (idDetalle) => {
    if (!idDetalle) return;

    setLoadingMetas(true);
    try {
      const res = await api.get(`/metas/iniciativa/${idDetalle}`);

      setMetasByDetalle((prev) => ({
        ...prev,
        [idDetalle]: res.data.map(normalizeMeta),
      }));
    } catch (err) {
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
  // CREAR META
  // ===============================
  const createMeta = async (data) => {
    try {
      await api.post("/metas", data);

      toast({ title: "Meta creada correctamente" });

      // 🔄 refrescar tabla
      await fetchMetasByDetalle(data.id_detalle);

      return true;
    } catch (err) {
      toast({
        title: "Error",
        description:
          err.response?.data?.message || "No se pudo crear la meta",
        variant: "destructive",
      });
      return false;
    }
  };

  // ===============================
  // ACTUALIZAR META
  // ===============================
  const updateMeta = async (id, data) => {
    try {
      await api.put(`/metas/${id}`, data);

      toast({ title: "Meta actualizada" });

      // 🔄 refrescar tabla
      await fetchMetasByDetalle(data.id_detalle);

      return true;
    } catch (err) {
      toast({
        title: "Error",
        description:
          err.response?.data?.message || "No se pudo actualizar la meta",
        variant: "destructive",
      });
      return false;
    }
  };

  // ===============================
  // ELIMINAR META
  // ===============================
  const deleteMeta = async (meta) => {
    try {
      await api.delete(`/metas/${meta.id}`);

      toast({ title: "Meta eliminada" });

      // 🔄 refrescar tabla
      await fetchMetasByDetalle(meta.id_detalle);

      return true;
    } catch (err) {
      toast({
        title: "Error",
        description:
          err.response?.data?.message || "No se pudo eliminar la meta",
        variant: "destructive",
      });
      return false;
    }
  };

  return (
    <MetaContext.Provider
      value={{
        metasByDetalle,
        loadingMetas,
        fetchMetasByDetalle,
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
