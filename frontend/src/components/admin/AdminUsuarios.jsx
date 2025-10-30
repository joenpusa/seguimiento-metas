import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle, Edit2, KeyRound, Trash2, ShieldCheck, UserCog } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

const ROLES_USUARIO = [
  { id: 'admin', nombre: 'Administrador' },
  { id: 'responsable', nombre: 'Responsable de Meta' },
  { id: 'consultor', nombre: 'Consultor (Solo Lectura)' }, 
];

const AdminUsuarios = () => {
  const { 
    _users: usersList, 
    _setUsers: setUsersList, 
    createUserContext, 
    resetPasswordContext, 
    updateUserRoleContext,
    deleteUserContext,
    loading 
  } = useAuth();
  const { toast } = useToast();

  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [userData, setUserData] = useState({ id: null, email: '', nombre: '', rol: 'responsable' });
  const [isEditing, setIsEditing] = useState(false);
  
  const handleOpenDialog = (user = null) => {
    if (user) {
      setUserData({ id: user.id, email: user.email, nombre: user.nombre || '', rol: user.rol });
      setIsEditing(true);
    } else {
      setUserData({ id: null, email: '', nombre: '', rol: 'responsable' });
      setIsEditing(false);
    }
    setOpenUserDialog(true);
  };

  const handleSaveUser = () => {
    if (!userData.email.trim() || !userData.nombre.trim()) {
      toast({ title: "Error", description: "El email y el nombre del usuario son obligatorios.", variant: "destructive" });
      return;
    }
    if (!/\S+@\S+\.\S+/.test(userData.email)) {
      toast({ title: "Error", description: "Por favor, ingrese un email válido.", variant: "destructive" });
      return;
    }

    if (isEditing) {
      updateUserRoleContext(userData.id, userData.rol); 
      
      setUsersList(prev => prev.map(u => u.id === userData.id ? {...u, ...userData} : u));
      toast({title: "Usuario Actualizado", description: `Datos de ${userData.email} actualizados.`});

    } else {
      createUserContext(userData.email, userData.nombre, userData.rol);
    }
    setOpenUserDialog(false);
  };

  const handleResetPassword = (userId) => {
    resetPasswordContext(userId);
  };
  
  const handleDeleteUser = (userId) => {
    deleteUserContext(userId);
  };


  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.3 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Gestión de Usuarios</CardTitle>
            <CardDescription>Crear, editar y administrar roles de usuarios del sistema.</CardDescription>
          </div>
          <Button size="sm" className="gap-1" onClick={() => handleOpenDialog()}>
            <PlusCircle size={16} /> Nuevo Usuario
          </Button>
        </CardHeader>
        <CardContent className="max-h-[70vh] overflow-y-auto p-4 bg-slate-50 rounded-b-md">
          {loading && <p className="text-center text-muted-foreground">Actualizando...</p>}
          {!loading && usersList.length > 0 ? (
            <ul className="space-y-3">
              {usersList.map(user => (
                <li key={user.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border rounded-md bg-white shadow-sm text-sm gap-2">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800">{user.nombre || 'Nombre no especificado'}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    <p className="text-xs mt-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        user.rol === 'admin' ? 'bg-red-100 text-red-700' : 
                        user.rol === 'responsable' ? 'bg-sky-100 text-sky-700' : 
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {ROLES_USUARIO.find(r => r.id === user.rol)?.nombre || user.rol}
                      </span>
                    </p>
                  </div>
                  <div className="flex gap-1 flex-wrap mt-2 sm:mt-0">
                    <Button variant="outline" size="sm" className="h-8 gap-1 text-xs" onClick={() => handleOpenDialog(user)}>
                      <Edit2 size={12} /> Editar
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 gap-1 text-xs" onClick={() => handleResetPassword(user.id)} disabled={user.rol === 'admin'}>
                      <KeyRound size={12} /> Rest. Clave
                    </Button>
                     <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="h-8 gap-1 text-xs" disabled={user.rol === 'admin'}>
                            <Trash2 size={12}/> Eliminar
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Confirmar Eliminación</DialogTitle>
                          <DialogDescription>
                            ¿Está seguro que desea eliminar al usuario {user.email}? Esta acción no se puede deshacer.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
                          <Button variant="destructive" onClick={() => handleDeleteUser(user.id)}>Sí, Eliminar</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </li>
              ))}
            </ul>
          ) : !loading && <p className="text-muted-foreground text-center py-6">No hay usuarios definidos.</p>}
        </CardContent>
      </Card>

      <Dialog open={openUserDialog} onOpenChange={setOpenUserDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Modifique los datos del usuario.' : 'Ingrese los datos del nuevo usuario. La contraseña se generará automáticamente.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="userName">Nombre Completo</Label>
              <Input 
                id="userName" 
                value={userData.nombre} 
                onChange={(e) => setUserData(prev => ({ ...prev, nombre: e.target.value }))} 
                placeholder="Ej: Juan Pérez" 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="userEmail">Correo Electrónico</Label>
              <Input 
                id="userEmail" 
                type="email" 
                value={userData.email} 
                onChange={(e) => setUserData(prev => ({ ...prev, email: e.target.value }))} 
                placeholder="usuario@ejemplo.com" 
                disabled={isEditing}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="userRole">Rol del Usuario</Label>
              <Select 
                value={userData.rol} 
                onValueChange={(value) => setUserData(prev => ({ ...prev, rol: value }))}
                disabled={isEditing && userData.rol === 'admin'}
              >
                <SelectTrigger id="userRole">
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES_USUARIO.map(role => (
                    <SelectItem key={role.id} value={role.id} disabled={isEditing && userData.rol === 'admin' && role.id !== 'admin'}>
                      {role.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isEditing && userData.rol === 'admin' && 
                <p className="text-xs text-muted-foreground">El rol del administrador principal no puede ser modificado.</p>
              }
            </div>
            {!isEditing && 
              <p className="text-sm text-muted-foreground bg-slate-100 p-2 rounded-md">
                <KeyRound size={14} className="inline mr-1" /> La contraseña inicial se generará aleatoriamente y el usuario deberá cambiarla.
              </p>
            }
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenUserDialog(false)}>Cancelar</Button>
            <Button onClick={handleSaveUser} disabled={loading}><ShieldCheck size={16} className="mr-2"/> {isEditing ? 'Guardar Cambios' : 'Crear Usuario'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default AdminUsuarios;