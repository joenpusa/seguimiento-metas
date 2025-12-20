import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  User,
  Calendar,
  Target,
  DollarSign,
  Eye,
  CalendarPlus,
} from "lucide-react";

import MetaForm from "@/components/MetaForm";
import { useMeta } from "@/context/MetaContext";
import ProgramacionTrimestralForm from "@/components/ProgramacionTrimestralForm";
import ProgramacionTrimestralList from "@/components/ProgramacionTrimestralList";
import { usePlan } from "@/context/PlanContext";
import { useAuth } from "@/context/AuthContext";

const MetaCard = ({ meta, viewMode = "grid" }) => {
  // console.log(meta);
  const [openMetaForm, setOpenMetaForm] = useState(false);
  const [showProgramacion, setShowProgramacion] = useState(false);
  const [showProgramacionList, setShowProgramacionList] = useState(false);

  const { fetchMetaById } = useMeta(); 
  const { getActivePlan, programarTrimestre } = usePlan();
  const { currentUser } = useAuth();

  const activePlan = getActivePlan();

  /* =========================
     NORMALIZACIÓN DE DATOS
  ========================== */
  const nombreMeta = meta.nombre || "Meta sin nombre";
  const nombreResponsable =
    meta.secretaria_nombre|| "Sin responsable";

  const nombresMunicipios = Array.isArray(meta.municipios)
    ? meta.municipios.map((m) => m.nombre).join(", ")
    : "Sin municipios";

  const fechaLimite = meta.fecha_limite;

  const unidadMedida = meta.unidad_nombre || "";

  const presupuestoTotal =
    (meta.valor || 0) +
    (meta.valor2 || 0) +
    (meta.valor3 || 0) +
    (meta.valor4 || 0);

  /* ========================= */

  const getProgressColor = (progress) => {
    if (progress < 30) return "bg-red-500";
    if (progress < 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStatusBadge = (progress) => {
    if (progress === 0)
      return <Badge variant="secondary">Sin iniciar</Badge>;
    if (progress < 100)
      return <Badge variant="default">En progreso</Badge>;
    return (
      <Badge
        variant="outline"
        className="border-green-500 text-green-700"
      >
        Completada
      </Badge>
    );
  };

  const canManageProgramacion = () => {
    if (!currentUser) return false;
    if (currentUser.rol === "admin") return true;
    if (
      currentUser.rol === "responsable" &&
      meta.secretaria?.nombre === currentUser.nombre
    )
      return true;
    return false;
  };

const handleViewMeta = async () => {
    await fetchMetaById(meta.id);
    setOpenMetaForm(true);
  };

  const handleProgramarTrimestre = (data) => {
    programarTrimestre(meta.id, data);
    setShowProgramacion(false);
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);

  /* =========================
     VISTA GRID
  ========================== */
  return (
    <>
      <motion.div whileHover={{ scale: 1.02 }}>
        <Card className="h-full shadow-md hover:shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg leading-tight">
                  <span className="text-primary block text-sm font-normal mb-1">
                    Meta {meta.codigo}
                  </span>
                  {nombreMeta}
                </CardTitle>
              </div>
              {getStatusBadge(meta.progreso || 0)}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Progress
              value={meta.progreso || 0}
              className="h-2"
              indicatorClassName={getProgressColor(
                meta.progreso || 0
              )}
            />

            <div className="text-sm space-y-1">
              <div className="flex gap-2">
                <Target className="h-4 w-4" />
                {meta.cantidad} {unidadMedida}
              </div>
              <div className="flex gap-2">
                <DollarSign className="h-4 w-4" />
                {formatCurrency(presupuestoTotal)}
              </div>
              <div className="flex gap-2">
                <User className="h-4 w-4" />
                {nombreResponsable}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={handleViewMeta}
                className="flex-1 border"
              >
                <Eye className="h-4 w-4 mr-1" />
                Ver
              </Button>

              {canManageProgramacion() && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setShowProgramacionList(true)
                    }
                    className="flex-1"
                  >
                    Prog.
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setShowProgramacion(true)
                    }
                    className="flex-1"
                  >
                    +
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
      {/* llamado a la modal de ver detalles de meta */}
      <MetaForm open={openMetaForm} onOpenChange={setOpenMetaForm} /> 
      {/* llamado a la lista de programaciones */}
      {showProgramacionList && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">
                Programación - {nombreMeta}
              </h2>
            </div>
            <div className="p-4">
              <ProgramacionTrimestralList 
                meta={meta} 
                onProgramar={() => {
                  setShowProgramacionList(false);
                  setShowProgramacion(true);
                }}
              />
            </div>
            <div className="p-4 border-t">
              <Button onClick={() => setShowProgramacionList(false)} className="w-full">
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
        {/* formulario de crear una programacioin trimestral */}
       <ProgramacionTrimestralForm
          open={showProgramacion}
          onOpenChange={setShowProgramacion}
          onSave={handleProgramarTrimestre}
          meta={meta}
          activePlan={activePlan}
        />
    </>
  );
};

export default MetaCard;
