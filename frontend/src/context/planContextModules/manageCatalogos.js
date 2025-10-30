import { v4 as uuidv4 } from 'uuid';

export const CatalogoManager = (
  { listaMunicipios, setListaMunicipios },
  { listaResponsables, setListaResponsables },
  { listaUnidadesMedida, setListaUnidadesMedida },
  toast
) => {
  const addMunicipio = (nombreMunicipio) => {
    const nombreNormalizado = nombreMunicipio.trim();
    if (listaMunicipios.find(m => m.toLowerCase() === nombreNormalizado.toLowerCase())) {
      toast({ title: "Error", description: `El municipio "${nombreNormalizado}" ya existe.`, variant: "destructive" });
      return false;
    }
    if (nombreNormalizado.toLowerCase() === "todo el departamento") {
      toast({ title: "Error", description: "No puede añadir 'Todo el departamento' manualmente.", variant: "destructive" });
      return false;
    }
    setListaMunicipios(prev => [...prev, nombreNormalizado].sort());
    toast({ title: "Municipio Añadido", description: `El municipio "${nombreNormalizado}" ha sido añadido.` });
    return true;
  };

  const removeMunicipio = (nombreMunicipio) => {
    if (nombreMunicipio.toLowerCase() === "todo el departamento") {
       toast({ title: "Error", description: `El municipio "${nombreMunicipio}" no puede ser eliminado.`, variant: "destructive" });
      return false;
    }
    setListaMunicipios(prev => prev.filter(m => m !== nombreMunicipio));
    toast({ title: "Municipio Eliminado", description: `El municipio "${nombreMunicipio}" ha sido eliminado.` });
    return true;
  };

  const addResponsable = (nombreResponsable, emailUsuario = '') => {
    const nombreNormalizado = nombreResponsable.trim();
    if (listaResponsables.find(r => r.nombre.toLowerCase() === nombreNormalizado.toLowerCase())) {
      toast({ title: "Error", description: `El responsable "${nombreNormalizado}" ya existe.`, variant: "destructive" });
      return false;
    }
    const nuevoResponsable = { id: uuidv4(), nombre: nombreNormalizado, emailUsuario: emailUsuario.trim() };
    setListaResponsables(prev => [...prev, nuevoResponsable].sort((a,b) => a.nombre.localeCompare(b.nombre)));
    
    return true;
  };
  
  const updateResponsableContext = (responsableId, updatedData) => {
     setListaResponsables(prev => prev.map(r => {
      if (r.id === responsableId) {
        return { ...r, ...updatedData };
      }
      return r;
    }));
    return true;
  };


  const removeResponsable = (responsableId) => {
    const responsable = listaResponsables.find(r => r.id === responsableId);
    setListaResponsables(prev => prev.filter(r => r.id !== responsableId));
    if (responsable) {
      toast({ title: "Responsable Eliminado", description: `"${responsable.nombre}" ha sido eliminado.` });
    }
    return true;
  };

  const addUnidadMedida = (nombreUnidad) => {
    const nombreNormalizado = nombreUnidad.trim();
    if (listaUnidadesMedida.find(u => u.nombre.toLowerCase() === nombreNormalizado.toLowerCase())) {
      toast({ title: "Error", description: `La unidad de medida "${nombreNormalizado}" ya existe.`, variant: "destructive" });
      return false;
    }
    const nuevaUnidad = { id: uuidv4(), nombre: nombreNormalizado };
    setListaUnidadesMedida(prev => [...prev, nuevaUnidad].sort((a,b) => a.nombre.localeCompare(b.nombre)));
    toast({ title: "Unidad de Medida Añadida", description: `"${nombreNormalizado}" ha sido añadida.` });
    return true;
  };

  const removeUnidadMedida = (unidadId) => {
    const unidad = listaUnidadesMedida.find(u => u.id === unidadId);
    setListaUnidadesMedida(prev => prev.filter(u => u.id !== unidadId));
    if (unidad) {
      toast({ title: "Unidad de Medida Eliminada", description: `"${unidad.nombre}" ha sido eliminada.` });
    }
    return true;
  };

  return {
    addMunicipio,
    removeMunicipio,
    addResponsable,
    updateResponsableContext,
    removeResponsable,
    addUnidadMedida,
    removeUnidadMedida
  };
};