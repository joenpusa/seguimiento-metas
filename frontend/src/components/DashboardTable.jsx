import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, Clock, MapPin, Hash, TrendingUp } from 'lucide-react';

const Tooltip = ({ text, children }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  return (
    <div className="relative inline-block">
      <div 
        onMouseEnter={() => setShowTooltip(true)} 
        onMouseLeave={() => setShowTooltip(false)}
      >
        {children}
      </div>
      {showTooltip && (
        <div className="absolute z-10 w-64 p-2 -mt-1 text-xs leading-tight text-white transform -translate-x-1/2 bg-black rounded-lg shadow-lg left-1/2 bottom-full">
          {text}
        </div>
      )}
    </div>
  );
};


const DashboardTable = ({ metas }) => {
  
  const metasFiltradasYOrdenadas = metas
    .filter(meta => (meta.progreso || 0) >= 60)
    .sort((a, b) => (a.progreso || 0) - (b.progreso || 0));
  
  const getStatusIcon = (progreso) => {
    if (progreso < 30) return <AlertCircle className="h-4 w-4 text-red-500" />;
    if (progreso < 100) return <TrendingUp className="h-4 w-4 text-yellow-500" />;
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getProgressColor = (progreso) => {
    if (progreso < 30) return 'bg-red-500';
    if (progreso < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Metas Destacadas (Avance {'>'}= 60%)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-4 text-left font-medium">Nº Meta</th>
                  <th className="py-3 px-4 text-left font-medium">Municipio(s) Meta</th>
                  <th className="py-3 px-4 text-left font-medium">Progreso</th>
                  <th className="py-3 px-4 text-left font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {metasFiltradasYOrdenadas.slice(0, 5).map((meta) => (
                  <tr key={meta.idMeta} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <Tooltip text={meta.nombreMeta}>
                        <div className="flex items-center gap-1 text-xs cursor-default">
                          <Hash className="h-3 w-3 text-gray-400" />
                          {meta.numeroMetaManual || 'N/A'}
                        </div>
                      </Tooltip>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-xs">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        {Array.isArray(meta.municipios) ? meta.municipios.join(', ') : meta.municipios || 'N/A'}
                      </div>
                    </td>
                    <td className="py-3 px-4 w-[150px]">
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={meta.progreso} 
                          className="h-2 flex-1"
                          indicatorClassName={getProgressColor(meta.progreso)}
                        />
                        <span className="text-xs font-medium">{meta.progreso || 0}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        {getStatusIcon(meta.progreso)}
                      </div>
                    </td>
                  </tr>
                ))}
                 {metasFiltradasYOrdenadas.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-gray-500">No hay metas destacadas con avance {'>'}= 60%.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DashboardTable;