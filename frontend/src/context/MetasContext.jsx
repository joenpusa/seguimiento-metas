import React, { createContext, useEffect, useContext } from 'react';
import { usePlan } from '@/context/PlanContext'; 

const MetasContext = createContext();

export const MetasProvider = ({ children }) => {
  const { 
    activePlanId, 
    getActivePlan, 
    listaMunicipios, 
    listaResponsables,
    listaUnidadesMedida,
    loading: planContextLoading,
    registrarAvance: registrarAvancePlanContext, 
  } = usePlan(); 

  const getActivePlanData = () => getActivePlan();
  
  const getAllMetasFromActivePlan = () => {
    const activePlan = getActivePlanData();
    if (!activePlan || !activePlan.estructuraPDI || !activePlan.estructuraPDI.lineasEstrategicas) {
      return [];
    }

    let todasLasMetas = [];
    activePlan.estructuraPDI.lineasEstrategicas.forEach(linea => {
      linea.componentes?.forEach(componente => {
        componente.apuestas?.forEach(apuesta => {
          apuesta.iniciativas?.forEach(iniciativa => {
            if (typeof iniciativa === 'object' && iniciativa.nombre && iniciativa.metas) {
              iniciativa.metas.forEach(meta => {
                todasLasMetas.push({
                  ...meta,
                  idMeta: meta.idMeta, 
                  nombreMeta: meta.nombreMeta,
                  iniciativaNombre: iniciativa.nombre,
                  apuestaNombre: apuesta.nombre,
                  componenteNombre: componente.nombre,
                  lineaEstrategicaNombre: linea.nombre,
                  planId: activePlan.id,
                  planNombre: activePlan.nombrePlan
                });
              });
            }
          });
        });
      });
    });
    return todasLasMetas;
  };


  return (
    <MetasContext.Provider value={{ 
      metas: getAllMetasFromActivePlan(), 
      loading: planContextLoading, 
      registrarAvance: registrarAvancePlanContext, 
      estructuraPDI: getActivePlanData()?.estructuraPDI || { lineasEstrategicas: [] },
      listaMunicipios,
      listaResponsables,
      listaUnidadesMedida,
      activePlanId
    }}>
      {children}
    </MetasContext.Provider>
  );
};

export const useMetas = () => {
  const context = useContext(MetasContext);
  if (!context) {
    throw new Error('useMetas debe ser usado dentro de un MetasProvider');
  }
  return context;
};