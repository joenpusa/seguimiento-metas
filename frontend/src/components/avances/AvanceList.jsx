import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ExternalLink, Edit, Trash2, Eye } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";

const AvanceList = ({ avances = [], loading, onEdit, onDelete, onView }) => {
  const { currentUser } = useAuth();
  if (loading) return null;
  const getMetaNombreCompleto = (avance) =>
    `${avance.codigoMeta ? `(${avance.codigoMeta}) ` : ""}${avance.metaNombre}`;

  const canEditOrDelete = (avance) => {
    if (!currentUser) return false;

    if (!avance.esUltimo) return false;

    if (currentUser.rol === "admin") return true;

    if (
      currentUser.rol === "responsable" &&
      avance.metaResponsable === currentUser.nombre
    ) {
      return true;
    }

    return false;
  };

  return (
    <>
      {avances.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="text-center py-12"
        >
          <p className="text-muted-foreground">
            No se encontraron avances con los filtros aplicados.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {avances.map((avance, index) => (
            <motion.div
              key={avance.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 * index }}
            >
              <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3 bg-slate-50 dark:bg-slate-800/50 border-b">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardDescription className="text-xs text-slate-500">
                        Meta: {avance.codigoMeta}
                      </CardDescription>
                      <CardTitle className="text-base font-semibold">
                        {getMetaNombreCompleto(avance)}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {avance.anio} – {avance.trimestre}
                      </p>
                    </div>
                    <div className="text-right">
                      <CardDescription className="text-xs text-slate-500">
                        Fecha registro
                      </CardDescription>
                      <p className="font-medium text-sm">
                        {new Date(avance.createdAt).toLocaleDateString()}
                      </p>
                      {avance.esUltimo && (
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">
                          Último avance
                        </span>
                      )}
                    </div>

                  </div>
                </CardHeader>

                <CardContent className="pt-4 space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-1">
                      Descripción del avance
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {avance.descripcion}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Cantidad avanzada
                      </p>
                      <p className="font-semibold text-sm text-sky-600">
                        {avance.cantidadAvanzada}{" "}
                        {avance.metaUnidadMedida}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        % Avance físico
                      </p>
                      <p className="font-semibold text-sm text-sky-600">
                        {avance.porcentajeFisico}%
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Gasto ejecutado
                      </p>
                      <p className="font-semibold text-sm text-emerald-600">
                        $
                        {Number(
                          avance.gastoEjecutado || 0
                        ).toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        % Avance financiero
                      </p>
                      <p className="font-semibold text-sm text-emerald-600">
                        {avance.porcentajeFinanciero}%
                      </p>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="bg-slate-50 dark:bg-slate-800/50 py-3 px-4 flex justify-between items-center border-t">
                  {avance.evidenciaURL ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs"
                      asChild
                    >
                      <a
                        href={avance.evidenciaURL}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Ver evidencia
                      </a>
                    </Button>
                  ) : (
                    <div />
                  )}

                  <div className="flex gap-1">
                    {canEditOrDelete(avance) ? (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => onEdit(avance)}
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-500"
                          onClick={() => onDelete(avance)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onView && onView(avance)}
                        title="Ver detalle"
                      >
                        <Eye size={14} />
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </>
  );
};

export default AvanceList;
