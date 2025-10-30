import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const categoriasEdadPoblacion = [
  { id: 'ninos_0_5', label: 'Niños y Niñas de 0-5' },
  { id: 'ninos_6_12', label: 'Niños y Niñas de 6-12' },
  { id: 'adolescentes_13_17', label: 'Adolescentes de 13-17' },
  { id: 'jovenes_18_24', label: 'Jóvenes de 18-24' },
  { id: 'adultos_25_62', label: 'Adultos de 25-62' },
  { id: 'adultos_mayores_65_mas', label: '3ra Edad de 65 y más' },
];

const condicionesEspecialesPoblacion = [
  { id: 'mujer_jefe_hogar', label: 'Mujer jefe de hogar' },
  { id: 'discapacidad', label: 'En condición de Discapacidad' },
  { id: 'victima', label: 'Víctima' },
  { id: 'etnias', label: 'Etnias' },
  { id: 'desmovilizado', label: 'Desmovilizado' },
  { id: 'osigd_lgbti', label: 'OSIGD - LGBTI' },
  { id: 'migrante', label: 'Migrante' },
  { id: 'indigente_habitante_calle', label: 'Indigente / Habitante de la calle' },
  { id: 'privada_libertad', label: 'Privada de la libertad' },
];

const AvanceFormPoblacionFields = ({ formData, setFormData }) => {

  const handlePoblacionCategoriaChange = (categoriaId, value) => {
    setFormData(prev => ({
      ...prev,
      poblacionBeneficiadaAvance: {
        ...(prev.poblacionBeneficiadaAvance || { cantidadesPorCategoria: {}, cantidadesPorCondicion: {} }),
        cantidadesPorCategoria: {
          ...(prev.poblacionBeneficiadaAvance?.cantidadesPorCategoria || {}),
          [categoriaId]: parseInt(value, 10) || 0
        }
      }
    }));
  };
  
  const handlePoblacionCondicionChange = (condicionId, value) => {
    setFormData(prev => ({
      ...prev,
      poblacionBeneficiadaAvance: {
        ...(prev.poblacionBeneficiadaAvance || { cantidadesPorCategoria: {}, cantidadesPorCondicion: {} }),
        cantidadesPorCondicion: {
          ...(prev.poblacionBeneficiadaAvance?.cantidadesPorCondicion || {}),
          [condicionId]: parseInt(value, 10) || 0
        }
      }
    }));
  };

  return (
    <div className="space-y-4 border-t pt-4 mt-4">
      <h4 className="text-md font-medium leading-none">Caracterización Población Beneficiada</h4>
      <p className="text-sm text-muted-foreground">
        (Asociada al Año: {formData.anioAvance || 'N/A'} y Trimestre: {formData.trimestreAvance || 'N/A'})
      </p>
      
      <div className="space-y-2">
        <Label className="text-sm">Cantidades por Categoría de Edad:</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
          {categoriasEdadPoblacion.map((categoria) => (
            <div key={categoria.id} className="grid grid-cols-2 items-center gap-2">
              <Label htmlFor={`pob-edad-${categoria.id}`} className="font-normal text-xs whitespace-nowrap">
                {categoria.label}
              </Label>
              <Input
                type="number"
                id={`pob-edad-${categoria.id}`}
                min="0"
                value={formData.poblacionBeneficiadaAvance?.cantidadesPorCategoria?.[categoria.id] || 0}
                onChange={(e) => handlePoblacionCategoriaChange(categoria.id, e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm">Cantidades por Condición Especial:</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
          {condicionesEspecialesPoblacion.map((condicion) => (
            <div key={condicion.id} className="grid grid-cols-2 items-center gap-2">
              <Label htmlFor={`pob-cond-${condicion.id}`} className="font-normal text-xs whitespace-nowrap">
                {condicion.label}
              </Label>
               <Input
                type="number"
                id={`pob-cond-${condicion.id}`}
                min="0"
                value={formData.poblacionBeneficiadaAvance?.cantidadesPorCondicion?.[condicion.id] || 0}
                onChange={(e) => handlePoblacionCondicionChange(condicion.id, e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AvanceFormPoblacionFields;