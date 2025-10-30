import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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

const ReportCharts = ({ metasFiltradas, filters, chartType }) => {
  
  const metasParaGraficar = Array.isArray(metasFiltradas) ? metasFiltradas : [];

  const prepareBarChartData = () => {
    // Agrupa por nombre de iniciativa si no hay otro filtro más específico
    const dataByGroup = metasParaGraficar.reduce((acc, meta) => {
      // El campo 'nombreIniciativa' se añade en getAllMetasFromActivePlan
      const groupName = meta.nombreIniciativa || meta.nombreMeta || 'N/A'; 

      if (!acc[groupName]) {
        acc[groupName] = { name: groupName, totalMetas: 0, avanceFisico: 0, avanceFinanciero: 0 };
      }
      acc[groupName].totalMetas += 1;
      acc[groupName].avanceFisico += (meta.progreso || 0);
      acc[groupName].avanceFinanciero += (meta.progresoFinanciero || 0);
      return acc;
    }, {});
    
    return Object.values(dataByGroup).map(item => ({
      name: item.name,
      avanceFisico: item.totalMetas > 0 ? Math.round(item.avanceFisico / item.totalMetas) : 0,
      avanceFinanciero: item.totalMetas > 0 ? Math.round(item.avanceFinanciero / item.totalMetas) : 0,
    }));
  };

  const preparePieChartDataFisico = () => {
    const completadas = metasParaGraficar.filter(meta => (meta.progreso || 0) === 100).length;
    const enProceso = metasParaGraficar.filter(meta => (meta.progreso || 0) >= 30 && (meta.progreso || 0) < 100).length;
    const enRiesgo = metasParaGraficar.filter(meta => (meta.progreso || 0) < 30).length;
    
    return [
      { name: 'Completadas', value: completadas, color: '#22c55e' }, // green-500
      { name: 'En Proceso', value: enProceso, color: '#f59e0b' }, // amber-500
      { name: 'En Riesgo', value: enRiesgo, color: '#ef4444' }  // red-500
    ].filter(item => item.value > 0);
  };

  const barChartData = prepareBarChartData();
  const pieChartDataFisico = preparePieChartDataFisico();
  
  const barChartTitle = () => {
    if (filters.responsable) return `Avance de Metas para: ${filters.responsable}`;
    if (filters.municipio) return `Avance de Metas para: ${filters.municipio}`;
    return 'Avance General por Iniciativa'; // Título genérico
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border p-2 rounded shadow-lg text-xs">
          <p className="label font-bold">{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {`${entry.name === 'avanceFisico' ? 'Av. Físico' : 'Av. Financ.'}: ${entry.value}%`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const percentage = (percent * 100).toFixed(0);
    if (percentage < 5) return null;

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="10px">
        {`${name.substring(0,3)}. ${percentage}%`}
      </text>
    );
  };


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
      className="md:col-span-2"
    >
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-base">
            {chartType === 'bar' ? barChartTitle() : 'Distribución de Metas por Estado (Físico)'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] w-full">
          {metasParaGraficar.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' ? (
                <ReBarChart
                  data={barChartData}
                  margin={{ top: 5, right: 10, left: -20, bottom: barChartData.length > 5 && barChartData.length <=10 ? 50 : barChartData.length > 10 ? 70 : 20 }}
                  layout={barChartData.length > 10 ? "vertical" : "horizontal"}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  {barChartData.length > 10 ? ( // Vertical layout
                    <>
                      <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <YAxis type="category" dataKey="name" width={100} interval={0} tick={{ fontSize: 10 }} />
                    </>
                  ) : ( // Horizontal layout
                     <>
                      <XAxis dataKey="name" angle={barChartData.length > 3 ? -35 : 0} textAnchor={barChartData.length > 3 ? "end" : "middle"} interval={0} height={barChartData.length > 3 ? 60 : 30} tick={{ fontSize: 10 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                    </>
                  )}
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{fontSize: "10px", paddingTop: barChartData.length > 5 ? "10px" : "0px"}}/>
                  <Bar dataKey="avanceFisico" name="Av. Físico" fill="#38bdf8" barSize={barChartData.length > 10 ? 10 : undefined} />
                  <Bar dataKey="avanceFinanciero" name="Av. Financ." fill="#34d399" barSize={barChartData.length > 10 ? 10 : undefined} />
                </ReBarChart>
              ) : (
                <RePieChart>
                  <Pie
                    data={pieChartDataFisico}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    label={CustomPieLabel}
                  >
                    {pieChartDataFisico.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name, props) => [`${value} (${(props.payload.percent * 100).toFixed(1)}%)`, props.payload.name]} />
                  {pieChartDataFisico.length > 1 && <Legend wrapperStyle={{fontSize: "12px"}}/>}
                </RePieChart>
              )}
            </ResponsiveContainer>
             ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                No hay datos para mostrar con los filtros seleccionados.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ReportCharts;