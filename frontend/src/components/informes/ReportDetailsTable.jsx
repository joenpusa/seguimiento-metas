import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MapPin } from 'lucide-react';

const ReportDetailsTable = ({ metasFiltradas = [], avancesFiltrados = [] }) => {
  /**
   * Obtener el último avance por meta
   */
  const avancePorMeta = useMemo(() => {
    const map = new Map();

    avancesFiltrados.forEach((av) => {
      if (!map.has(av.metaId)) {
        map.set(av.metaId, av);
        return;
      }

      const actual = map.get(av.metaId);
      if (
        av.anioAvance > actual.anioAvance ||
        (av.anioAvance === actual.anioAvance &&
          av.trimestreAvance > actual.trimestreAvance)
      ) {
        map.set(av.metaId, av);
      }
    });

    return map;
  }, [avancesFiltrados]);

  const getProgressColor = (value) => {
    if (value < 30) return 'bg-red-500';
    if (value < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Detalle de Metas ({metasFiltradas.length})
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto max-h-[500px]">
            {metasFiltradas.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No hay metas para mostrar con los filtros seleccionados.
              </p>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-2 text-left font-medium">
                      Meta / Iniciativa
                    </th>
                    {/* <th className="py-2 px-2 text-left font-medium">
                      Municipios
                    </th> */}
                    <th className="py-2 px-2 text-left font-medium">
                      Responsable
                    </th>
                    <th className="py-2 px-2 text-left font-medium">
                      Fecha límite
                    </th>
                    <th className="py-2 px-2 text-left font-medium min-w-[150px]">
                      Avance físico
                    </th>
                    <th className="py-2 px-2 text-left font-medium min-w-[150px]">
                      Avance financiero
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {metasFiltradas.map((meta) => {
                    const avance = avancePorMeta.get(meta.idMeta);

                    const fisico = avance?.porcentajeFisico || 0;
                    const financiero = avance?.porcentajeFinanciero || 0;

                    return (
                      <tr
                        key={meta.idMeta}
                        className="border-b hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <td className="py-2 px-2">
                          <p className="font-semibold">
                            {meta.numeroMetaManual
                              ? `(${meta.numeroMetaManual}) `
                              : ''}
                            {meta.nombre}
                          </p>
                          <p className="text-muted-foreground text-[11px]">
                            Iniciativa:{' '}
                            {meta.iniciativa?.nombre || 'N/A'}
                          </p>
                        </td>

                        {/* <td className="py-2 px-2">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-gray-400" />
                            <span
                              className="truncate max-w-[140px]"
                              title={meta.municipios?.join(', ')}
                            >
                              {meta.municipios?.join(', ') || 'N/A'}
                            </span>
                          </div>
                        </td> */}

                        <td className="py-2 px-2 truncate max-w-[120px]">
                          {meta.unidad_nombre ||
                            meta.secretaria_nombre ||
                            'N/A'}
                        </td>

                        <td className="py-2 px-2">
                          {meta.fechaLimite
                            ? new Date(meta.fechaLimite).toLocaleDateString()
                            : '—'}
                        </td>

                        <td className="py-2 px-2">
                          <div className="flex items-center gap-1.5">
                            <Progress
                              value={fisico}
                              className="h-1.5 flex-1"
                              indicatorClassName={getProgressColor(fisico)}
                            />
                            <span className="font-medium">{fisico}%</span>
                          </div>
                        </td>

                        <td className="py-2 px-2">
                          <div className="flex items-center gap-1.5">
                            <Progress
                              value={financiero}
                              className="h-1.5 flex-1"
                              indicatorClassName={getProgressColor(financiero)}
                            />
                            <span className="font-medium">
                              {financiero}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ReportDetailsTable;
