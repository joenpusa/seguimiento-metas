import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calendar, Target, DollarSign, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const ProgramacionTrimestralList = ({ meta, onProgramar }) => {
  const programacion = meta?.programacionTrimestral || [];
  const avances = meta?.avances || [];

  const getEstadoTrimestre = (prog) => {
    const avanceEnTrimestre = avances.find(av => 
      av.anioAvance === prog.anio && av.trimestreAvance === prog.trimestre
    );
    
    if (avanceEnTrimestre) {
      return {
        estado: 'reportado',
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        avance: avanceEnTrimestre
      };
    }
    
    const fechaActual = new Date();
    const anioActual = fechaActual.getFullYear();
    const trimestreActual = Math.ceil((fechaActual.getMonth() + 1) / 3);
    const trimestreNum = parseInt(prog.trimestre.replace('T', ''));
    
    if (prog.anio < anioActual || (prog.anio === anioActual && trimestreNum < trimestreActual)) {
      return {
        estado: 'vencido',
        icon: AlertCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      };
    }
    
    return {
      estado: 'pendiente',
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    };
  };

  const getTotalProgramado = () => {
    return {
      cantidad: programacion.reduce((sum, p) => sum + (p.cantidadProgramada || 0), 0),
      presupuesto: programacion.reduce((sum, p) => sum + (p.presupuestoProgramado || 0), 0)
    };
  };

  const getTotalAvanzado = () => {
    return {
      cantidad: avances.reduce((sum, a) => sum + (parseFloat(a.cantidadAvanzada) || 0), 0),
      presupuesto: avances.reduce((sum, a) => sum + (parseFloat(a.gastoEjecutado) || 0), 0)
    };
  };

  const totales = getTotalProgramado();
  const avanzado = getTotalAvanzado();

  const porcentajeCantidad = meta?.cantidad > 0 ? (totales.cantidad / meta.cantidad) * 100 : 0;
  const porcentajePresupuesto = totales.presupuesto > 0 ? (avanzado.presupuesto / totales.presupuesto) * 100 : 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Programación Trimestral
            </span>
            <Button onClick={onProgramar} size="sm" variant="outline">
              Programar Siguiente
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {programacion.length === 0 ? (
            <div className="text-center py-6">
              <Target className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600 font-medium">No hay programación trimestral</p>
              <p className="text-sm text-muted-foreground">
                Debe programar los trimestres antes de reportar avances
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500">Total Programado</p>
                  <p className="font-semibold">{totales.cantidad} {meta?.unidadMedida}</p>
                  <Progress value={porcentajeCantidad} className="h-1.5 mt-1" />
                  <p className="text-xs text-gray-500 mt-1">
                    {porcentajeCantidad.toFixed(1)}% de la meta total
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Presupuesto Programado</p>
                  <p className="font-semibold">${totales.presupuesto.toLocaleString()}</p>
                  <Progress value={porcentajePresupuesto} className="h-1.5 mt-1" />
                  <p className="text-xs text-gray-500 mt-1">
                    {porcentajePresupuesto.toFixed(1)}% ejecutado
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {programacion
                  .sort((a, b) => {
                    if (a.anio !== b.anio) return a.anio - b.anio;
                    return a.trimestre.localeCompare(b.trimestre);
                  })
                  .map((prog, index) => {
                    const estado = getEstadoTrimestre(prog);
                    const IconComponent = estado.icon;
                    
                    return (
                      <motion.div
                        key={`${prog.anio}-${prog.trimestre}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-3 rounded-lg border ${estado.bgColor} ${estado.borderColor}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <IconComponent className={`h-5 w-5 ${estado.color}`} />
                            <div>
                              <p className="font-medium">
                                {prog.anio} - {prog.trimestre}
                              </p>
                              <p className="text-sm text-gray-600">
                                {prog.cantidadProgramada} {meta?.unidadMedida} • 
                                ${prog.presupuestoProgramado.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-medium ${estado.color}`}>
                              {estado.estado === 'reportado' && 'Reportado'}
                              {estado.estado === 'pendiente' && 'Pendiente'}
                              {estado.estado === 'vencido' && 'Vencido'}
                            </p>
                            {estado.avance && (
                              <p className="text-xs text-gray-500">
                                Avanzado: {estado.avance.cantidadAvanzada} {meta?.unidadMedida}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgramacionTrimestralList;