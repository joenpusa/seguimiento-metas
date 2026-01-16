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
    anio: Number(p.anio),
    trimestre: p.trimestre,

    // Programado
    cantidadProgramada: p.cantidad_programada ?? p.cantidad,
    presupuestoProgramado: p.gasto_programado ?? p.gasto,

    // Desglose Programado
    gasto_programado_pro: p.gasto_programado_pro ?? 0,
    gasto_programado_cre: p.gasto_programado_cre ?? 0,
    gasto_programado_sgp: p.gasto_programado_sgp ?? 0,
    gasto_programado_mun: p.gasto_programado_mun ?? 0,
    gasto_programado_otr: p.gasto_programado_otr ?? 0,
    gasto_programado_reg: p.gasto_programado_reg ?? 0,

    // Avance (pueden ser null)
    cantidadAvanzada: p.cantidad_avance ?? 0,
    gastoAvanzado: p.gasto_avance ?? 0,

    // Calculado en backend
    estado: p.estado,

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
