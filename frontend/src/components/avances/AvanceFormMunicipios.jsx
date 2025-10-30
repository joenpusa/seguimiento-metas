import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

const AvanceFormMunicipios = ({ formData, setFormData, listaMunicipios }) => {
  
  const handleMunicipioChange = (municipioId, checked) => {
    setFormData(prev => {
      const currentMunicipios = prev.municipiosBeneficiadosAvance || [];
      let newMunicipios;
      if (checked) {
        newMunicipios = [...currentMunicipios, municipioId];
      } else {
        newMunicipios = currentMunicipios.filter(item => item !== municipioId);
      }
      return { ...prev, municipiosBeneficiadosAvance: newMunicipios };
    });
  };

  const handleSelectAllMunicipiosChange = (checked) => {
    if (checked) {
      setFormData(prev => ({ ...prev, municipiosBeneficiadosAvance: listaMunicipios.filter(m => m.toLowerCase() !== "todo el departamento").map(m => typeof m === 'string' ? m : m.nombre) }));
    } else {
      setFormData(prev => ({ ...prev, municipiosBeneficiadosAvance: [] }));
    }
  };
  
  const filteredListaMunicipios = listaMunicipios.filter(m => m.toLowerCase() !== "todo el departamento");
  const allSelected = filteredListaMunicipios.length > 0 && formData.municipiosBeneficiadosAvance?.length === filteredListaMunicipios.length;

  return (
    <div className="space-y-3 border-t pt-4 mt-4">
      <Label className="text-md font-medium leading-none">Municipios Beneficiados en este Avance</Label>
      <div className="max-h-48 overflow-y-auto space-y-2 pr-2 rounded-md border p-3">
        {filteredListaMunicipios.length > 0 && (
             <div className="flex items-center space-x-2 py-1 border-b">
                <Checkbox
                    id="select-all-municipios-avance"
                    checked={allSelected}
                    onCheckedChange={handleSelectAllMunicipiosChange}
                />
                <Label htmlFor="select-all-municipios-avance" className="font-medium text-sm">
                    Seleccionar Todos los Municipios (Excepto 'Todo el departamento')
                </Label>
            </div>
        )}
        {filteredListaMunicipios.map((municipioObj) => {
          const municipioNombre = typeof municipioObj === 'string' ? municipioObj : municipioObj.nombre;
          return (
            <div key={municipioNombre} className="flex items-center space-x-2">
              <Checkbox
                id={`avance-municipio-${municipioNombre.replace(/\s+/g, '-')}`}
                checked={formData.municipiosBeneficiadosAvance?.includes(municipioNombre) || false}
                onCheckedChange={(checked) => handleMunicipioChange(municipioNombre, checked)}
              />
              <Label htmlFor={`avance-municipio-${municipioNombre.replace(/\s+/g, '-')}`} className="font-normal text-sm">
                {municipioNombre}
              </Label>
            </div>
          );
        })}
         {filteredListaMunicipios.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-2">No hay municipios específicos configurados (además de 'Todo el departamento').</p>
        )}
      </div>
    </div>
  );
};

export default AvanceFormMunicipios;