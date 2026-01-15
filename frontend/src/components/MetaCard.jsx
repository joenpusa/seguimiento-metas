import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Target,
  DollarSign,
  Eye,
  Calendar,
  CalendarPlus,
} from "lucide-react";

import MetaForm from "@/components/MetaForm";
import { useMeta } from "@/context/MetaContext";
import ProgramacionTrimestralForm from "@/components/ProgramacionTrimestralForm";
import ProgramacionTrimestralList from "@/components/ProgramacionTrimestralList";
import { usePlan } from "@/context/PlanContext";
import { useAuth } from "@/context/AuthContext";
import { useProgramacion } from "@/context/ProgramacionContext";

const MetaCard = ({ meta, viewMode = "grid" }) => {
  const [openMetaForm, setOpenMetaForm] = useState(false);
  const [programacionToEdit, setProgramacionToEdit] = useState(null);
  const { createProgramacion, updateProgramacion } = useProgramacion();

  const [showProgramacion, setShowProgramacion] = useState(false);
  const [showProgramacionList, setShowProgramacionList] = useState(false);

  const { fetchMetaById } = useMeta();
  const { getActivePlan } = usePlan();
  const { currentUser } = useAuth();

  const activePlan = getActivePlan();

  /* =========================
     NORMALIZACIÓN DE DATOS
  ========================== */
  const nombreMeta = meta.nombre ?? "Meta sin nombre";
  const nombreResponsable = meta.secretaria_nombre ?? "Sin responsable";
  const unidadMedida = meta.unidad_nombre ?? "";

  const porcentajeFisico = Number(meta.porcentajeFisico ?? 0);
  const estadoProgreso = meta.estadoProgreso ?? "SIN_INICIAR";

  // Usamos el total pre-calculado en el contexto
  const presupuestoTotal = Number(meta.presupuestoTotal) || 0;

  /* =========================
     UI HELPERS
  ========================== */
  const ESTADO_META_UI = {
    SIN_INICIAR: {
      label: "Sin iniciar",
      variant: "secondary",
    },
    EN_EJECUCION: {
      label: "En ejecución",
      variant: "default",
    },
    COMPLETADA: {
      label: "Completada",
      variant: "outline",
      className: "border-green-500 text-green-700",
    },
  };

  const getProgressColor = (value) => {
    if (value < 30) return "bg-red-500";
    if (value < 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  const estadoUI = ESTADO_META_UI[estadoProgreso];

  /* =========================
     PERMISOS
  ========================== */
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

  /* =========================
     HANDLERS
  ========================== */
  const handleViewMeta = async () => {
    await fetchMetaById(meta.id);
    setOpenMetaForm(true);
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);

  const handleProgramarTrimestre = async (data) => {
    let ok = false;
    if (programacionToEdit) {
      ok = await updateProgramacion(programacionToEdit.id, data);
    } else {
      ok = await createProgramacion(data);
    }

    if (ok) {
      setShowProgramacion(false);
      setProgramacionToEdit(null);
    }
  };

  const handleEditProgramacion = (prog) => {
    setProgramacionToEdit(prog);
    setShowProgramacionList(false);
    setShowProgramacion(true);
  };

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

              {estadoUI && (
                <Badge
                  variant={estadoUI.variant}
                  className={estadoUI.className}
                >
                  {estadoUI.label}
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {/* Barra de progreso */}
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full transition-all ${getProgressColor(
                  porcentajeFisico
                )}`}
                style={{ width: `${porcentajeFisico}%` }}
              />
            </div>

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
                    onClick={() => setShowProgramacionList(true)}
                    className="flex-1"
                  >
                    <Calendar className="h-4 w-4 mr-1" />
                    Prog.
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setProgramacionToEdit(null);
                      setShowProgramacion(true);
                    }}
                    className="flex-1"
                  >
                    <CalendarPlus className="h-4 w-4 mr-1" />
                    +
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Modal ver meta */}
      <MetaForm open={openMetaForm} onOpenChange={setOpenMetaForm} />

      {/* Lista programaciones */}
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
                  setProgramacionToEdit(null);
                  setShowProgramacion(true);
                }}
                onEdit={handleEditProgramacion}
              />
            </div>

            <div className="p-4 border-t">
              <Button
                onClick={() => setShowProgramacionList(false)}
                className="w-full"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Crear/Editar programación */}
      <ProgramacionTrimestralForm
        open={showProgramacion}
        onOpenChange={(v) => {
          setShowProgramacion(v);
          if (!v) setProgramacionToEdit(null);
        }}
        onSave={handleProgramarTrimestre}
        meta={meta}
        activePlan={activePlan}
        programacionToEdit={programacionToEdit}
      />
    </>
  );
};

export default MetaCard;
