import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle } from 'lucide-react';

const AvanceFormMetaFields = ({ formData, handleChange, handleSelectChange, metas, avanceToEdit, availableAnios, trimestres }) => {
  
  const getTrimestresProgramados = (metaId) => {
    if (!metaId) return [];
    const meta = metas.find(m => m.idMeta === metaId);
    if (!meta || !meta.programacionTrimestral) return [];
    
    return meta.programacionTrimestral.map(p => ({
      anio: p.anio,
      trimestre: p.trimestre,
      key: `${p.anio}-${p.trimestre}`
    }));
  };

  const getSiguienteTrimestre = (metaId) => {
    if (!metaId) return null;
    const meta = metas.find(m => m.idMeta === metaId);
    if (!meta) return null;
    
    const programados = meta.programacionTrimestral || [];
    const avances = meta.avances || [];
    const reportados = new Set(avances.map(a => `${a.anioAvance}-${a.trimestreAvance}`));
    
    const pendientes = programados.filter(p => !reportados.has(`${p.anio}-${p.trimestre}`));
    
    if (pendientes.length === 0) return null;
    
    pendientes.sort((a, b) => {
      if (a.anio !== b.anio) return a.anio - b.anio;
      return a.trimestre.localeCompare(b.trimestre);
    });
    
    return pendientes[0];
  };

  const trimestresProgramados = getTrimestresProgramados(formData.metaId);
  const siguienteTrimestre = getSiguienteTrimestre(formData.metaId);
  
  const getAniosDisponibles = () => {
    if (!formData.metaId || avanceToEdit) return availableAnios;
    return trimestresProgramados.map(t => t.anio).filter((anio, index, arr) => arr.indexOf(anio) === index);
  };

  const getTrimestresPorAnio = (anio) => {
    if (!formData.metaId || avanceToEdit) return trimestres;
    return trimestresProgramados
      .filter(t => t.anio === parseInt(anio))
      .map(t => trimestres.find(tr => tr.id === t.trimestre))
      .filter(Boolean);
  };

  const aniosDisponibles = getAniosDisponibles();
  const trimestresPorAnio = getTrimestresPorAnio(formData.anioAvance);

  return (
    <>
      <div>
        <Label htmlFor="metaId">Meta</Label>
        <Select
          value={formData.metaId}
          onValueChange={(value) => handleSelectChange('metaId', value)}
          disabled={!!avanceToEdit}
        >
          <SelectTrigger id="metaId" className="mt-1">
            <SelectValue placeholder="Seleccionar meta" />
          </SelectTrigger>
          <SelectContent>
            {metas.map(meta => (
              <SelectItem key={meta.idMeta} value={meta.idMeta}>
                {meta.numeroMetaManual ? `(${meta.numeroMetaManual}) ` : ''}{meta.nombreMeta}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {formData.metaId && !avanceToEdit && (
        <div className="space-y-3">
          {trimestresProgramados.length === 0 ? (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <p className="text-sm font-medium text-yellow-800">
                  Programación Requerida
                </p>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                Debe programar los trimestres antes de reportar avances para esta meta.
              </p>
            </div>
          ) : siguienteTrimestre ? (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-800">
                Siguiente trimestre a reportar: {siguienteTrimestre.anio} - {siguienteTrimestre.trimestre}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Los avances deben reportarse en orden cronológico
              </p>
            </div>
          ) : (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-800">
                Todos los trimestres programados han sido reportados
              </p>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="anioAvance">Año del Avance</Label>
          <Select 
            value={formData.anioAvance?.toString()} 
            onValueChange={(value) => handleSelectChange('anioAvance', parseInt(value))}
            disabled={!!avanceToEdit && !!formData.anioAvance}
          >
            <SelectTrigger id="anioAvance" className="mt-1">
              <SelectValue placeholder="Año" />
            </SelectTrigger>
            <SelectContent>
              {aniosDisponibles.map(anio => (
                <SelectItem key={anio} value={anio.toString()}>{anio}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="trimestreAvance">Trimestre del Avance</Label>
          <Select 
            value={formData.trimestreAvance} 
            onValueChange={(value) => handleSelectChange('trimestreAvance', value)}
            disabled={!!avanceToEdit && !!formData.trimestreAvance}
          >
            <SelectTrigger id="trimestreAvance" className="mt-1">
              <SelectValue placeholder="Trimestre" />
            </SelectTrigger>
            <SelectContent>
              {trimestresPorAnio.map(trim => (
                <SelectItem key={trim.id} value={trim.id}>{trim.nombre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <Label htmlFor="fecha">Fecha Específica del Avance (Opcional)</Label>
        <Input id="fecha" name="fecha" type="date" value={formData.fecha} onChange={handleChange} className="mt-1"/>
      </div>
      
      <div>
        <Label htmlFor="descripcion">Descripción del Avance</Label>
        <Textarea
          id="descripcion"
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          placeholder="Describa el avance realizado"
          rows={3}
          className="mt-1"
        />
      </div>
    </>
  );
};

export default AvanceFormMetaFields;