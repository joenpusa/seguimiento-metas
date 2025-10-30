import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';

import { 
  planDesarrolloEstructura as initialPlanEstructura, 
  municipiosDepartamentales as initialMunicipios, 
  responsables as initialResponsables,
  unidadesMedida as initialUnidadesMedida
} from '@/context/metasData.js';

import { PlanManager } from '@/context/planContextModules/managePlans.js';
import { EstructuraPDIManager } from '@/context/planContextModules/manageEstructuraPDI.js';
import { CatalogoManager } from '@/context/planContextModules/manageCatalogos.js';
import { MetasManager } from '@/context/planContextModules/metasManager.js';
import { AvancesManager as AvancesManagerCreator } from '@/context/planContextModules/avancesManager.js';
import { manageAvancesInMetas } from '@/context/planContextModules/manageAvancesInMetas.js';


const PlanContext = createContext();

export const PlanProvider = ({ children }) => {
  const { toast } = useToast();

  const [planesDesarrollo, setPlanesDesarrollo] = useState(() => {
    const storedPlanes = localStorage.getItem('planesDesarrollo');
    if (storedPlanes) {
      try {
        const parsedPlanes = JSON.parse(storedPlanes);
        return parsedPlanes.map(plan => ({
          ...plan,
          estructuraPDI: plan.estructuraPDI || JSON.parse(JSON.stringify(initialPlanEstructura)) 
        }));
      } catch (e) {
        localStorage.removeItem('planesDesarrollo');
      }
    }
    return [{ 
      id: uuidv4(), 
      nombrePlan: 'Plan de Desarrollo Departamental 2024-2027', 
      vigenciaInicio: '2024-01-01', 
      vigenciaFin: '2027-12-31',
      estructuraPDI: JSON.parse(JSON.stringify(initialPlanEstructura)),
      esActivo: true 
    }];
  });

  const [activePlanId, setActivePlanId] = useState(() => {
    const storedPlanes = localStorage.getItem('planesDesarrollo');
    if (storedPlanes) {
      try {
        const parsedPlanes = JSON.parse(storedPlanes);
        const activePlan = parsedPlanes.find(p => p.esActivo);
        return activePlan ? activePlan.id : (parsedPlanes.length > 0 ? parsedPlanes[0].id : null);
      } catch (e) {
        return null;
      }
    }
    const defaultActivePlan = planesDesarrollo.find(p => p.esActivo);
    return defaultActivePlan ? defaultActivePlan.id : (planesDesarrollo.length > 0 ? planesDesarrollo[0].id : null);
  });
  
  const [listaMunicipios, setListaMunicipios] = useState(() => {
    const storedMunicipios = localStorage.getItem('listaMunicipiosFull');
    return storedMunicipios ? JSON.parse(storedMunicipios) : initialMunicipios;
  });

  const [listaResponsables, setListaResponsables] = useState(() => {
    const storedResponsables = localStorage.getItem('listaResponsablesFull');
    return storedResponsables ? JSON.parse(storedResponsables) : initialResponsables;
  });

  const [listaUnidadesMedida, setListaUnidadesMedida] = useState(() => {
    const storedUnidades = localStorage.getItem('listaUnidadesMedidaFull');
    return storedUnidades ? JSON.parse(storedUnidades) : initialUnidadesMedida;
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem('planesDesarrollo', JSON.stringify(planesDesarrollo));
    if (planesDesarrollo.length > 0 && !planesDesarrollo.find(p => p.id === activePlanId)) {
      const firstPlanId = planesDesarrollo[0].id;
      setActivePlanId(firstPlanId);
      setPlanesDesarrollo(prev => prev.map((p, index) => ({...p, esActivo: index === 0})));

    } else if (planesDesarrollo.length === 0) {
      setActivePlanId(null);
    }
  }, [planesDesarrollo, activePlanId]);

  useEffect(() => {
    localStorage.setItem('listaMunicipiosFull', JSON.stringify(listaMunicipios));
  }, [listaMunicipios]);

  useEffect(() => {
    localStorage.setItem('listaResponsablesFull', JSON.stringify(listaResponsables));
  }, [listaResponsables]);

  useEffect(() => {
    localStorage.setItem('listaUnidadesMedidaFull', JSON.stringify(listaUnidadesMedida));
  }, [listaUnidadesMedida]);
  
  useEffect(() => {
    setLoading(false);
  }, []);

  const getActivePlan = useCallback(() => {
    return planesDesarrollo.find(p => p.id === activePlanId);
  }, [planesDesarrollo, activePlanId]);

  const getAllMetasFromActivePlan = useCallback(() => {
    const planActivo = getActivePlan();
    if (!planActivo || !planActivo.estructuraPDI || !planActivo.estructuraPDI.lineasEstrategicas) return [];
    
    const metasAcumuladas = [];
    const recorrerEstructura = (items, path) => {
      if (!Array.isArray(items)) return;
      items.forEach(item => {
        if (item && item.metas && Array.isArray(item.metas)) {
          item.metas.forEach(meta => {
            metasAcumuladas.push({ 
              ...meta, 
              planId: planActivo.id,
              iniciativaId: item.id, // ID de la iniciativa padre
              nombreIniciativa: item.nombre, // Nombre de la iniciativa padre
              // Agregar la ruta jerárquica completa si es necesario para filtros
              path: { ...path, iniciativa: item.nombre } 
            });
          });
        }
        if (item.componentes) recorrerEstructura(item.componentes, { ...path, linea: item.nombre });
        if (item.apuestas) recorrerEstructura(item.apuestas, { ...path, componente: item.nombre });
        if (item.iniciativas && Array.isArray(item.iniciativas)) recorrerEstructura(item.iniciativas, { ...path, apuesta: item.nombre });
        // Considerar el caso donde `iniciativas` es un objeto (aunque debería ser un array según el esquema)
         else if (item.iniciativas && typeof item.iniciativas === 'object' && item.iniciativas.metas) {
           recorrerEstructura([item.iniciativas], { ...path, apuesta: item.nombre });
        }
      });
    };
    recorrerEstructura(planActivo.estructuraPDI.lineasEstrategicas, {});
    return metasAcumuladas;
  }, [getActivePlan]);

  const getAllAvancesFromActivePlan = useCallback(() => {
    const metasDelPlanActivo = getAllMetasFromActivePlan();
    let avancesAcumulados = [];
    metasDelPlanActivo.forEach(meta => {
      if (Array.isArray(meta.avances)) {
        meta.avances.forEach(avance => {
          avancesAcumulados.push({
            ...avance,
            metaId: meta.idMeta,
            planId: meta.planId,
            metaNumero: meta.numeroMetaManual || '',
            metaNombre: meta.nombreMeta,
            metaUnidadMedida: meta.unidadMedida,
            metaResponsable: meta.responsable,
            // Podrías agregar aquí el `progreso` y `progresoFinanciero` actual de la meta si es útil
          });
        });
      }
    });
    return avancesAcumulados;
  }, [getAllMetasFromActivePlan]);
  
  const planManagerInstance = PlanManager(setPlanesDesarrollo, setActivePlanId, planesDesarrollo, toast);
  const estructuraManagerInstance = EstructuraPDIManager(setPlanesDesarrollo, activePlanId, toast);
  const catalogoManagerInstance = CatalogoManager(
    { listaMunicipios, setListaMunicipios },
    { listaResponsables, setListaResponsables },
    { listaUnidadesMedida, setListaUnidadesMedida },
    toast
  );
  const metasManagerInstance = MetasManager(setPlanesDesarrollo, activePlanId, toast);
  // Se pasa setPlanesDesarrollo para que AvancesManager pueda actualizar las metas con los nuevos progresos.
  const avancesManagerHooks = manageAvancesInMetas(setPlanesDesarrollo, activePlanId, toast); 
  const avancesManagerInstance = AvancesManagerCreator(planesDesarrollo, activePlanId, toast, setPlanesDesarrollo);


  const contextValue = {
    planesDesarrollo,
    activePlanId,
    getActivePlan,
    ...planManagerInstance,
    ...estructuraManagerInstance,
    ...catalogoManagerInstance,
    ...metasManagerInstance,
    ...avancesManagerInstance, // De AvancesManagerCreator
    ...avancesManagerHooks, // De manageAvancesInMetas
    getAllMetasFromActivePlan,
    getAllAvancesFromActivePlan,
    listaMunicipios, 
    listaResponsables, 
    listaUnidadesMedida,
    loading
  };

  return (
    <PlanContext.Provider value={contextValue}>
      {children}
    </PlanContext.Provider>
  );
};

export const usePlan = () => {
  const context = useContext(PlanContext);
  if (!context) {
    throw new Error('usePlan debe ser usado dentro de un PlanProvider');
  }
  return context;
};