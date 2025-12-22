import React, {
  createContext,
  useState,
  useContext,
} from "react";
import api from "@/api/axiosConfig";
import { useToast } from "@/components/ui/use-toast";

const ProgramacionContext = createContext();

export const ProgramacionProvider = ({ children }) => {
  const { toast } = useToast();

  const [programaciones, setProgramaciones] = useState([]);
  const [loadingProgramaciones, setLoadingProgramaciones] = useState(false);

  // ===============================
  // NORMALIZADOR
  // ===============================
  const normalizeProgramacion = (p) => ({
    id: p.id_programacion,
    idMeta: p.id_meta,
    anio: p.anio,
    trimestre: p.trimestre,
    cantidad: p.cantidad,
    gasto: p.gasto,
    createdAt: p.created_at,
  });

  // ===============================
  // LISTAR POR META
  // ===============================
  const fetchProgramacionesByMeta = async (idMeta) => {
    if (!idMeta) return;

    setLoadingProgramaciones(true);
    try {
      const res = await api.get(
        `/programaciones/meta/${idMeta}`
      );

      setProgramaciones(
        res.data.map(normalizeProgramacion)
      );
    } catch (err) {
      toast({
        title: "Programaciones",
        description:
          "No se pudieron cargar las programaciones",
        variant: "destructive",
      });
      setProgramaciones([]);
    } finally {
      setLoadingProgramaciones(false);
    }
  };

  // ===============================
  // CREAR
  // ===============================
  const createProgramacion = async (data) => {
    try {
      await api.post("/programaciones", data);

      toast({
        title: "Programación creada",
        description: `Año ${data.anio} - Trimestre ${data.trimestre}`,
      });

      // 🔄 refresca la lista
      await fetchProgramacionesByMeta(data.id_meta);

      return true;
    } catch (err) {
      toast({
        title: "Error",
        description:
          err.response?.data?.message ||
          "No se pudo crear la programación",
        variant: "destructive",
      });
      return false;
    }
  };

  // ===============================
  // ACTUALIZAR
  // ===============================
  const updateProgramacion = async (id, data) => {
    try {
      await api.put(`/programaciones/${id}`, data);

      toast({
        title: "Programación actualizada",
      });

      await fetchProgramacionesByMeta(data.id_meta);

      return true;
    } catch (err) {
      toast({
        title: "Error",
        description:
          err.response?.data?.message ||
          "No se pudo actualizar la programación",
        variant: "destructive",
      });
      return false;
    }
  };

  // ===============================
  // SIGUIENTE PROGRAMACION
  // ===============================
  const getSiguienteTrimestre = async (idMeta, plan) => {
    if (!idMeta || !plan) return null;
    const res = await api.get(
      `/programaciones/siguiente/${idMeta}`,
      {
        params: {
          anioInicio: plan.vigenciaInicio.split("-")[0],
          anioFin: plan.vigenciaFin.split("-")[0],
        },
      }
    );

    return res.data;
  };

  // ===============================
  // LIMPIAR
  // ===============================
  const clearProgramaciones = () => {
    setProgramaciones([]);
  };

  // ===============================
  // CONTEXT VALUE
  // ===============================
  return (
    <ProgramacionContext.Provider
      value={{
        programaciones,
        loadingProgramaciones,

        fetchProgramacionesByMeta,
        createProgramacion,
        updateProgramacion,
        clearProgramaciones,
        getSiguienteTrimestre,
      }}
    >
      {children}
    </ProgramacionContext.Provider>
  );
};

export const useProgramacion = () => {
  const ctx = useContext(ProgramacionContext);
  if (!ctx)
    throw new Error(
      "useProgramacion debe usarse dentro de ProgramacionProvider"
    );
  return ctx;
};
