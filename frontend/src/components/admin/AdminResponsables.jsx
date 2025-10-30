import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usePlan } from '@/context/PlanContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Save, Edit2, UserPlus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

const AdminResponsables = () => {
  const { listaResponsables, addResponsable, removeResponsable, updateResponsableContext } = usePlan();
  const { toast } = useToast();

  const [openResponsableDialog, setOpenResponsableDialog] = useState(false);
  const [responsableData, setResponsableData] = useState({ id: null, nombre: '', emailUsuario: '' });
  const [isEditing, setIsEditing] = useState(false);

  const handleOpenDialog = (responsable = null) => {
    if (responsable) {
      setResponsableData({ 
        id: responsable.id, 
        nombre: responsable.nombre, 
        emailUsuario: responsable.emailUsuario || '' 
      });
      setIsEditing(true);
    } else {
      setResponsableData({ id: null, nombre: '', emailUsuario: '' });
      setIsEditing(false);
    }
    setOpenResponsableDialog(true);
  };

  const handleSaveResponsable = () => {
    if (!responsableData.nombre.trim()) {
      toast({ title: "Error", description: "El nombre del responsable no puede estar vacío.", variant: "destructive" });
      return;
    }
    
    // Aquí iría la lógica para validar el email si es necesario con Supabase.
    // Por ahora, solo lo guardamos.

    if (isEditing) {
      if (updateResponsableContext(responsableData.id, responsableData)) {
         toast({ title: "Responsable Actualizado", description: `"${responsableData.nombre}" ha sido actualizado.` });
      }
    } else {
      if (addResponsable(responsableData.nombre, responsableData.emailUsuario)) {
         toast({ title: "Responsable Añadido", description: `"${responsableData.nombre}" ha sido añadido.` });
      }
    }
    setOpenResponsableDialog(false);
  };

  const handleDeleteResponsable = (id) => {
    removeResponsable(id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.2 }}
    >
      <Card>
        <CardHeader className="relative">
          <CardTitle>Responsables y Usuarios Asociados</CardTitle>
           <Button size="sm" className="gap-1 absolute top-4 right-4" onClick={() => handleOpenDialog()}>
            <UserPlus size={16} /> Añadir Responsable
          </Button>
        </CardHeader>
        <CardContent className="max-h-[60vh] overflow-y-auto p-4 bg-gray-50 rounded-b-md">
          {listaResponsables.length > 0 ? (
            <ul className="space-y-2">
              {listaResponsables.map(resp => (
                <li key={resp.id} className="flex items-center justify-between p-3 border rounded-md bg-white shadow-sm text-sm">
                  <div>
                    <span className="font-medium">{resp.nombre}</span>
                    {resp.emailUsuario && <p className="text-xs text-muted-foreground">Usuario: {resp.emailUsuario}</p>}
                    {!resp.emailUsuario && <p className="text-xs text-orange-500">Usuario no asignado</p>}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-500 hover:text-blue-600" onClick={() => handleOpenDialog(resp)}>
                      <Edit2 size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600" onClick={() => handleDeleteResponsable(resp.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : <p className="text-muted-foreground text-center py-4">No hay responsables definidos.</p>}
        </CardContent>
      </Card>

      <Dialog open={openResponsableDialog} onOpenChange={setOpenResponsableDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Responsable' : 'Añadir Responsable'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Modifique los datos del responsable.' : 'Ingrese los datos del nuevo responsable y su email de usuario (si aplica).'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="responsableName">Nombre del Responsable</Label>
              <Input 
                id="responsableName" 
                value={responsableData.nombre} 
                onChange={(e) => setResponsableData(prev => ({ ...prev, nombre: e.target.value }))} 
                placeholder="Ej: Secretaría de Planeación" 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="emailUsuario">Email del Usuario Asociado (Opcional)</Label>
              <Input 
                id="emailUsuario" 
                type="email"
                value={responsableData.emailUsuario} 
                onChange={(e) => setResponsableData(prev => ({ ...prev, emailUsuario: e.target.value }))} 
                placeholder="usuario@example.com" 
              />
              <p className="text-xs text-muted-foreground">
                Este email se usará para el inicio de sesión del responsable (requiere integración con Supabase).
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenResponsableDialog(false)}>Cancelar</Button>
            <Button onClick={handleSaveResponsable}><Save size={16} className="mr-2"/> {isEditing ? 'Guardar Cambios' : 'Añadir Responsable'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default AdminResponsables;