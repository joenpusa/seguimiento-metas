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

const AdminMunicipios = () => {
  const { listaMunicipios, addMunicipio, removeMunicipio } = usePlan();
  const { toast } = useToast();

  const [openMunicipioDialog, setOpenMunicipioDialog] = useState(false);
  const [municipioName, setMunicipioName] = useState('');

  const handleSaveMunicipio = () => {
    if (!municipioName.trim()) {
      toast({ title: "Error", description: "El nombre del municipio no puede estar vacío.", variant: "destructive" });
      return;
    }
    if (municipioName.trim().toLowerCase() === "todo el departamento") {
      toast({ title: "Error", description: "No puede añadir 'Todo el departamento' manualmente.", variant: "destructive" });
      return;
    }
    if (addMunicipio(municipioName)) {
      setOpenMunicipioDialog(false);
      setMunicipioName('');
    }
  };

  const handleDeleteMunicipio = (nombre) => {
    if (nombre.toLowerCase() === "todo el departamento") {
      toast({ title: "Acción no permitida", description: "'Todo el departamento' no se puede eliminar.", variant: "destructive" });
      return;
    }
    removeMunicipio(nombre);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.2 }}
    >
      <Card>
        <CardHeader className="relative">
          <CardTitle>Municipios</CardTitle>
           <Button size="sm" className="gap-1 absolute top-4 right-4" onClick={() => setOpenMunicipioDialog(true)}>
            <Plus size={16} /> Añadir Municipio
          </Button>
        </CardHeader>
        <CardContent className="max-h-[60vh] overflow-y-auto p-4 bg-gray-50 rounded-b-md">
          {listaMunicipios.length > 0 ? (
            <ul className="space-y-2">
              {listaMunicipios.map(muni => (
                <li key={muni} className="flex items-center justify-between p-2 border rounded-md bg-white shadow-sm text-sm">
                  <span>{muni}</span>
                  {(muni.toLowerCase() !== "todo el departamento") && (
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600" onClick={() => handleDeleteMunicipio(muni)}>
                      <Trash2 size={14} />
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          ) : <p className="text-muted-foreground text-center py-4">No hay municipios definidos.</p>}
        </CardContent>
      </Card>

      <Dialog open={openMunicipioDialog} onOpenChange={setOpenMunicipioDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Añadir Municipio</DialogTitle>
            <DialogDescription>Ingrese el nombre del nuevo municipio.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="municipioName">Nombre del Municipio</Label>
              <Input id="municipioName" value={municipioName} onChange={(e) => setMunicipioName(e.target.value)} placeholder="Ej: Nuevo Paraíso" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenMunicipioDialog(false)}>Cancelar</Button>
            <Button onClick={handleSaveMunicipio}><Save size={16} className="mr-2"/> Añadir Municipio</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default AdminMunicipios;