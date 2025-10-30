import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const DashboardChart = ({ metas }) => {
  const metasPorLinea = metas.reduce((acc, meta) => {
    const linea = meta.lineaEstrategica;
    if (!acc[linea]) {
      acc[linea] = {
        name: linea,
        total: 0,
        completadas: 0,
        enRiesgo: 0,
        avance: 0
      };
    }
    
    acc[linea].total += 1;
    if (meta.progreso === 100) acc[linea].completadas += 1;
    if (meta.progreso < 30) acc[linea].enRiesgo += 1;
    acc[linea].avance += meta.progreso;
    
    return acc;
  }, {});
  
  const chartData = Object.values(metasPorLinea).map(item => ({
    ...item,
    avance: item.total > 0 ? Math.round(item.avance / item.total) : 0
  }));

  const getBarColor = (value) => {
    if (value < 30) return '#ef4444'; // red-500
    if (value < 70) return '#f59e0b'; // yellow-500
    return '#22c55e'; // green-500
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Avance por Línea Estratégica</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 0,
                  left: -25, 
                  bottom: 70, 
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-40} 
                  textAnchor="end" 
                  interval={0}
                  height={80} 
                  tick={{ fontSize: 10, fill: '#6b7280' }} 
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  domain={[0, 100]}
                  label={{ 
                    value: 'Avance (%)', 
                    angle: -90, 
                    position: 'insideLeft',
                    offset: 10,
                    style: { textAnchor: 'middle', fontSize: 12, fill: '#374151' }
                  }}
                />
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Avance Promedio']}
                  labelFormatter={(label) => `Línea: ${label}`}
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '0.5rem', borderColor: '#e5e7eb' }}
                  itemStyle={{ color: '#1f2937' }}
                  labelStyle={{ color: '#111827', fontWeight: 'bold' }}
                />
                <Bar dataKey="avance" name="Avance Promedio">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.avance)} className="hover:opacity-80 transition-opacity"/>
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DashboardChart;