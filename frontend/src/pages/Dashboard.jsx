import React from 'react';
import { motion } from 'framer-motion';
import { useMetas } from '@/context/MetasContext';
import DashboardStats from '@/components/DashboardStats';
import DashboardChart from '@/components/DashboardChart';
import DashboardTable from '@/components/DashboardTable';
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


const Dashboard = () => {
  const { metas, loading } = useMetas();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-500">Cargando datos...</p>
        </div>
      </div>
    );
  }

  const promedioAvanceFisico = metas.length > 0 
    ? Math.round(metas.reduce((acc, meta) => acc + (meta.progreso || 0), 0) / metas.length) 
    : 0;
  const promedioAvanceFinanciero = metas.length > 0 
    ? Math.round(metas.reduce((acc, meta) => acc + (meta.progresoFinanciero || 0), 0) / metas.length) 
    : 0;


  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Seguimiento al avance de metas del Plan de Desarrollo Departamental
        </p>
      </motion.div>

      <DashboardStats metas={metas} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardChart metas={metas} />
        <DashboardTable metas={metas} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Card className="gradient-bg text-white">
          <CardHeader>
            <CardTitle className="text-xl">Resumen Ejecutivo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p>
                El Plan de Desarrollo Departamental muestra un avance general físico del {promedioAvanceFisico}% 
                y financiero del {promedioAvanceFinanciero}%.
              </p>
              <p>
                Se han completado (físicamente) {metas.filter(meta => meta.progreso === 100).length} metas de un total de {metas.length}.
              </p>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-3 pr-2">
              {metas.sort((a,b) => (a.progreso || 0) - (b.progreso || 0)).map(meta => (
                <div key={meta.idMeta} className="p-3 bg-white/10 rounded-md">
                  <h4 className="font-semibold text-sm mb-1">
                    {meta.numeroMetaManual ? `(${meta.numeroMetaManual}) ` : ''}{meta.nombreMeta}
                  </h4>
                  <div className="space-y-1.5">
                    <div>
                      <div className="flex justify-between text-xs mb-0.5">
                        <span>Avance Físico</span>
                        <span>{meta.progreso || 0}%</span>
                      </div>
                      <Progress value={meta.progreso || 0} className="h-1.5 bg-white/30 [&>div]:bg-sky-400" />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-0.5">
                        <span>Avance Financiero</span>
                        <span>{meta.progresoFinanciero || 0}%</span>
                      </div>
                      <Progress value={meta.progresoFinanciero || 0} className="h-1.5 bg-white/30 [&>div]:bg-emerald-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
             {metas.length === 0 && <p className="text-center py-4">No hay metas para mostrar.</p>}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard;