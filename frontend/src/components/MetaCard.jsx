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
import ProgramacionTrimestralForm from "@/components/ProgramacionTrimestralForm";
import ProgramacionTrimestralList from "@/components/ProgramacionTrimestralList";
import { usePlan } from "@/context/PlanContext";
import { useAuth } from "@/context/AuthContext";

const MetaCard = ({ meta, viewMode = "grid" }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showProgramacion, setShowProgramacion] = useState(false);
  const [showProgramacionList, setShowProgramacionList] = useState(false);

  const { getActivePlan, programarTrimestre } = usePlan();
  const { currentUser } = useAuth();

  const activePlan = getActivePlan();

  /* =========================
     NORMALIZACIÓN DE DATOS
  ========================== */
  const nombreMeta = meta.nombre || "Meta sin nombre";

  const nombreResponsable =
    meta.secretaria?.nombre || "Sin responsable";

  const nombresMunicipios = Array.isArray(meta.municipios)
    ? meta.municipios.map((m) => m.nombre).join(", ")
    : "Sin municipios";

  const fechaLimite = meta.fecha_limite;

  const unidadMedida = meta.unidad?.nombre || "";

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

  const handleProgramarTrimestre = (data) => {
    programarTrimestre(meta.id, data);
    setShowProgramacion(false);
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

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);

  /* =========================
     VISTA LISTA
  ========================== */
  if (viewMode === "list") {
    return (
      <>
        <motion.div whileHover={{ scale: 1.01 }}>
          <Card className="shadow-sm hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">
                    {nombreMeta}
                  </h3>
                  {getStatusBadge(meta.progreso || 0)}

                  <div className="grid md:grid-cols-3 gap-2 mt-2 text-sm text-muted-foreground">
                    <div className="flex gap-1">
                      <User className="h-4 w-4" />
                      {nombreResponsable}
                    </div>
                    <div className="flex gap-1">
                      <MapPin className="h-4 w-4" />
                      {nombresMunicipios}
                    </div>
                    <div className="flex gap-1">
                      <Calendar className="h-4 w-4" />
                      {fechaLimite
                        ? new Date(fechaLimite).toLocaleDateString()
                        : "Sin fecha"}
                    </div>
                  </div>
                </div>

                <div className="min-w-[160px] text-right">
                  <Progress
                    value={meta.progreso || 0}
                    className="h-2"
                    indicatorClassName={getProgressColor(
                      meta.progreso || 0
                    )}
                  />
                  <p className="text-xs mt-1">
                    {meta.cantidad} {unidadMedida}
                  </p>

                  <div className="flex justify-end gap-1 mt-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setShowDetails(true)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    {canManageProgramacion() && (
                      <>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() =>
                            setShowProgramacionList(true)
                          }
                        >
                          <Calendar className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setShowProgramacion(true)}
                        >
                          <CalendarPlus className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <MetaForm
          open={showDetails}
          onOpenChange={setShowDetails}
          metaToEdit={meta}
          onSave={() => {}}
        />

        <ProgramacionTrimestralForm
          open={showProgramacion}
          onOpenChange={setShowProgramacion}
          onSave={handleProgramarTrimestre}
          meta={meta}
          activePlan={activePlan}
        />

        {showProgramacionList && (
          <ProgramacionTrimestralList
            meta={meta}
            onClose={() => setShowProgramacionList(false)}
          />
        )}
      </>
    );
  }

  /* =========================
     VISTA GRID
  ========================== */
  return (
    <>
      <motion.div whileHover={{ scale: 1.02 }}>
        <Card className="h-full shadow-md hover:shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">
              {nombreMeta}
            </CardTitle>
            {getStatusBadge(meta.progreso || 0)}
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
              <div className="flex gap-2">
                <MapPin className="h-4 w-4" />
                {nombresMunicipios}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowDetails(true)}
                className="flex-1"
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
                    onClick={() => setShowProgramacion(true)}
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
    </>
  );
};

export default MetaCard;
