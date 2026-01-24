import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import api from "@/api/axiosConfig";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "./AuthContext";

const MunicipioContext = createContext();

export const MunicipioProvider = ({ children }) => {
  const { toast } = useToast();

  const [municipios, setMunicipios] = useState([]);
  const [loadingMunicipios, setLoadingMunicipios] = useState(false);

  // ===============================
  // NORMALIZADOR
  // ===============================
  const normalizeMunicipio = (m) => ({
    id: m.id_municipio,
    codigo: m.codigo_municipio,
    nombre: m.nombre,
    id_zona: m.id_zona,
  });

  // ===============================
  // CARGAR MUNICIPIOS
  // ===============================
  const { isAuthenticated } = useAuth();

  const fetchMunicipios = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoadingMunicipios(true);
    try {
      const res = await api.get("/municipios");
      setMunicipios(res.data.map(normalizeMunicipio));
    } catch (err) {
      toast({
        title: "Municipios",
        description: "No se pudieron cargar los municipios",
        variant: "destructive",
      });
      setMunicipios([]);
    } finally {
      setLoadingMunicipios(false);
    }
  }, [isAuthenticated, toast]);

  useEffect(() => {
    fetchMunicipios();
  }, [fetchMunicipios]);

  // ===============================
  // CREAR
  // ===============================
  const createMunicipio = async (data) => {
    try {
      await api.post("/municipios", data);
      await fetchMunicipios();

      toast({
        title: "Municipio creado",
        description: data.nombre,
      });

      return true;
    } catch (err) {
      toast({
        title: "Error",
        description:
          err.response?.data?.message ||
          "No se pudo crear el municipio",
        variant: "destructive",
      });
      return false;
    }
  };

  // ===============================
  // ACTUALIZAR
  // ===============================
  const updateMunicipio = async (id, data) => {
    try {
      await api.put(`/municipios/${id}`, data);
      await fetchMunicipios();

      toast({
        title: "Municipio actualizado",
      });

      return true;
    } catch (err) {
      toast({
        title: "Error",
        description:
          err.response?.data?.message ||
          "No se pudo actualizar el municipio",
        variant: "destructive",
      });
      return false;
    }
  };

  // ===============================
  // ELIMINAR
  // ===============================
  const deleteMunicipio = async (municipio) => {
    if (municipio.nombre.toLowerCase() === "todo el departamento") {
      toast({
        title: "Acción no permitida",
        description:
          "'Todo el departamento' no se puede eliminar",
        variant: "destructive",
      });
      return false;
    }

    try {
      await api.delete(`/municipios/${municipio.id}`);
      await fetchMunicipios();

      toast({
        title: "Municipio eliminado",
      });

      return true;
    } catch (err) {
      toast({
        title: "Error",
        description:
          err.response?.data?.message ||
          "No se pudo eliminar el municipio",
        variant: "destructive",
      });
      return false;
    }
  };

  // ===============================
  // CONTEXT VALUE
  // ===============================
  return (
    <MunicipioContext.Provider
      value={{
        municipios,
        loadingMunicipios,

        fetchMunicipios,
        createMunicipio,
        updateMunicipio,
        deleteMunicipio,
      }}
    >
      {children}
    </MunicipioContext.Provider>
  );
};

export const useMunicipio = () => {
  const ctx = useContext(MunicipioContext);
  if (!ctx)
    throw new Error(
      "useMunicipio debe usarse dentro de MunicipioProvider"
    );
  return ctx;
};
