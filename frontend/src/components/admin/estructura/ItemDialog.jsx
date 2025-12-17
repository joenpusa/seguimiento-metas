import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
  parentNode,
  tipo
}) => {
  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");

  useEffect(() => {
    if (open) {
      if (isEditing && initialData) {
        setNombre(initialData.nombre);
        setCodigo(initialData.codigo);
      } else {
        setNombre("");
        setCodigo("");
      }
    }
  }, [open, isEditing, initialData]);

  const tipoLabel = {
    linea: "Línea estratégica",
    componente: "Componente",
    apuesta: "Apuesta",
    iniciativa: "Iniciativa",
  }[tipo] || "";

  const isCodigoValido = (codigo, parent) => {
    if (!parent) return !codigo.includes(".");
    return codigo.startsWith(parent.codigo + ".");
  };

  const handleSubmit = () => {
    if (!nombre.trim() || !codigo.trim()) return;

    if (!isCodigoValido(codigo, parentNode)) {
      alert(
        parentNode
          ? `El código debe iniciar con "${parentNode.codigo}."`
          : "Una línea estratégica no debe contener puntos"
      );
      return;
    }

    onSave({ nombre, codigo, tipo });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar elemento" : "Nuevo elemento"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          <Label>Tipo</Label>
          <Input value={tipoLabel} disabled />
        </div>

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
