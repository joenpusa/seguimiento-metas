import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '@/components/ui/card';

import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const ReportCharts = ({ metasFiltradas, avancesFiltrados = [], filters, chartType }) => {
  const metas = Array.isArray(metasFiltradas) ? metasFiltradas : [];
  const avances = Array.isArray(avancesFiltrados) ? avancesFiltrados : [];

  /**
   * Tomar el último avance por meta
   */
  const avancesPorMeta = useMemo(() => {
    const map = new Map();

    avances.forEach((av) => {
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

    return Array.from(map.values());
  }, [avances]);

  /**
   * -----------------------------
   * DATA PARA GRÁFICO DE BARRAS
   * -----------------------------
   */
  const barChartData = useMemo(() => {
    const grouped = {};

    metas.forEach(meta => {
      const key =
        filters.responsable
          ? meta.unidad_nombre || meta.secretaria_nombre
          : filters.municipio
          ? filters.municipio
          : meta.nombreIniciativa || meta.nombreMeta;

      if (!grouped[key]) {
        grouped[key] = { name: key, count: 0, fisico: 0, financiero: 0 };
      }

      grouped[key].count += 1;
      grouped[key].fisico += meta.porcentajeFisico || 0;
      grouped[key].financiero += meta.porcentajeFinanciero || 0;
    });

    return Object.values(grouped).map(g => ({
      name: g.name,
      avanceFisico: Math.round(g.fisico / g.count),
      avanceFinanciero: Math.round(g.financiero / g.count)
    }));
  }, [metas, filters]);

  /**
   * -----------------------------
   * DATA PARA GRÁFICO CIRCULAR
   * -----------------------------
   */
  const pieChartData = useMemo(() => {
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

  const title =
    chartType === 'bar'
      ? filters.responsable
        ? `Avance por responsable`
        : filters.municipio
        ? `Avance por municipio`
        : 'Avance general por iniciativa'
      : 'Distribución de metas por estado físico';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="md:col-span-2"
    >
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="h-[350px] w-full">
            {barChartData.length === 0 && pieChartData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                No hay datos para mostrar con los filtros seleccionados.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'bar' ? (
                  <ReBarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="avanceFisico" name="Av. Físico" fill="#38bdf8" />
                    <Bar
                      dataKey="avanceFinanciero"
                      name="Av. Financiero"
                      fill="#34d399"
                    />
                  </ReBarChart>
                ) : (
                  <RePieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      dataKey="value"
                      label
                    >
                      {pieChartData.map((e, i) => (
                        <Cell key={i} fill={e.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RePieChart>
                )}
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ReportCharts;
