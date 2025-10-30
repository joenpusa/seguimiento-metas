import { v4 as uuidv4 } from 'uuid';

export const manageAvancesInMetas = (setPlanesDesarrollo, activePlanId, toast) => {
  
  const calculateAvancePercentagesLocal = (avance, meta) => {
    const porcentajeCalculado = ((parseFloat(avance.cantidadAvanzada) / parseFloat(meta.cantidad)) * 100);
    const presupuestoTotalMeta = meta.presupuestoAnual?.reduce((sum, p) => sum + (p.valor || 0), 0) || 0;
    const porcentajeFinancieroCalculado = presupuestoTotalMeta > 0 
      ? ((parseFloat(avance.gastoEjecutado) / presupuestoTotalMeta) * 100)
      : 0;
    return {
      porcentajeCalculado: parseFloat(porcentajeCalculado.toFixed(2)),
      porcentajeFinancieroCalculado: parseFloat(porcentajeFinancieroCalculado.toFixed(2))
    };
  };

  const validateProgresiveOrder = (meta, anioAvance, trimestreAvance) => {
    const programacion = meta.programacionTrimestral || [];
    if (programacion.length === 0) {
      return { valid: false, message: 'Debe programar los trimestres antes de reportar avances para esta meta.' };
    }
    
    const avances = meta.avances || [];
    const reportados = new Set(avances.map(a => `${a.anioAvance}-${a.trimestreAvance}`));
    
    const pendientes = programacion.filter(p => !reportados.has(`${p.anio}-${p.trimestre}`));
    
    if (pendientes.length === 0) {
      return { valid: false, message: 'Ya se han reportado todos los trimestres programados para esta meta.' };
    }
    
    pendientes.sort((a, b) => {
      if (a.anio !== b.anio) return a.anio - b.anio;
      return a.trimestre.localeCompare(b.trimestre);
    });
    
    const siguiente = pendientes[0];
    
    if (siguiente.anio !== anioAvance || siguiente.trimestre !== trimestreAvance) {
      return { 
        valid: false, 
        message: `Debe reportar el trimestre ${siguiente.anio} - ${siguiente.trimestre} antes de continuar.` 
      };
    }
    
    return { valid: true };
  };

  const validateAvanceDataLocal = (avanceData, meta, planActivoAnios, existingAvancesThisMeta, isUpdating = false, avanceIdToUpdate = null) => {
    if (!avanceData.descripcion || !avanceData.cantidadAvanzada) {
      toast({ title: "Error de Validación", description: 'La descripción y la cantidad avanzada son obligatorias.', variant: "destructive" });
      return false;
    }
    if (parseFloat(avanceData.cantidadAvanzada) <= 0) {
      toast({ title: "Error de Validación", description: 'La cantidad avanzada debe ser mayor a 0.', variant: "destructive" });
      return false;
    }
    if (!avanceData.anioAvance || !avanceData.trimestreAvance) {
      toast({ title: "Error de Validación", description: 'El año y trimestre son obligatorios.', variant: "destructive" });
      return false;
    }
    if (planActivoAnios) {
      if (parseInt(avanceData.anioAvance, 10) < planActivoAnios.inicio || parseInt(avanceData.anioAvance, 10) > planActivoAnios.fin) {
        toast({ title: "Error de Validación", description: `El año del avance debe estar entre ${planActivoAnios.inicio} y ${planActivoAnios.fin}.`, variant: "destructive" });
        return false;
      }
    }
    
    if (!isUpdating) {
      const orderValidation = validateProgresiveOrder(meta, avanceData.anioAvance, avanceData.trimestreAvance);
      if (!orderValidation.valid) {
        toast({ title: "Error de Orden", description: orderValidation.message, variant: "destructive" });
        return false;
      }
    }
    
    const avanceExistenteConflicto = existingAvancesThisMeta.find(a => 
      a.anioAvance === avanceData.anioAvance && 
      a.trimestreAvance === avanceData.trimestreAvance &&
      (!isUpdating || a.idAvance !== avanceIdToUpdate)
    );

    if (avanceExistenteConflicto) {
      toast({ title: "Error de Duplicidad", description: 'Ya existe un avance registrado para este trimestre y año en esta meta.', variant: "destructive" });
      return false;
    }
    return true;
  };

  const registrarAvanceContext = (metaId, avanceData) => {
    let success = false;
    setPlanesDesarrollo(prevPlanes =>
      prevPlanes.map(plan => {
        if (plan.id === activePlanId) {
          const newPlan = JSON.parse(JSON.stringify(plan));
          let metaActualizada = false;
          const planActivoAnios = {
            inicio: new Date(plan.vigenciaInicio).getFullYear(),
            fin: new Date(plan.vigenciaFin).getFullYear()
          };
          
          const buscarYActualizarMetaRecursivo = (items) => {
            if (!items || !Array.isArray(items)) return false;
            for (const item of items) {
              if (item && item.metas && Array.isArray(item.metas)) {
                const metaIndex = item.metas.findIndex(m => m.idMeta === metaId);
                if (metaIndex !== -1) {
                  const meta = item.metas[metaIndex];
                  
                  if (!validateAvanceDataLocal(avanceData, meta, planActivoAnios, meta.avances || [])) {
                    metaActualizada = true;
                    success = false;
                    return true;
                  }

                  const { porcentajeCalculado, porcentajeFinancieroCalculado } = calculateAvancePercentagesLocal(avanceData, meta);

                  const nuevoAvance = { 
                    ...avanceData, 
                    idAvance: uuidv4(), 
                    fecha: new Date().toISOString(),
                    porcentajeCalculado,
                    porcentajeFinancieroCalculado
                  };
                  
                  meta.avances = [...(meta.avances || []), nuevoAvance];
                  
                  meta.progreso = meta.avances.reduce((sum, av) => sum + (av.porcentajeCalculado || 0), 0);
                  meta.progreso = parseFloat(Math.min(100, meta.progreso).toFixed(2));

                  meta.progresoFinanciero = meta.avances.reduce((sum, av) => sum + (av.porcentajeFinancieroCalculado || 0), 0);
                  meta.progresoFinanciero = parseFloat(Math.min(100, meta.progresoFinanciero).toFixed(2));
                  
                  metaActualizada = true;
                  success = true;
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

          if (!metaActualizada) {
             toast({ title: "Error", description: "Meta no encontrada para registrar el avance.", variant: "destructive" });
             success = false;
          } else if (success) {
             toast({ title: "Avance Registrado", description: `Avance para la meta ha sido registrado.` });
          }
          return newPlan;
        }
        return plan;
      })
    );
    return success;
  };
  
  const updateAvanceContext = (metaId, avanceId, avanceData) => {
    let success = false;
    setPlanesDesarrollo(prevPlanes =>
      prevPlanes.map(plan => {
        if (plan.id === activePlanId) {
          const newPlan = JSON.parse(JSON.stringify(plan));
          let metaActualizada = false;
          const planActivoAnios = {
            inicio: new Date(plan.vigenciaInicio).getFullYear(),
            fin: new Date(plan.vigenciaFin).getFullYear()
          };

          const buscarYActualizarMetaRecursivo = (items) => {
            if (!items || !Array.isArray(items)) return false;
            for (const item of items) {
              if (item && item.metas && Array.isArray(item.metas)) {
                const metaIndex = item.metas.findIndex(m => m.idMeta === metaId);
                if (metaIndex !== -1) {
                  const meta = item.metas[metaIndex];
                  const avanceIndex = meta.avances ? meta.avances.findIndex(av => av.idAvance === avanceId) : -1;

                  if (avanceIndex === -1) {
                    toast({ title: "Error", description: `Avance con ID ${avanceId} no encontrado.`, variant: "destructive" });
                    metaActualizada = true;
                    success = false;
                    return true;
                  }

                  if (!validateAvanceDataLocal(avanceData, meta, planActivoAnios, meta.avances || [], true, avanceId)) {
                    metaActualizada = true;
                    success = false;
                    return true;
                  }
                  
                  const { porcentajeCalculado, porcentajeFinancieroCalculado } = calculateAvancePercentagesLocal(avanceData, meta);
                  
                  meta.avances[avanceIndex] = {
                    ...meta.avances[avanceIndex],
                    ...avanceData,
                    porcentajeCalculado,
                    porcentajeFinancieroCalculado
                  };

                  meta.progreso = meta.avances.reduce((sum, av) => sum + (av.porcentajeCalculado || 0), 0);
                  meta.progreso = parseFloat(Math.min(100, meta.progreso).toFixed(2));

                  meta.progresoFinanciero = meta.avances.reduce((sum, av) => sum + (av.porcentajeFinancieroCalculado || 0), 0);
                  meta.progresoFinanciero = parseFloat(Math.min(100, meta.progresoFinanciero).toFixed(2));
                  
                  metaActualizada = true;
                  success = true;
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
          
          if (!metaActualizada) {
             toast({ title: "Error", description: "Meta no encontrada para actualizar el avance.", variant: "destructive" });
             success = false;
          } else if(success) {
            toast({ title: "Avance Actualizado", description: `El avance ha sido actualizado.` });
          }
          return newPlan;
        }
        return plan;
      })
    );
    return success;
  };

  return {
    registrarAvanceContext,
    updateAvanceContext
  };
};