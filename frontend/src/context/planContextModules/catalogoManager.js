import { v4 as uuidv4 } from 'uuid';

export const CatalogoManager = (
  { listaMunicipios, setListaMunicipios },
  { listaResponsables, setListaResponsables },
  { listaUnidadesMedida, setListaUnidadesMedida },
  toast
) => {
  const addMunicipio = (nombre) => {
    const nombreNormalizado = nombre.trim();
    if (listaMunicipios.find(m => m.toLowerCase() === nombreNormalizado.toLowerCase())) {
      toast({ title: "Error", description: `El municipio "${nombreNormalizado}" ya existe.`, variant: "destructive" });
      return false;
    }
    if (nombreNormalizado.toLowerCase() === "todo el departamento") {
      toast({ title: "Error", description: "No puede añadir 'Todo el departamento' manualmente.", variant: "destructive" });
      return false;
    }
    setListaMunicipios(prev => [...prev, nombreNormalizado]);
    toast({ title: "Municipio Añadido", description: `El municipio "${nombreNormalizado}" ha sido añadido.` });
    return true;
  };

  const removeMunicipio = (nombre) => {
    if (nombre.toLowerCase() === "todo el departamento") {
      toast({ title: "Acción no permitida", description: "'Todo el departamento' no se puede eliminar.", variant: "destructive" });
      return false;
    }
    setListaMunicipios(prev => prev.filter(m => m !== nombre));
    toast({ title: "Municipio Eliminado", description: `El municipio "${nombre}" ha sido eliminado.` });
    return true;
  };

  const addResponsable = (nombre) => {
    const nombreNormalizado = nombre.trim();
    if (listaResponsables.find(r => r.nombre.toLowerCase() === nombreNormalizado.toLowerCase())) {
      toast({ title: "Error", description: `El responsable "${nombreNormalizado}" ya existe.`, variant: "destructive" });
      return false;
    }
    const nuevoResponsable = { id: uuidv4(), nombre: nombreNormalizado };
    setListaResponsables(prev => [...prev, nuevoResponsable]);
    toast({ title: "Responsable Añadido", description: `El responsable "${nombreNormalizado}" ha sido añadido.` });
    return true;
  };

  const removeResponsable = (id) => {
    const responsableEliminado = listaResponsables.find(r => r.id === id);
    if (responsableEliminado) {
      setListaResponsables(prev => prev.filter(r => r.id !== id));
      toast({ title: "Responsable Eliminado", description: `El responsable "${responsableEliminado.nombre}" ha sido eliminado.` });
    }
    return true;
  };
  
  const addUnidadMedida = (nombre) => {
    const nombreNormalizado = nombre.trim();
    if (listaUnidadesMedida.find(u => u.nombre.toLowerCase() === nombreNormalizado.toLowerCase())) {
      toast({ title: "Error", description: `La unidad de medida "${nombreNormalizado}" ya existe.`, variant: "destructive" });
      return false;
    }
    const nuevaUnidad = { id: uuidv4(), nombre: nombreNormalizado };
    setListaUnidadesMedida(prev => [...prev, nuevaUnidad]);
    toast({ title: "Unidad de Medida Añadida", description: `La unidad "${nombreNormalizado}" ha sido añadida.` });
    return true;
  };

  const removeUnidadMedida = (id) => {
    const unidadEliminada = listaUnidadesMedida.find(u => u.id === id);
    if (unidadEliminada) {
      setListaUnidadesMedida(prev => prev.filter(u => u.id !== id));
      toast({ title: "Unidad de Medida Eliminada", description: `La unidad "${unidadEliminada.nombre}" ha sido eliminada.` });
    }
    return true;
  };

  return {
    addMunicipio,
    removeMunicipio,
    addResponsable,
    removeResponsable,
    addUnidadMedida,
    removeUnidadMedida,
  };
};