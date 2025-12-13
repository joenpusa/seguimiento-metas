import React, { useState } from "react";
import { motion } from "framer-motion";
import { useSecretaria } from "@/context/SecretariaContext";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Save, Edit2, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

const AdminResponsables = () => {
  const {
    listaResponsables,
    addResponsable,
    removeResponsable,
    updateResponsableContext,
    loadingSecretarias,
  } = useSecretaria();

  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [data, setData] = useState({ id: null, nombre: "", esActivo: 1 });

  // ===============================
  // DIALOG
  // ===============================
  const openDialog = (r = null) => {
    if (r) {
      setData({ ...r });
      setIsEditing(true);
    } else {
      setData({ id: null, nombre: "", esActivo: 1 });
      setIsEditing(false);
    }
    setOpen(true);
  };

  // ===============================
  // SAVE
  // ===============================
  const save = async () => {
    if (!data.nombre.trim()) {
      toast({
        title: "Error",
        description: "El nombre es obligatorio",
        variant: "destructive",
      });
      return;
    }

    let ok = false;

    if (isEditing) {
      ok = await updateResponsableContext(data.id, data);
    } else {
      ok = await addResponsable(data.nombre);
    }

    if (ok) {
      toast({
        title: isEditing ? "Actualizada" : "Creada",
        description: isEditing
          ? "Secretaría actualizada"
          : "Secretaría creada",
      });
      setOpen(false);
    }
  };

  // ===============================
  // RENDER
  // ===============================
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Secretarías / Responsables</CardTitle>
          <Button size="sm" onClick={() => openDialog()}>
            <Plus size={16} className="mr-1" /> Nueva
          </Button>
        </CardHeader>

        <CardContent className="space-y-2">
          {loadingSecretarias && (
            <p className="text-muted-foreground text-center">
              Cargando secretarías...
            </p>
          )}

          {!loadingSecretarias && listaResponsables.length === 0 && (
            <p className="text-muted-foreground text-center">
              No hay secretarías registradas
            </p>
          )}

          {!loadingSecretarias &&
            listaResponsables.map((r) => (
              <div
                key={r.id}
                className="flex justify-between items-center p-3 bg-white border rounded-md"
              >
                <div>
                  <p className="font-medium">{r.nombre}</p>
                  <p
                    className={`text-xs ${
                      r.esActivo ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {r.esActivo ? "Activa" : "Inactiva"}
                  </p>
                </div>

                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => openDialog(r)}
                  >
                    <Edit2 size={14} />
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-red-500"
                    onClick={() => removeResponsable(r.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
        </CardContent>
      </Card>

      {/* ===============================
          DIALOG
         =============================== */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar Secretaría" : "Nueva Secretaría"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Nombre</Label>
              <Input
                value={data.nombre}
                onChange={(e) =>
                  setData((p) => ({ ...p, nombre: e.target.value }))
                }
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={data.esActivo === 1}
                onChange={(e) =>
                  setData((p) => ({
                    ...p,
                    esActivo: e.target.checked ? 1 : 0,
                  }))
                }
              />
              <Label>Secretaría activa</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={save}>
              <Save size={16} className="mr-1" /> Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default AdminResponsables;
