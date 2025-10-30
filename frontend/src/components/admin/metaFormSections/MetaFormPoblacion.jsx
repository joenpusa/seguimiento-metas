import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';

const CATEGORIAS_EDAD = [
  "Niños y Niñas de 0-5",
  "Niños y Niñas de 6-12",
  "Adolescentes 13-17",
  "Jóvenes 18-24",
  "Adultos 25-62",
  "3ra Edad 65 y más"
];

const CONDICIONES_ESPECIALES = [
  "Mujer jefe de hogar",
  "En condición de Discapacidad",
  "Víctima",
  "Etnias",
  "Desmovilizado",
  "OSIGD - LGBTI",
  "Migrante",
  "Indigente / Habitante de la calle",
  "Privada de la libertad"
];

const MetaFormPoblacion = ({ open, onOpenChange, poblacionData, onSave }) => {
  const [selectedCategorias, setSelectedCategorias] = useState([]);
  const [selectedCondiciones, setSelectedCondiciones] = useState([]);

  useEffect(() => {
    if (poblacionData) {
      setSelectedCategorias(poblacionData.categoriasEdad || []);
      setSelectedCondiciones(poblacionData.condicionesEspeciales || []);
    } else {
      setSelectedCategorias([]);
      setSelectedCondiciones([]);
    }
  }, [poblacionData, open]);

  const handleCheckboxChange = (list, setList, item) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleSavePoblacion = () => {
    onSave({
      categoriasEdad: selectedCategorias,
      condicionesEspeciales: selectedCondiciones,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Detallar Población Beneficiada</DialogTitle>
          <DialogDescription>
            Seleccione las categorías de edad y condiciones especiales de la población objetivo.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-2">
          <div>
            <Label className="text-base font-medium">Categorías de Edad</Label>
            <div className="grid grid-cols-1 gap-2 mt-2">
              {CATEGORIAS_EDAD.map(cat => (
                <div key={cat} className="flex items-center space-x-2">
                  <Checkbox
                    id={`cat-${cat.replace(/\s/g, '')}`}
                    checked={selectedCategorias.includes(cat)}
                    onCheckedChange={() => handleCheckboxChange(selectedCategorias, setSelectedCategorias, cat)}
                  />
                  <Label htmlFor={`cat-${cat.replace(/\s/g, '')}`} className="text-sm font-normal">{cat}</Label>
                </div>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-base font-medium">Condiciones Especiales</Label>
             <div className="grid grid-cols-1 gap-2 mt-2">
              {CONDICIONES_ESPECIALES.map(cond => (
                <div key={cond} className="flex items-center space-x-2">
                  <Checkbox
                    id={`cond-${cond.replace(/\s/g, '')}`}
                    checked={selectedCondiciones.includes(cond)}
                    onCheckedChange={() => handleCheckboxChange(selectedCondiciones, setSelectedCondiciones, cond)}
                  />
                  <Label htmlFor={`cond-${cond.replace(/\s/g, '')}`} className="text-sm font-normal">{cond}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter className="mt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button type="button" onClick={handleSavePoblacion}>Guardar Población</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MetaFormPoblacion;