import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Save } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const ItemDialog = ({ open, onOpenChange, onSave, itemType, initialName = '', isEditing }) => {
  const [name, setName] = useState(initialName);
  const { toast } = useToast();

  useEffect(() => {
    setName(initialName);
  }, [initialName, open]);

  const handleSubmit = () => {
    if (!name.trim()) {
      toast({ title: "Error", description: "El nombre no puede estar vacío.", variant: "destructive" });
      return;
    }
    onSave(name);
  };
  
  const getItemTypeDisplayName = () => {
    if (!itemType) return 'Elemento';
    switch(itemType) {
        case 'lineaEstrategica': return 'Línea Estratégica';
        case 'componente': return 'Componente';
        case 'apuesta': return 'Apuesta';
        case 'iniciativa': return 'Iniciativa';
        default: return itemType.charAt(0).toUpperCase() + itemType.slice(1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar' : 'Añadir'} {getItemTypeDisplayName()}</DialogTitle>
          <DialogDescription>
            Ingrese el nombre para {isEditing ? 'actualizar el' : 'el nuevo'} {getItemTypeDisplayName().toLowerCase()}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="itemName">Nombre</Label>
            <Input 
              id="itemName" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder={`Nombre de ${getItemTypeDisplayName().toLowerCase()}`} 
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit}><Save size={16} className="mr-2"/> {isEditing ? 'Guardar Cambios' : 'Añadir'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ItemDialog;