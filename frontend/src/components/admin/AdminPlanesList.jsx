import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Trash2, CheckCircle, Circle } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminPlanesList = ({ planes, onEditPlan, onDeletePlan, onSelectPlan, activePlanId }) => {
  if (!planes || planes.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-10"
      >
        <img alt="No plans illustration" className="mx-auto h-40 w-40 text-gray-400" src="https://images.unsplash.com/photo-1661523892192-dc872b45c290" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">No hay planes de desarrollo</h3>
        <p className="mt-1 text-sm text-gray-500">Comience creando un nuevo plan de desarrollo.</p>
      </motion.div>
    );
  }

  // Helper para mostrar fecha sin afectar zona horaria
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    // Usamos UTC para evitar que el navegador reste horas por la zona horaria
    return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()).toLocaleDateString();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {planes.map((plan, index) => (
        <motion.div
          key={plan.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <Card className={`flex flex-col h-full ${plan.id === activePlanId ? 'border-primary ring-2 ring-primary' : ''}`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{plan.nombrePlan}</CardTitle>
                {plan.id === activePlanId ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-300" />
                )}
              </div>
              <CardDescription>
                Vigencia: {formatDate(plan.vigenciaInicio)} - {formatDate(plan.vigenciaFin)}
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-between items-center gap-2 pt-4 border-t">
              <Button
                variant={plan.id === activePlanId ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => onSelectPlan(plan.id)}
              >
                {plan.id === activePlanId ? 'Administrando' : 'Administrar Plan'}
              </Button>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEditPlan(plan)}>
                  <Edit size={16} />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => onDeletePlan(plan.id)}>
                  <Trash2 size={16} />
                </Button>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default AdminPlanesList;