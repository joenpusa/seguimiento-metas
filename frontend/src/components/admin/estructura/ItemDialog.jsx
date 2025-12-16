import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ItemDialog = ({
  open,
  onOpenChange,
  onSave,
  isEditing,
  initialData,
  parentLabel,
  suggestedCode,
}) => {
  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");

  useEffect(() => {
    if (isEditing && initialData) {
      setNombre(initialData.nombre);
      setCodigo(initialData.codigo);
    } else {
      setNombre("");
      setCodigo(suggestedCode || "");
    }
  }, [isEditing, initialData, suggestedCode]);

  const handleSubmit = () => {
    if (!nombre.trim()) return;
    if (!codigo.trim()) return;

    onSave({ nombre, codigo });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar elemento" : "Nuevo elemento"}
          </DialogTitle>
          <DialogDescription>
            {parentLabel
              ? `Pertenece a: ${parentLabel}`
              : "Elemento de nivel raíz"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Código</Label>
            <Input
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Ej: 1.2.3"
            />
          </div>

          <div className="space-y-2">
            <Label>Nombre</Label>
            <Input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre del elemento"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>
            {isEditing ? "Guardar cambios" : "Crear"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ItemDialog;
