import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import MetaCard from "@/components/MetaCard";
import MetasFilterControls from "@/components/MetasFilterControls";
import { useMeta } from "@/context/MetaContext";
import { useSecretaria } from "@/context/SecretariaContext";
import { useMunicipio } from "@/context/MunicipioContext";
import { usePlan } from "@/context/PlanContext";
import { useAuth } from "@/context/AuthContext";
import { Grid } from "lucide-react";

const MetasPage = () => {
  const { metas, loading, fetchMetas } = useMeta();
  const {
    getActivePlan,
  } = usePlan();
  const { currentUser } = useAuth();
  const { secretarias = [], } = useSecretaria();
  const { municipios = [], } = useMunicipio();

  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    responsableId: "",
    municipioId: "",
    estadoProgreso: "",
  });

  const activePlan = getActivePlan();

  useEffect(() => {
    if (!activePlan?.id) return;

    fetchMetas({
      idPlan: activePlan.id,
      q: searchTerm || null,
      responsableId:
        currentUser?.rol === "responsable"
          ? currentUser.id_secretaria
          : filters.responsableId || null,
      municipioId: filters.municipioId || null,
      estadoProgreso: filters.estadoProgreso || null,
    });
  }, [filters, searchTerm, currentUser, activePlan]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold">
            Metas del Plan: {activePlan?.nombrePlan || "N/A"}
          </h1>
        </div>

        <div className="flex gap-2">
          <Button
            size="icon"
            variant={viewMode === "grid" ? "secondary" : "outline"}
            onClick={() => setViewMode("grid")}
          >
            <Grid className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      <MetasFilterControls
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filters={filters}
        setFilters={setFilters}
        listaResponsables={secretarias}
        listaMunicipios={municipios}
        currentUser={currentUser}
      />

      {metas.length === 0 ? (
        <div className="text-center py-10">
          No se encontraron metas
        </div>
      ) : (
        <motion.div
          layout
          className={
            viewMode === "grid"
              ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }
        >
          <AnimatePresence>
            {metas.map((meta) => (
              <motion.div
                key={meta.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="h-full"
              >
                <MetaCard meta={meta} viewMode={viewMode} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default MetasPage;
