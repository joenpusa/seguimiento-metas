import { v4 as uuidv4 } from 'uuid';

export const EstructuraPDIManager = (setPlanesDesarrollo, activePlanId, toast) => {
  const updateEstructuraPDIContext = (type, action, payload) => {
    setPlanesDesarrollo(prevPlanes =>
      prevPlanes.map(plan => {
        if (plan.id === activePlanId) {
          const newPlan = JSON.parse(JSON.stringify(plan));
          let currentLevel = newPlan.estructuraPDI;

          if (!currentLevel) {
            currentLevel = { lineasEstrategicas: [] };
            newPlan.estructuraPDI = currentLevel;
          }
          if (!currentLevel.lineasEstrategicas) {
            currentLevel.lineasEstrategicas = [];
          }


          if (type === 'linea') {
            if (action === 'add') {
              currentLevel.lineasEstrategicas.push({ id: uuidv4(), nombre: payload.nombre, componentes: [] });
              toast({ title: "Línea Estratégica Añadida" });
            } else if (action === 'update' && payload.id) {
              currentLevel.lineasEstrategicas = currentLevel.lineasEstrategicas.map(l => l.id === payload.id ? { ...l, nombre: payload.nombre } : l);
              toast({ title: "Línea Estratégica Actualizada" });
            } else if (action === 'delete' && payload.id) {
              currentLevel.lineasEstrategicas = currentLevel.lineasEstrategicas.filter(l => l.id !== payload.id);
              toast({ title: "Línea Estratégica Eliminada" });
            }
          } else if (['componente', 'apuesta', 'iniciativa'].includes(type) && payload.path) {
            const { path, nombre, id } = payload;
            let parent = currentLevel.lineasEstrategicas.find(l => l.id === path.lineaId);
            
            if (!parent && type !== 'linea') {
              toast({ title: "Error", description: "No se encontró la línea estratégica padre.", variant: "destructive" });
              return newPlan;
            }

            if (type === 'componente' && parent) {
                if (!parent.componentes) parent.componentes = [];
                if (action === 'add') parent.componentes.push({ id: uuidv4(), nombre, apuestas: [] });
                else if (action === 'update' && id) parent.componentes = parent.componentes.map(c => c.id === id ? { ...c, nombre } : c);
                else if (action === 'delete' && id) parent.componentes = parent.componentes.filter(c => c.id !== id);
            } else if (parent && (type === 'apuesta' || type === 'iniciativa')) {
                parent = parent.componentes?.find(c => c.id === path.componenteId);
                if (!parent && type !== 'componente') {
                  toast({ title: "Error", description: "No se encontró el componente padre.", variant: "destructive" });
                  return newPlan;
                }

                if (type === 'apuesta' && parent) {
                    if (!parent.apuestas) parent.apuestas = [];
                    if (action === 'add') parent.apuestas.push({ id: uuidv4(), nombre, iniciativas: [] });
                    else if (action === 'update' && id) parent.apuestas = parent.apuestas.map(a => a.id === id ? { ...a, nombre } : a);
                    else if (action === 'delete' && id) parent.apuestas = parent.apuestas.filter(a => a.id !== id);
                } else if (parent && type === 'iniciativa') {
                    parent = parent.apuestas?.find(a => a.id === path.apuestaId);
                    if (!parent && type !== 'apuesta') {
                      toast({ title: "Error", description: "No se encontró la apuesta padre.", variant: "destructive" });
                      return newPlan;
                    }
                    if (type === 'iniciativa' && parent) {
                        if (!parent.iniciativas) parent.iniciativas = [];
                        if (action === 'add') parent.iniciativas.push({ id: uuidv4(), nombre, metas: [] });
                        else if (action === 'update' && id) parent.iniciativas = parent.iniciativas.map(i => i.id === id ? { ...i, nombre } : i);
                        else if (action === 'delete' && id) parent.iniciativas = parent.iniciativas.filter(i => i.id !== id);
                    }
                }
            }
            if (action !== 'delete') toast({ title: `${type.charAt(0).toUpperCase() + type.slice(1)} ${action === 'add' ? 'Añadido/a' : 'Actualizado/a'}`});
            else toast({ title: `${type.charAt(0).toUpperCase() + type.slice(1)} Eliminado/a`});
          }
          return newPlan;
        }
        return plan;
      })
    );
  };
  
  return { updateEstructuraPDIContext };
};