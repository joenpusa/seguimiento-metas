import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MapPin, DollarSign } from 'lucide-react';

const ReportDetailsTable = ({ metasFiltradas }) => {
  const getProgressColor = (progreso) => {
    if (progreso < 30) return 'bg-red-500';
    if (progreso < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detalle de Metas ({metasFiltradas.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto max-h-[500px]">
            {metasFiltradas.length > 0 ? (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-2 text-left font-medium">Meta / Iniciativa</th>
                  <th className="py-2 px-2 text-left font-medium">Municipios</th>
                  <th className="py-2 px-2 text-left font-medium">Responsable</th>
                  <th className="py-2 px-2 text-left font-medium">Fecha Límite</th>
                  <th className="py-2 px-2 text-left font-medium min-w-[150px]">Av. Físico</th>
                  <th className="py-2 px-2 text-left font-medium min-w-[150px]">Av. Financiero</th>
                </tr>
              </thead>
              <tbody>
                {metasFiltradas.map((meta) => (
                  <tr key={meta.idMeta} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800">
                    <td className="py-2 px-2">
                      <p className="font-semibold">{meta.numeroMetaManual ? `(${meta.numeroMetaManual}) ` : ''}{meta.nombreMeta}</p>
                      <p className="text-muted-foreground text-[11px]">Inic: {meta.iniciativa}</p>
                    </td>
                     <td className="py-2 px-2">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
                         <span className="truncate max-w-[120px]" title={meta.municipios?.join(', ')}>{meta.municipios?.join(', ') || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="py-2 px-2 truncate max-w-[100px]" title={meta.responsable}>{meta.responsable}</td>
                    <td className="py-2 px-2">{new Date(meta.fechaLimite).toLocaleDateString()}</td>
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-1.5">
                        <Progress 
                          value={meta.progreso || 0} 
                          className="h-1.5 flex-1"
                          indicatorClassName={getProgressColor(meta.progreso || 0)}
                        />
                        <span className="font-medium">{meta.progreso || 0}%</span>
                      </div>
                    </td>
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-1.5">
                        <Progress 
                          value={meta.progresoFinanciero || 0} 
                          className="h-1.5 flex-1"
                          indicatorClassName={getProgressColor(meta.progresoFinanciero || 0)}
                        />
                        <span className="font-medium">{meta.progresoFinanciero || 0}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            ) : (
               <p className="text-muted-foreground text-center py-4">No hay metas para mostrar con los filtros seleccionados.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ReportDetailsTable;