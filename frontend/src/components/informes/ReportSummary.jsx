import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const ReportSummary = ({ data, chartType }) => {
  const metasFiltradas = (data && data.filteredMetas && Array.isArray(data.filteredMetas)) 
    ? data.filteredMetas 
    : [];

  const totalMetas = metasFiltradas.length;
  const metasCompletadasFisico = metasFiltradas.filter(meta => (meta.progreso || 0) === 100).length;
  const metasCompletadasFinanciero = metasFiltradas.filter(meta => (meta.progresoFinanciero || 0) === 100).length;

  const promedioAvanceFisico = totalMetas > 0 
    ? Math.round(metasFiltradas.reduce((acc, meta) => acc + (meta.progreso || 0), 0) / totalMetas) 
    : 0;
  const promedioAvanceFinanciero = totalMetas > 0
    ? Math.round(metasFiltradas.reduce((acc, meta) => acc + (meta.progresoFinanciero || 0), 0) / totalMetas)
    : 0;

  const getBarColor = (value) => {
    if (value < 30) return 'bg-red-500';
    if (value < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  const pieChartData = () => {
    if (!Array.isArray(metasFiltradas)) return [];
    const completadas = metasFiltradas.filter(meta => (meta.progreso || 0) === 100).length;
    const enProceso = metasFiltradas.filter(meta => (meta.progreso || 0) >= 30 && (meta.progreso || 0) < 100).length;
    const enRiesgo = metasFiltradas.filter(meta => (meta.progreso || 0) < 30).length;
    
    return [
      { name: 'Completadas', value: completadas, color: '#22c55e' }, 
      { name: 'En Proceso', value: enProceso, color: '#f59e0b' }, 
      { name: 'En Riesgo', value: enRiesgo, color: '#ef4444' } 
    ].filter(item => item.value > 0);
  };
  const currentPieData = pieChartData();


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="md:col-span-1"
    >
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-base">Resumen Filtrado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Total de Metas (filtradas):</p>
              <p className="text-xl font-bold">{totalMetas}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Metas Completadas (Físicas):</p>
              <p className="text-xl font-bold text-green-600">{metasCompletadasFisico}</p>
            </div>
             <div>
              <p className="text-xs text-gray-500 mb-0.5">Metas Completadas (Financieras):</p>
              <p className="text-xl font-bold text-emerald-600">{metasCompletadasFinanciero}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Avance Físico General (filtrado):</p>
              <div className="flex items-center gap-2">
                <Progress value={promedioAvanceFisico} className="h-1.5 flex-1" indicatorClassName={getBarColor(promedioAvanceFisico)} />
                <span className="text-sm font-bold">{promedioAvanceFisico}%</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Avance Financiero General (filtrado):</p>
              <div className="flex items-center gap-2">
                <Progress value={promedioAvanceFinanciero} className="h-1.5 flex-1" indicatorClassName={getBarColor(promedioAvanceFinanciero)} />
                <span className="text-sm font-bold">{promedioAvanceFinanciero}%</span>
              </div>
            </div>

            {currentPieData.length > 0 && chartType === 'pie' && totalMetas > 0 && (
            <div className="pt-3 border-t">
              <p className="text-xs text-gray-500 mb-1.5">Distribución por Estado (Físico):</p>
              <div className="space-y-1 text-xs">
                {currentPieData.map(entry => (
                  <div key={entry.name} className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                      <div style={{backgroundColor: entry.color}} className="w-2 h-2 rounded-full"></div>
                      <span>{entry.name}</span>
                    </div>
                    <span className="font-medium">{entry.value} ({ (entry.value / totalMetas * 100).toFixed(1) }%)</span>
                  </div>
                ))}
              </div>
            </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ReportSummary;