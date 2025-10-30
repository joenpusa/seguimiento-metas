import { v4 as uuidv4 } from 'uuid';

// AvancesManager ahora es un creador de funciones que recibe `planesDesarrollo`, `activePlanId` y `toast`
// Y `setPlanesDesarrollo` para poder actualizar las metas directamente.
export const AvancesManager = (planesDesarrollo, activePlanId, toast, setPlanesDesarrollo) => {

  const getAllMetasFromPlan = (planId) => {
    const plan = planesDesarrollo.find(p => p.id === planId);
    if (!plan || !plan.estructuraPDI || !plan.estructuraPDI.lineasEstrategicas) return [];
    
    const metasAcumuladas = [];
    const recorrerEstructura = (items) => {
      if (!Array.isArray(items)) return;
      items.forEach(item => {
        if (item && item.metas && Array.isArray(item.metas)) {
          item.metas.forEach(meta => metasAcumuladas.push({ ...meta, planId: plan.id, iniciativaId: item.id }));
        }
        if (item.componentes) recorrerEstructura(item.componentes);
        if (item.apuestas) recorrerEstructura(item.apuestas);
        if (item.iniciativas && Array.isArray(item.iniciativas)) recorrerEstructura(item.iniciativas);
        else if (item.iniciativas && typeof item.iniciativas === 'object' && item.iniciativas.metas) {
           recorrerEstructura([item.iniciativas]);
        }
      });
    };
    recorrerEstructura(plan.estructuraPDI.lineasEstrategicas);
    return metasAcumuladas;
  };

  const getAllAvancesFromPlan = (planId) => {
    const metasDelPlan = getAllMetasFromPlan(planId);
    let avancesAcumulados = [];
    metasDelPlan.forEach(meta => {
      if (Array.isArray(meta.avances)) {
        meta.avances.forEach(avance => {
          avancesAcumulados.push({
            ...avance,
            metaId: meta.idMeta, // Aseguramos que el avance tenga el idMeta
            planId: meta.planId
          });
        });
      }
    });
    return avancesAcumulados;
  };


  const getAvancesByMetaId = (metaId) => {
    const avancesDelPlan = getAllAvancesFromPlan(activePlanId);
    return avancesDelPlan.filter(avance => avance.metaId === metaId);
  };

  const getAvanceById = (avanceId) => {
    const avancesDelPlan = getAllAvancesFromPlan(activePlanId);
    return avancesDelPlan.find(avance => avance.idAvance === avanceId);
  };

  const getMetaFromAvance = (avance) => {
    const metasDelPlan = getAllMetasFromPlan(activePlanId);
    return metasDelPlan.find(meta => meta.idMeta === avance.metaId);
  };

  const calculateAvancePercentages = (avance, meta) => {
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

  const validateAvanceData = (avanceData, meta) => {
    if (!avanceData.descripcion || !avanceData.cantidadAvanzada) {
      throw new Error('La descripción y la cantidad avanzada son obligatorias.');
    }
    if (parseFloat(avanceData.cantidadAvanzada) <= 0) {
      throw new Error('La cantidad avanzada debe ser mayor a 0.');
    }
    // No validar contra meta.cantidad aquí si el avance es acumulativo en la meta
    if (!avanceData.anioAvance || !avanceData.trimestreAvance) {
      throw new Error('El año y trimestre son obligatorios.');
    }
    const planActivo = planesDesarrollo.find(plan => plan.id === activePlanId);
    if (planActivo) {
      const anioInicio = new Date(planActivo.vigenciaInicio).getFullYear();
      const anioFin = new Date(planActivo.vigenciaFin).getFullYear();
      if (parseInt(avanceData.anioAvance, 10) < anioInicio || parseInt(avanceData.anioAvance, 10) > anioFin) {
        throw new Error(`El año del avance debe estar entre ${anioInicio} y ${anioFin}.`);
      }
    }
  };

  // ESTA FUNCION YA NO SE USA DIRECTAMENTE, SE USA registrarAvanceContext desde manageAvancesInMetas.js
  // Se deja por si acaso o para referencia de lógica.
  const registrarAvanceDirectoNoUsado = (avanceData) => {
    // Esta función es compleja porque tendría que modificar la estructura anidada de planesDesarrollo
    // Es mejor usar la lógica en manageAvancesInMetas.js que ya hace esto.
    toast({ title: "Error de Lógica", description: "Función registrarAvanceDirectoNoUsado no debe ser llamada.", variant: "destructive" });
    return null;
  };
  
  // ESTA FUNCION YA NO SE USA DIRECTAMENTE, SE USA updateAvanceContext desde manageAvancesInMetas.js
  const updateAvanceDirectoNoUsado = (avanceId, avanceData) => {
    toast({ title: "Error de Lógica", description: "Función updateAvanceDirectoNoUsado no debe ser llamada.", variant: "destructive" });
    return null;
  };


  const deleteAvanceContext = (metaId, avanceId) => {
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
                  const avanceOriginal = meta.avances ? meta.avances.find(av => av.idAvance === avanceId) : null;
                  if (!avanceOriginal) {
                     toast({ title: "Error", description: `Avance con ID ${avanceId} no encontrado.`, variant: "destructive" });
                     return true; // Detiene la búsqueda si la meta fue encontrada pero el avance no
                  }

                  meta.avances = meta.avances.filter(av => av.idAvance !== avanceId);
                  
                  // Recalcular progreso de la meta
                  meta.progreso = meta.avances.reduce((sum, av) => sum + (av.porcentajeCalculado || 0), 0);
                  meta.progreso = parseFloat(Math.min(100, meta.progreso).toFixed(2));

                  meta.progresoFinanciero = meta.avances.reduce((sum, av) => sum + (av.porcentajeFinancieroCalculado || 0), 0);
                  meta.progresoFinanciero = parseFloat(Math.min(100, meta.progresoFinanciero).toFixed(2));
                  
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
            toast({ title: "Avance Eliminado", description: `El avance ha sido eliminado.` });
          } else {
            // Esto podría pasar si metaId es incorrecto o la estructura es inesperada
            toast({ title: "Error", description: `No se pudo encontrar la meta o el avance para eliminar.`, variant: "destructive" });
          }
          return newPlan;
        }
        return plan;
      })
    );
  };


  const getAvancesByPlanId = (planId) => { // Esta función es correcta
    return getAllAvancesFromPlan(planId);
  };

  return {
    getAvancesByMetaId,
    getAvanceById,
    getMetaFromAvance,
    // Las funciones de registrar y actualizar ahora se llamarán desde manageAvancesInMetas.js
    // registrarAvance: registrarAvanceDirectoNoUsado, 
    // updateAvance: updateAvanceDirectoNoUsado,
    deleteAvance: deleteAvanceContext, // Se usa la versión que modifica el contexto
    getAvancesByPlanId,
    // Se mantienen validateAvanceData y calculateAvancePercentages para ser usadas por manageAvancesInMetas
    _validateAvanceDataInternal: validateAvanceData,
    _calculateAvancePercentagesInternal: calculateAvancePercentages,
    _getAllMetasFromPlanInternal: getAllMetasFromPlan,
  };
};