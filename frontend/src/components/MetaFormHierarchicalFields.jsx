import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const MetaFormHierarchicalFields = ({ formData, setFormData, handleSelectChange, estructuraPDI }) => {
  const [componentes, setComponentes] = useState([]);
  const [apuestas, setApuestas] = useState([]);
  const [iniciativas, setIniciativas] = useState([]);

  useEffect(() => {
    if (formData.lineaEstrategica && estructuraPDI) {
      const linea = estructuraPDI.lineasEstrategicas.find(l => l.nombre === formData.lineaEstrategica);
      setComponentes(linea ? linea.componentes : []);
    } else {
      setComponentes([]);
    }
  }, [formData.lineaEstrategica, estructuraPDI]);

  useEffect(() => {
    if (formData.componente && formData.lineaEstrategica && estructuraPDI) {
      const lineaSeleccionada = estructuraPDI.lineasEstrategicas.find(l => l.nombre === formData.lineaEstrategica);
      const componente = lineaSeleccionada?.componentes.find(c => c.nombre === formData.componente);
      setApuestas(componente ? componente.apuestas : []);
    } else {
      setApuestas([]);
    }
  }, [formData.componente, formData.lineaEstrategica, estructuraPDI]);

  useEffect(() => {
    if (formData.apuesta && formData.componente && formData.lineaEstrategica && estructuraPDI) {
      const lineaSeleccionada = estructuraPDI.lineasEstrategicas.find(l => l.nombre === formData.lineaEstrategica);
      const componenteSeleccionado = lineaSeleccionada?.componentes.find(c => c.nombre === formData.componente);
      const apuesta = componenteSeleccionado?.apuestas.find(a => a.nombre === formData.apuesta);
      setIniciativas(apuesta ? apuesta.iniciativas : []);
    } else {
      setIniciativas([]);
    }
  }, [formData.apuesta, formData.componente, formData.lineaEstrategica, estructuraPDI]);

  const onLocalSelectChange = (name, value) => {
    handleSelectChange(name, value); 

    if (name === 'lineaEstrategica') {
      setFormData(prev => ({ ...prev, componente: '', apuesta: '', iniciativa: '' }));
      setApuestas([]);
      setIniciativas([]);
    } else if (name === 'componente') {
      setFormData(prev => ({ ...prev, apuesta: '', iniciativa: '' }));
      setIniciativas([]);
    } else if (name === 'apuesta') {
      setFormData(prev => ({ ...prev, iniciativa: '' }));
    }
  };


  return (
    <>
      <div className="grid gap-2">
        <Label htmlFor="lineaEstrategica">Línea Estratégica</Label>
        <Select value={formData.lineaEstrategica} onValueChange={(value) => onLocalSelectChange('lineaEstrategica', value)}>
          <SelectTrigger id="lineaEstrategica"><SelectValue placeholder="Seleccionar Línea Estratégica" /></SelectTrigger>
          <SelectContent>
            {estructuraPDI?.lineasEstrategicas?.map(linea => (
              <SelectItem key={linea.id || linea.nombre} value={linea.nombre}>{linea.nombre}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {formData.lineaEstrategica && (
        <div className="grid gap-2">
          <Label htmlFor="componente">Componente (Sector/Población)</Label>
          <Select value={formData.componente} onValueChange={(value) => onLocalSelectChange('componente', value)} disabled={!formData.lineaEstrategica}>
            <SelectTrigger id="componente"><SelectValue placeholder="Seleccionar Componente" /></SelectTrigger>
            <SelectContent>
              {componentes.map(comp => (
                <SelectItem key={comp.id || comp.nombre} value={comp.nombre}>{comp.nombre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {formData.componente && (
        <div className="grid gap-2">
          <Label htmlFor="apuesta">Apuesta</Label>
          <Select value={formData.apuesta} onValueChange={(value) => onLocalSelectChange('apuesta', value)} disabled={!formData.componente}>
            <SelectTrigger id="apuesta"><SelectValue placeholder="Seleccionar Apuesta" /></SelectTrigger>
            <SelectContent>
              {apuestas.map(ap => (
                <SelectItem key={ap.id || ap.nombre} value={ap.nombre}>{ap.nombre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {formData.apuesta && (
        <div className="grid gap-2">
          <Label htmlFor="iniciativa">Iniciativa</Label>
          <Select value={formData.iniciativa} onValueChange={(value) => onLocalSelectChange('iniciativa', value)} disabled={!formData.apuesta}>
            <SelectTrigger id="iniciativa"><SelectValue placeholder="Seleccionar Iniciativa" /></SelectTrigger>
            <SelectContent>
              {iniciativas.map(ini => (
                <SelectItem key={ini} value={ini}>{ini}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </>
  );
};

export default MetaFormHierarchicalFields;