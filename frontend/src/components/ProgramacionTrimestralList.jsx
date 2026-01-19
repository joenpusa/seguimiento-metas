import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  Target,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useProgramacion } from "@/context/ProgramacionContext";
import AvanceFormulario from "@/components/avances/AvanceFormulario";

const ProgramacionTrimestralList = ({ meta, onProgramar, onEdit }) => {
  const { programaciones, fetchProgramacionesByMeta } = useProgramacion();

  const [openModal, setOpenModal] = useState(false);
  const [programacionSeleccionada, setProgramacionSeleccionada] = useState(null);

  useEffect(() => {
    if (!meta?.id) return;
    fetchProgramacionesByMeta(meta.id);
  }, [meta?.id]);

  const programacion = (programaciones || []).filter(
    (p) => p.idMeta === meta?.id
  );

  // ===============================
  // MAPEO VISUAL DE ESTADO
  // ===============================
  const getEstadoUI = (estado) => {
    switch (estado) {
      case "reportado":
        return {
          label: "Reportado",
          icon: CheckCircle,
          color: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
        };
      case "vencido":
        return {
          label: "Vencido",
          icon: AlertCircle,
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
        };
      default:
        return {
          label: "Pendiente",
          icon: Clock,
          color: "text-yellow-600",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
        };
    }
  };

  // ===============================
  // TOTALES
  // ===============================
  const totalProgramado = {
    cantidad: programacion.reduce(
      (sum, p) => sum + (p.cantidadProgramada || 0),
      0
    ),
    presupuesto: programacion.reduce(
      (sum, p) => sum + (p.presupuestoProgramado || 0),
      0
    ),
  };

  const totalAvanzado = {
    cantidad: programacion.reduce(
      (sum, p) => sum + (p.cantidadAvanzada || 0),
      0
    ),
    presupuesto: programacion.reduce(
      (sum, p) => sum + (p.gastoAvanzado || 0),
      0
    ),
  };

  const porcentajeCantidad =
    meta?.cantidad > 0
      ? (totalProgramado.cantidad / meta.cantidad) * 100
      : 0;

  const porcentajePresupuesto =
    totalProgramado.presupuesto > 0
      ? (totalAvanzado.presupuesto / totalProgramado.presupuesto) * 100
      : 0;

  // ===============================
  // RENDER
  // ===============================
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Programación Trimestral
            </span>
            <Button onClick={onProgramar} size="sm" variant="outline">
              Programar Siguiente
            </Button>
          </CardTitle>
        </CardHeader>

        <CardContent>
          {programacion.length === 0 ? (
            <div className="text-center py-6">
              <Target className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600 font-medium">
                No hay programación trimestral
              </p>
              <p className="text-sm text-muted-foreground">
                Debe programar los trimestres antes de reportar avances
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* RESUMEN */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500">Total Programado</p>
                  <p className="font-semibold">
                    {totalProgramado.cantidad} {meta?.unidadMedida}
                  </p>
                  <Progress value={porcentajeCantidad} className="h-1.5 mt-1" />
                  <p className="text-xs text-gray-500 mt-1">
                    {porcentajeCantidad.toFixed(1)}% de la meta total
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Presupuesto Programado
                  </p>
                  <p className="font-semibold">
                    ${totalProgramado.presupuesto.toLocaleString()}
                  </p>
                  <Progress
                    value={porcentajePresupuesto}
                    className="h-1.5 mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {porcentajePresupuesto.toFixed(1)}% ejecutado
                  </p>
                </div>
              </div>

              {/* LISTADO */}
              <div className="space-y-2">
                {programacion
                  .sort((a, b) => {
                    if (a.anio !== b.anio) return a.anio - b.anio;
                    return a.trimestre.localeCompare(b.trimestre);
                  })
                  .map((prog, index) => {
                    const estado = getEstadoUI(prog.estado);
                    const Icon = estado.icon;

                    return (
                      <motion.div
                        key={prog.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.08 }}
                        className={`p-3 rounded-lg border ${estado.bgColor} ${estado.borderColor}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Icon className={`h-5 w-5 ${estado.color}`} />
                            <div>
                              <p className="font-medium">
                                {prog.anio} - {prog.trimestre}
                              </p>
                              <p className="text-sm text-gray-600">
                                {prog.cantidadProgramada}{" "}
                                {meta?.unidadMedida} • $
                                {prog.presupuestoProgramado.toLocaleString()}
                              </p>
                            </div>
                          </div>

                          <div className="text-right space-y-1">
                            <div className="flex items-center gap-2 justify-end">
                              <p className={`text-sm font-medium ${estado.color}`}>
                                {estado.label}
                              </p>

                              {/* BOTÓN EDITAR (Si no ha sido reportado) */}
                              {/* {prog.estado !== "reportado" && onEdit && ( */}
                              {onEdit && (
                                <Button
                                  size="xs"
                                  variant="ghost"
                                  className="h-6 w-6 p-0"
                                  onClick={() => onEdit(prog)}
                                  title="Editar programación"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className={estado.color}
                                  >
                                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                    <path d="m15 5 4 4" />
                                  </svg>
                                </Button>
                              )}
                            </div>

                            {prog.estado === "reportado" && (
                              <p className="text-xs text-gray-500">
                                Avanzado: {prog.cantidadAvanzada}{" "}
                                {meta?.unidadMedida}
                              </p>
                            )}

                            {prog.estado === "vencido" && (
                              <Button
                                size="xs"
                                variant="destructive"
                                className="p-1 text-xs"
                                onClick={() => {
                                  setProgramacionSeleccionada(prog);
                                  setOpenModal(true);
                                }}
                              >
                                Reportar avance
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* MODAL */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="w-[90vw] max-w-none max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Reportar avance trimestral</DialogTitle>
          </DialogHeader>

          <AvanceFormulario
            meta={meta}
            programacion={programacionSeleccionada}
            onClose={() => setOpenModal(false)}
            onSuccess={() => fetchProgramacionesByMeta(meta.id)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProgramacionTrimestralList;
