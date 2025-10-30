import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usePlan } from '@/context/PlanContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Save } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

const AdminUnidadesMedida = () => {
  const { listaUnidadesMedida, addUnidadMedida, removeUnidadMedida } = usePlan();
  const { toast } = useToast();

  const [openUnidadDialog, setOpenUnidadDialog] = useState(false);
  const [unidadName, setUnidadName] = useState('');

  const handleSaveUnidad = () => {
    if (!unidadName.trim()) {
      toast({ title: "Error", description: "El nombre de la unidad de medida no puede estar vacío.", variant: "destructive" });
      return;
    }
    if (addUnidadMedida(unidadName)) {
      setOpenUnidadDialog(false);
      setUnidadName('');
    }
  };

  const handleDeleteUnidad = (id) => {
    removeUnidadMedida(id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.2 }}
    >
      <Card>
        <CardHeader className="relative">
          <CardTitle>Unidades de Medida</CardTitle>
           <Button size="sm" className="gap-1 absolute top-4 right-4" onClick={() => setOpenUnidadDialog(true)}>
            <Plus size={16} /> Añadir Unidad
          </Button>
        </CardHeader>
        <CardContent className="max-h-[60vh] overflow-y-auto p-4 bg-gray-50 rounded-b-md">
          {listaUnidadesMedida.length > 0 ? (
            <ul className="space-y-2">
              {listaUnidadesMedida.map(unidad => (
                <li key={unidad.id} className="flex items-center justify-between p-2 border rounded-md bg-white shadow-sm text-sm">
                  <span>{unidad.nombre}</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600" onClick={() => handleDeleteUnidad(unidad.id)}>
                    <Trash2 size={14} />
                  </Button>
                </li>
              ))}
            </ul>
          ) : <p className="text-muted-foreground text-center py-4">No hay unidades de medida definidas.</p>}
        </CardContent>
      </Card>

      <Dialog open={openUnidadDialog} onOpenChange={setOpenUnidadDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Añadir Unidad de Medida</DialogTitle>
            <DialogDescription>Ingrese el nombre de la nueva unidad de medida.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="unidadName">Nombre de la Unidad</Label>
              <Input id="unidadName" value={unidadName} onChange={(e) => setUnidadName(e.target.value)} placeholder="Ej: Kilómetros, Porcentaje, Personas" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenUnidadDialog(false)}>Cancelar</Button>
            <Button onClick={handleSaveUnidad}><Save size={16} className="mr-2"/> Añadir Unidad</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default AdminUnidadesMedida;