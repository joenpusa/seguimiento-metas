import { v4 as uuidv4 } from 'uuid';
import { planDesarrolloEstructura as initialPlanEstructura } from '@/context/metasData.js';

export const PlanManager = (setPlanesDesarrollo, setActivePlanId, planesDesarrollo, toast) => {
  const addPlanDesarrollo = (planData) => {
    const nuevoPlan = { 
      ...planData, 
      id: uuidv4(), 
      estructuraPDI: JSON.parse(JSON.stringify(initialPlanEstructura)), 
      esActivo: planesDesarrollo.length === 0 
    };
    setPlanesDesarrollo(prev => {
      const updatedPlanes = prev.map(p => ({ ...p, esActivo: false }));
      nuevoPlan.esActivo = true;
      setActivePlanId(nuevoPlan.id);
      return [...updatedPlanes, nuevoPlan];
    });
    toast({
      title: "Plan Creado",
      description: `El plan "${planData.nombrePlan}" ha sido creado y activado.`,
    });
  };

  const updatePlanDesarrolloInfo = (planId, planData) => {
    setPlanesDesarrollo(prev => prev.map(p => p.id === planId ? {...p, ...planData} : p));
     toast({
      title: "Plan Actualizado",
      description: `La información del plan "${planData.nombrePlan}" ha sido actualizada.`,
    });
  };
  
  const deletePlanDesarrollo = (planId) => {
    const planAEliminar = planesDesarrollo.find(p => p.id === planId);
    setPlanesDesarrollo(prev => {
      const nuevosPlanes = prev.filter(p => p.id !== planId);
      if (planAEliminar?.esActivo && nuevosPlanes.length > 0) {
        nuevosPlanes[0].esActivo = true;
        setActivePlanId(nuevosPlanes[0].id);
      } else if (nuevosPlanes.length === 0) {
        setActivePlanId(null);
      }
      return nuevosPlanes;
    });
    if (planAEliminar) {
      toast({
        title: "Plan Eliminado",
        description: `El plan "${planAEliminar.nombrePlan}" ha sido eliminado.`,
        variant: "destructive"
      });
    }
  };

  const setActivePlanContext = (planId) => {
    setPlanesDesarrollo(prev => prev.map(p => ({...p, esActivo: p.id === planId })));
    setActivePlanId(planId);
    const planActivado = planesDesarrollo.find(p => p.id === planId);
    if (planActivado) {
        toast({ title: "Plan Activado", description: `El plan "${planActivado.nombrePlan}" ahora está activo.`});
    }
  };

  return {
    addPlanDesarrollo,
    updatePlanDesarrolloInfo,
    deletePlanDesarrollo,
    setActivePlanContext
  };
};