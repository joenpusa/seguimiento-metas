import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ExternalLink, Edit, Trash2, Eye } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext'; // Necesario para verificar permisos

const AvanceList = ({ avances, loading, activePlanNombre, onEdit, onDelete }) => {
  const { currentUser } = useAuth();

  if (loading) return null;

  const getMetaNombreCompleto = (avance) => {
    return `${avance.metaNumero ? `(${avance.metaNumero}) ` : ''}${avance.metaNombre}`;
  };

  const canEditOrDelete = (avance) => {
    if (!currentUser) return false;
    if (currentUser.rol === 'admin') return true;
    if (currentUser.rol === 'responsable' && avance.metaResponsable === currentUser.nombre) return true;
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
          <img-replace src="/no-avances.svg" alt="No hay avances" className="w-32 h-32 mx-auto mb-4 text-gray-400 opacity-70" />
          <p className="text-muted-foreground">
            No se encontraron avances con los filtros aplicados para el plan "{activePlanNombre}".
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {avances.map((avance, index) => (
            <motion.div
              key={avance.idAvance}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
            >
              <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-3 bg-slate-50 dark:bg-slate-800/50 border-b">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardDescription className="text-xs text-slate-500">Meta:</CardDescription>
                      <CardTitle className="text-base font-semibold text-slate-700">{getMetaNombreCompleto(avance)}</CardTitle>
                      <p className="text-xs text-muted-foreground">{avance.anioAvance} - {avance.trimestreAvance}</p>
                    </div>
                    <div className="text-right">
                      <CardDescription className="text-xs text-slate-500">Fecha Registro:</CardDescription>
                      <p className="font-medium text-sm text-slate-600">{new Date(avance.fecha).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descripción del Avance:</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{avance.descripcion}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-start pt-2">
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Cant. Avanzada:</p>
                            <p className="font-semibold text-sm text-sky-600 dark:text-sky-400">{avance.cantidadAvanzada} {avance.metaUnidadMedida}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">% Avance Físico (este avance):</p>
                            <p className="font-semibold text-sm text-sky-600 dark:text-sky-400">{avance.porcentajeCalculado}%</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Gasto Ejecutado:</p>
                            <p className="font-semibold text-sm text-emerald-600 dark:text-emerald-400">${parseFloat(avance.gastoEjecutado || 0).toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">% Avance Financ. (este avance):</p>
                            <p className="font-semibold text-sm text-emerald-600 dark:text-emerald-400">{avance.porcentajeFinancieroCalculado}%</p>
                        </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-slate-50 dark:bg-slate-800/50 py-3 px-4 flex justify-between items-center border-t">
                   {avance.evidenciaURL && (
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs" asChild>
                          <a href={avance.evidenciaURL} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3.5 w-3.5" />
                            Ver evidencia
                          </a>
                        </Button>
                      )}
                      {!avance.evidenciaURL && <div />}
                  <div className="flex gap-1">
                      {canEditOrDelete(avance) ? (
                        <>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-sky-600" onClick={() => onEdit(avance)}>
                            <Edit size={14} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600" onClick={() => onDelete(avance)}>
                            <Trash2 size={14} />
                          </Button>
                        </>
                      ) : (
                         <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-sky-600 cursor-not-allowed" title="Solo lectura">
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