import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const ReportSummary = ({ data, chartType }) => {
  const metas = data?.filteredMetas ?? [];
  const avances = data?.filteredAvances ?? [];

  /**
   * Agrupar avances por meta y tomar el último
   * (el filtrado por año/trimestre ya viene hecho desde InformesPage)
   */
  const avancesPorMeta = useMemo(() => {
    const map = new Map();

    avances.forEach((av) => {
      if (!map.has(av.metaId)) {
        map.set(av.metaId, av);
        return;
      }

      const actual = map.get(av.metaId);

      // Comparar por año y trimestre
      if (
        av.anioAvance > actual.anioAvance ||
        (av.anioAvance === actual.anioAvance &&
          av.trimestreAvance > actual.trimestreAvance)
      ) {
        map.set(av.metaId, av);
      }
    });

    return Array.from(map.values());
  }, [avances]);

  const totalMetas = metas.length;

  const metasCompletadasFisico = metas.filter(
    m => m.estadoProgreso === 'completada'
  ).length;

  const metasCompletadasFinanciero = avancesPorMeta.filter(
    (a) => a.porcentajeFinanciero === 100
  ).length;

  const promedioAvanceFisico =
  metas.length > 0
    ? Math.round(
        metas.reduce((acc, m) => acc + (m.porcentajeFisico || 0), 0) / metas.length
      )
    : 0;

  const promedioAvanceFinanciero =
    avancesPorMeta.length > 0
      ? Math.round(
          avancesPorMeta.reduce(
            (acc, a) => acc + (a.porcentajeFinanciero || 0),
            0
          ) / avancesPorMeta.length
        )
      : 0;

  const getBarColor = (value) => {
    if (value === 0) return 'bg-gray-400';
    if (value < 100) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  /**
   * Distribución por estado físico
   */
  const estadoFisico = useMemo(() => {
    const sinIniciar = avancesPorMeta.filter(
      (a) => (a.porcentajeFisico || 0) === 0
    ).length;

    const enEjecucion = avancesPorMeta.filter(
      (a) =>
        (a.porcentajeFisico || 0) > 0 &&
        (a.porcentajeFisico || 0) < 100
    ).length;

    const completadas = avancesPorMeta.filter(
      (a) => a.porcentajeFisico === 100
    ).length;

    return [
      { name: 'Sin iniciar', value: sinIniciar, color: '#9ca3af' },
      { name: 'En ejecución', value: enEjecucion, color: '#f59e0b' },
      { name: 'Completadas', value: completadas, color: '#22c55e' }
    ].filter((e) => e.value > 0);
  }, [avancesPorMeta]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="md:col-span-1"
    >
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-base">
            Resumen del Informe
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground">
              Total de metas filtradas
            </p>
            <p className="text-2xl font-bold">{totalMetas}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">
              Metas completadas (físico)
            </p>
            <p className="text-xl font-bold text-green-600">
              {metasCompletadasFisico}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">
              Metas completadas (financiero)
            </p>
            <p className="text-xl font-bold text-emerald-600">
              {metasCompletadasFinanciero}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">
              Avance físico promedio
            </p>
            <div className="flex items-center gap-2">
              <Progress
                value={promedioAvanceFisico}
                className="h-2 flex-1"
                indicatorClassName={getBarColor(promedioAvanceFisico)}
              />
              <span className="text-sm font-semibold">
                {promedioAvanceFisico}%
              </span>
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">
              Avance financiero promedio
            </p>
            <div className="flex items-center gap-2">
              <Progress
                value={promedioAvanceFinanciero}
                className="h-2 flex-1"
                indicatorClassName={getBarColor(promedioAvanceFinanciero)}
              />
              <span className="text-sm font-semibold">
                {promedioAvanceFinanciero}%
              </span>
            </div>
          </div>

          {chartType === 'pie' && estadoFisico.length > 0 && (
            <div className="pt-3 border-t">
              <p className="text-xs text-muted-foreground mb-2">
                Estado físico de metas
              </p>

              <div className="space-y-1 text-xs">
                {estadoFisico.map((e) => (
                  <div
                    key={e.name}
                    className="flex justify-between items-center"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: e.color }}
                      />
                      <span>{e.name}</span>
                    </div>
                    <span className="font-medium">
                      {e.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ReportSummary;
