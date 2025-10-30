import { v4 as uuidv4 } from 'uuid';

export const MetasManager = (setPlanesDesarrollo, activePlanId, toast) => {
  
  const programarTrimestre = (metaId, programacionData) => {
    setPlanesDesarrollo(prevPlanes =>
      prevPlanes.map(plan => {
        if (plan.id === activePlanId) {
          const newPlan = JSON.parse(JSON.stringify(plan));
          let metaActualizada = false;

          const buscarYActualizarMetaRecursivo = (items) => {
            if (!items || !Array.isArray(items)) return false;
            for (const item of items) {
              if (item && item.metas && Array.isArray(item.metas)) {
                const metaIndex = item.metas.findIndex(m => m.idMeta === metaId);
                if (metaIndex !== -1) {
                  const meta = item.metas[metaIndex];
                  
                  if (!meta.programacionTrimestral) {
                    meta.programacionTrimestral = [];
                  }
                  
                  const existeProgramacion = meta.programacionTrimestral.find(p => 
                    p.anio === programacionData.anio && p.trimestre === programacionData.trimestre
                  );
                  
                  if (existeProgramacion) {
                    toast({ 
                      title: "Error", 
                      description: "Ya existe programación para este trimestre.", 
                      variant: "destructive" 
                    });
                    return true;
                  }
                  
                  meta.programacionTrimestral.push({
                    id: uuidv4(),
                    ...programacionData,
                    fechaCreacion: new Date().toISOString()
                  });
                  
                  meta.programacionTrimestral.sort((a, b) => {
                    if (a.anio !== b.anio) return a.anio - b.anio;
                    return a.trimestre.localeCompare(b.trimestre);
                  });
                  
                  metaActualizada = true;
                  return true;
                }
              }
              if (item.componentes && buscarYActualizarMetaRecursivo(item.componentes)) return true;
              if (item.apuestas && buscarYActualizarMetaRecursivo(item.apuestas)) return true;
              if (item.iniciativas) {
                if (Array.isArray(item.iniciativas)) {
                   if (buscarYActualizarMetaRecursivo(item.iniciativas)) return true;
                } else if (typeof item.iniciativas === 'object' && item.iniciativas.metas) {
                   if (buscarYActualizarMetaRecursivo([item.iniciativas])) return true;
                }
              }
            }
            return false;
          };

          if (newPlan.estructuraPDI && newPlan.estructuraPDI.lineasEstrategicas) {
            buscarYActualizarMetaRecursivo(newPlan.estructuraPDI.lineasEstrategicas);
          }

          if (metaActualizada) {
            toast({ 
              title: "Programación Creada", 
              description: `Trimestre ${programacionData.anio} - ${programacionData.trimestre} programado exitosamente.` 
            });
          } else {
            toast({ 
              title: "Error", 
              description: "No se pudo encontrar la meta para programar.", 
              variant: "destructive" 
            });
          }
          return newPlan;
        }
        return plan;
      })
    );
  };

  const eliminarProgramacionTrimestre = (metaId, programacionId) => {
    setPlanesDesarrollo(prevPlanes =>
      prevPlanes.map(plan => {
        if (plan.id === activePlanId) {
          const newPlan = JSON.parse(JSON.stringify(plan));
          let metaActualizada = false;

          const buscarYActualizarMetaRecursivo = (items) => {
            if (!items || !Array.isArray(items)) return false;
            for (const item of items) {
              if (item && item.metas && Array.isArray(item.metas)) {
                const metaIndex = item.metas.findIndex(m => m.idMeta === metaId);
                if (metaIndex !== -1) {
                  const meta = item.metas[metaIndex];
                  
                  if (meta.programacionTrimestral) {
                    const programacionAntes = meta.programacionTrimestral.length;
                    meta.programacionTrimestral = meta.programacionTrimestral.filter(p => p.id !== programacionId);
                    
                    if (meta.programacionTrimestral.length < programacionAntes) {
                      metaActualizada = true;
                    }
                  }
                  return true;
                }
              }
              if (item.componentes && buscarYActualizarMetaRecursivo(item.componentes)) return true;
              if (item.apuestas && buscarYActualizarMetaRecursivo(item.apuestas)) return true;
              if (item.iniciativas) {
                if (Array.isArray(item.iniciativas)) {
                   if (buscarYActualizarMetaRecursivo(item.iniciativas)) return true;
                } else if (typeof item.iniciativas === 'object' && item.iniciativas.metas) {
                   if (buscarYActualizarMetaRecursivo([item.iniciativas])) return true;
                }
              }
            }
            return false;
          };

          if (newPlan.estructuraPDI && newPlan.estructuraPDI.lineasEstrategicas) {
            buscarYActualizarMetaRecursivo(newPlan.estructuraPDI.lineasEstrategicas);
          }

          if (metaActualizada) {
            toast({ 
              title: "Programación Eliminada", 
              description: "La programación trimestral ha sido eliminada." 
            });
          }
          return newPlan;
        }
        return plan;
      })
    );
  };

  const actualizarProgramacionTrimestre = (metaId, programacionId, nuevaData) => {
    setPlanesDesarrollo(prevPlanes =>
      prevPlanes.map(plan => {
        if (plan.id === activePlanId) {
          const newPlan = JSON.parse(JSON.stringify(plan));
          let metaActualizada = false;

          const buscarYActualizarMetaRecursivo = (items) => {
            if (!items || !Array.isArray(items)) return false;
            for (const item of items) {
              if (item && item.metas && Array.isArray(item.metas)) {
                const metaIndex = item.metas.findIndex(m => m.idMeta === metaId);
                if (metaIndex !== -1) {
                  const meta = item.metas[metaIndex];
                  
                  if (meta.programacionTrimestral) {
                    const progIndex = meta.programacionTrimestral.findIndex(p => p.id === programacionId);
                    if (progIndex !== -1) {
                      meta.programacionTrimestral[progIndex] = {
                        ...meta.programacionTrimestral[progIndex],
                        ...nuevaData,
                        fechaActualizacion: new Date().toISOString()
                      };
                      metaActualizada = true;
                    }
                  }
                  return true;
                }
              }
              if (item.componentes && buscarYActualizarMetaRecursivo(item.componentes)) return true;
              if (item.apuestas && buscarYActualizarMetaRecursivo(item.apuestas)) return true;
              if (item.iniciativas) {
                if (Array.isArray(item.iniciativas)) {
                   if (buscarYActualizarMetaRecursivo(item.iniciativas)) return true;
                } else if (typeof item.iniciativas === 'object' && item.iniciativas.metas) {
                   if (buscarYActualizarMetaRecursivo([item.iniciativas])) return true;
                }
              }
            }
            return false;
          };

          if (newPlan.estructuraPDI && newPlan.estructuraPDI.lineasEstrategicas) {
            buscarYActualizarMetaRecursivo(newPlan.estructuraPDI.lineasEstrategicas);
          }

          if (metaActualizada) {
            toast({ 
              title: "Programación Actualizada", 
              description: "La programación trimestral ha sido actualizada." 
            });
          }
          return newPlan;
        }
        return plan;
      })
    );
  };

  return {
    programarTrimestre,
    eliminarProgramacionTrimestre,
    actualizarProgramacionTrimestre
  };
};