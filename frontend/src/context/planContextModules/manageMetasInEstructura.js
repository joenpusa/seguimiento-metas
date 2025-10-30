import { v4 as uuidv4 } from 'uuid';

export const manageMetasInEstructura = (setPlanesDesarrollo, activePlanId, toast) => {
  const ensureIniciativaIsObject = (iniciativa) => {
    if (typeof iniciativa === 'string') {
      return { id: uuidv4(), nombre: iniciativa, metas: [] };
    }
    if (typeof iniciativa === 'object' && iniciativa !== null) {
      if (!iniciativa.id) iniciativa.id = uuidv4();
      if (!Array.isArray(iniciativa.metas)) iniciativa.metas = [];
      return iniciativa;
    }
    return { id: uuidv4(), nombre: 'Iniciativa Desconocida', metas: [] }; 
  };

  const addMetaToIniciativa = (iniciativaPath, metaData) => {
    setPlanesDesarrollo(prevPlanes =>
      prevPlanes.map(plan => {
        if (plan.id === activePlanId) {
          const newPlan = JSON.parse(JSON.stringify(plan)); 
          let currentLevel = newPlan.estructuraPDI;
          
          for (const pathSegment of iniciativaPath.slice(0, -1)) {
            if (!currentLevel[pathSegment.type] || !currentLevel[pathSegment.type][pathSegment.index]) {
              console.error("Error: Path segment not found in addMetaToIniciativa", pathSegment, currentLevel);
              return plan; 
            }
            currentLevel = currentLevel[pathSegment.type][pathSegment.index];
          }
          
          const iniciativaParentCollectionKey = iniciativaPath[iniciativaPath.length - 1].type;
          const iniciativaIndex = iniciativaPath[iniciativaPath.length - 1].index;

          if (!currentLevel[iniciativaParentCollectionKey] || currentLevel[iniciativaParentCollectionKey][iniciativaIndex] === undefined) {
             console.error("Error: Iniciativa parent or iniciativa not found in addMetaToIniciativa", currentLevel, iniciativaParentCollectionKey, iniciativaIndex);
             return plan;
          }
          
          currentLevel[iniciativaParentCollectionKey][iniciativaIndex] = ensureIniciativaIsObject(currentLevel[iniciativaParentCollectionKey][iniciativaIndex]);
          const iniciativa = currentLevel[iniciativaParentCollectionKey][iniciativaIndex];
          
          iniciativa.metas.push({ 
            ...metaData, 
            idMeta: uuidv4(), 
            progreso: 0, 
            progresoFinanciero: 0, 
            avances: [] 
          });
          return newPlan;
        }
        return plan;
      })
    );
    toast({ title: "Meta Añadida", description: `La meta "${metaData.nombreMeta}" ha sido añadida.` });
  };

  const updateMetaInIniciativa = (iniciativaPath, metaId, updatedMetaData) => {
    setPlanesDesarrollo(prevPlanes =>
      prevPlanes.map(plan => {
        if (plan.id === activePlanId) {
          const newPlan = JSON.parse(JSON.stringify(plan));
          let currentLevel = newPlan.estructuraPDI;
          for (const pathSegment of iniciativaPath.slice(0, -1)) {
             if (!currentLevel[pathSegment.type] || currentLevel[pathSegment.type][pathSegment.index] === undefined) return plan;
            currentLevel = currentLevel[pathSegment.type][pathSegment.index];
          }
          const iniciativaParentCollectionKey = iniciativaPath[iniciativaPath.length - 1].type;
          const iniciativaIndex = iniciativaPath[iniciativaPath.length - 1].index;

          if (!currentLevel[iniciativaParentCollectionKey] || currentLevel[iniciativaParentCollectionKey][iniciativaIndex] === undefined) return plan;
            
          currentLevel[iniciativaParentCollectionKey][iniciativaIndex] = ensureIniciativaIsObject(currentLevel[iniciativaParentCollectionKey][iniciativaIndex]);
          const iniciativa = currentLevel[iniciativaParentCollectionKey][iniciativaIndex];

          if (iniciativa.metas) {
            iniciativa.metas = iniciativa.metas.map(meta =>
              meta.idMeta === metaId ? { ...meta, ...updatedMetaData } : meta
            );
          }
          return newPlan;
        }
        return plan;
      })
    );
    toast({ title: "Meta Actualizada", description: `La meta "${updatedMetaData.nombreMeta}" ha sido actualizada.` });
  };
  
  const deleteMetaFromIniciativa = (iniciativaPath, metaId) => {
     setPlanesDesarrollo(prevPlanes =>
      prevPlanes.map(plan => {
        if (plan.id === activePlanId) {
          const newPlan = JSON.parse(JSON.stringify(plan));
          let currentLevel = newPlan.estructuraPDI;
          for (const pathSegment of iniciativaPath.slice(0, -1)) {
            if (!currentLevel[pathSegment.type] || currentLevel[pathSegment.type][pathSegment.index] === undefined) return plan;
            currentLevel = currentLevel[pathSegment.type][pathSegment.index];
          }
          const iniciativaParentCollectionKey = iniciativaPath[iniciativaPath.length - 1].type;
          const iniciativaIndex = iniciativaPath[iniciativaPath.length - 1].index;

          if (!currentLevel[iniciativaParentCollectionKey] || currentLevel[iniciativaParentCollectionKey][iniciativaIndex] === undefined) return plan;
          
          currentLevel[iniciativaParentCollectionKey][iniciativaIndex] = ensureIniciativaIsObject(currentLevel[iniciativaParentCollectionKey][iniciativaIndex]);
          const iniciativa = currentLevel[iniciativaParentCollectionKey][iniciativaIndex];
          const metaToDelete = iniciativa.metas?.find(m => m.idMeta === metaId);

          if (iniciativa.metas) {
            iniciativa.metas = iniciativa.metas.filter(meta => meta.idMeta !== metaId);
          }
          if (metaToDelete) {
            toast({ title: "Meta Eliminada", description: `La meta "${metaToDelete.nombreMeta}" ha sido eliminada.` });
          }
          return newPlan;
        }
        return plan;
      })
    );
  };

  return {
    addMetaToIniciativa,
    updateMetaInIniciativa,
    deleteMetaFromIniciativa
  };
};