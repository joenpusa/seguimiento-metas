import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const MetaFormBasicFields = ({ formData, handleChange, handleSelectChange, handleMunicipioChange, listaMunicipios, listaResponsables, listaUnidadesMedida, metaToEdit }) => {
  
  const getSelectedMunicipiosText = () => {
    if (!formData.municipios || formData.municipios.length === 0) return "Seleccionar municipios";
    if (formData.municipios.length > 2) return `${formData.municipios.length} municipios seleccionados`;
    return formData.municipios.join(', ');
  };
  
  return (
    <>
      <div className="grid gap-2">
        <Label htmlFor="nombre">Nombre de la Meta</Label>
        <Input id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Nombre corto y descriptivo de la meta" />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="descripcion">Descripción Detallada</Label>
        <Textarea id="descripcion" name="descripcion" value={formData.descripcion} onChange={handleChange} placeholder="Describa en detalle la meta" rows={3} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="cantidad">Cantidad</Label>
          <Input id="cantidad" name="cantidad" type="number" value={formData.cantidad} onChange={handleChange} placeholder="Ej: 100" min="0" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="unidadMedida">Unidad de Medida</Label>
           <Select value={formData.unidadMedida} onValueChange={(value) => handleSelectChange('unidadMedida', value)}>
            <SelectTrigger id="unidadMedida"><SelectValue placeholder="Seleccionar Unidad" /></SelectTrigger>
            <SelectContent>
              {listaUnidadesMedida?.map(unidad => (
                <SelectItem key={unidad.id} value={unidad.nombre}>{unidad.nombre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
         <div className="grid gap-2">
          <Label htmlFor="responsable">Responsable</Label>
           <Select value={formData.responsable} onValueChange={(value) => handleSelectChange('responsable', value)}>
            <SelectTrigger id="responsable"><SelectValue placeholder="Seleccionar Responsable" /></SelectTrigger>
            <SelectContent>
              {listaResponsables?.map(resp => (
                <SelectItem key={resp.id} value={resp.nombre}>{resp.nombre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="fechaLimite">Fecha Límite</Label>
          <Input id="fechaLimite" name="fechaLimite" type="date" value={formData.fechaLimite} onChange={handleChange} />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="municipios">Municipios Beneficiados</Label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
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
                checked={formData.municipios?.includes(muni)}
                onCheckedChange={() => handleMunicipioChange(muni)}
                onSelect={(e) => e.preventDefault()} 
              >
                {muni}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {metaToEdit && (
        <div className="grid gap-2">
          <Label htmlFor="progreso">Progreso (%)</Label>
          <Input id="progreso" name="progreso" type="number" min="0" max="100" value={formData.progreso} onChange={handleChange} readOnly />
        </div>
      )}
    </>
  );
};

export default MetaFormBasicFields;