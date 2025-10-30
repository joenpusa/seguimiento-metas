import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

const MetaFormMunicipios = ({ formData, setFormData, listaMunicipios }) => {
  const handleMunicipioChange = (municipioNombre) => {
    setFormData(prev => {
      let newMunicipios;
      if (municipioNombre === "Todo el departamento") {
        newMunicipios = prev.municipios.includes("Todo el departamento") ? [] : ["Todo el departamento"];
      } else {
        if (prev.municipios.includes("Todo el departamento")) {
          newMunicipios = [municipioNombre];
        } else {
          newMunicipios = prev.municipios.includes(municipioNombre)
            ? prev.municipios.filter(m => m !== municipioNombre)
            : [...prev.municipios, municipioNombre];
        }
      }
      return { ...prev, municipios: newMunicipios };
    });
  };

  const getSelectedMunicipiosText = () => {
    if (formData.municipios.length === 0) return "Seleccionar municipios";
    if (formData.municipios.includes("Todo el departamento")) return "Todo el departamento";
    if (formData.municipios.length > 2) return `${formData.municipios.length} municipios seleccionados`;
    return formData.municipios.join(', ');
  };

  return (
    <div>
      <Label htmlFor="municipios">Municipios Beneficiados</Label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between mt-1">
            {getSelectedMunicipiosText()}
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
          <DropdownMenuLabel>Seleccionar Municipios</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {listaMunicipios?.map(muni => (
            <DropdownMenuCheckboxItem
              key={muni}
              checked={formData.municipios.includes(muni)}
              onCheckedChange={() => handleMunicipioChange(muni)}
              onSelect={(e) => e.preventDefault()} 
              disabled={formData.municipios.includes("Todo el departamento") && muni !== "Todo el departamento"}
            >
              {muni}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default MetaFormMunicipios;