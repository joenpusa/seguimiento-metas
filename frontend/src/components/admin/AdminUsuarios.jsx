import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useSecretaria } from "@/context/SecretariaContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { PlusCircle, Edit2, Trash2, ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

const ROLES_USUARIO = [
  { id: "admin", nombre: "Administrador" },
  { id: "responsable", nombre: "Responsable" },
  { id: "consultor", nombre: "Consultor" },
];

const AdminUsuarios = () => {
  const { toast } = useToast();

  const {
    _users: usersList = [],
    usersLoading,
    createUserContext,
    updateUserContext,
    deleteUserContext,
  } = useAuth();

  const { listaResponsables } = useSecretaria();

  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [userData, setUserData] = useState({
    id: null,
    email: "",
    nombre: "",
    rol: "responsable",
    id_secretaria: "",
  });

  const openNewUser = () => {
    setUserData({
      id: null,
      email: "",
      nombre: "",
      rol: "responsable",
      id_secretaria: "",
    });
    setIsEditing(false);
    setOpenDialog(true);
  };

  const openEditUser = (u) => {
    setUserData({
      id: u.id,
      email: u.email,
      nombre: u.nombre,
      rol: u.rol,
      id_secretaria: u.id_secretaria,
    });
    setIsEditing(true);
    setOpenDialog(true);
  };

  const saveUser = async () => {
    if (
      !userData.email ||
      !userData.nombre ||
      !userData.id_secretaria
    ) {
      toast({
        title: "Error",
        description: "Todos los campos son obligatorios",
        variant: "destructive",
      });
      return;
    }

    if (isEditing) {
      await updateUserContext(userData.id, userData);
    } else {
      await createUserContext(userData);
    }

    setOpenDialog(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card>
        <CardHeader className="flex flex-row justify-between">
          <div>
            <CardTitle>Gestión de Usuarios</CardTitle>
            <CardDescription>
              Administración de usuarios del sistema
            </CardDescription>
          </div>
          <Button size="sm" onClick={openNewUser}>
            <PlusCircle size={16} className="mr-1" /> Nuevo Usuario
          </Button>
        </CardHeader>

        <CardContent className="bg-slate-50 max-h-[70vh] overflow-y-auto">
          {usersLoading && (
            <p className="text-center text-muted-foreground">
              Cargando usuarios...
            </p>
          )}

          {!usersLoading && usersList.length === 0 && (
            <p className="text-center text-muted-foreground">
              No hay usuarios registrados.
            </p>
          )}

          {!usersLoading && usersList.length > 0 && (
            <ul className="space-y-2">
              {usersList.map((u) => (
                <li
                  key={u.id}
                  className="p-3 border rounded bg-white flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold">{u.nombre}</p>
                    <p className="text-xs text-muted-foreground">
                      {u.email}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditUser(u)}
                    >
                      <Edit2 size={12} />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteUserContext(u.id)}
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar Usuario" : "Crear Usuario"}
            </DialogTitle>
            <DialogDescription>
              Complete los datos del usuario
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Label>Nombre</Label>
            <Input
              value={userData.nombre}
              onChange={(e) =>
                setUserData({
                  ...userData,
                  nombre: e.target.value,
                })
              }
            />

            <Label>Email</Label>
            <Input
              value={userData.email}
              disabled={isEditing}
              onChange={(e) =>
                setUserData({
                  ...userData,
                  email: e.target.value,
                })
              }
            />

            <Label>Rol</Label>
            <Select
              value={userData.rol}
              onValueChange={(v) =>
                setUserData({ ...userData, rol: v })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES_USUARIO.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Label>Secretaría</Label>
            <Select
              value={String(userData.id_secretaria)}
              onValueChange={(v) =>
                setUserData({
                  ...userData,
                  id_secretaria: Number(v),
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione una secretaría" />
              </SelectTrigger>
              <SelectContent>
                {listaResponsables.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenDialog(false)}
            >
              Cancelar
            </Button>
            <Button onClick={saveUser}>
              <ShieldCheck size={16} className="mr-1" />
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default AdminUsuarios;
