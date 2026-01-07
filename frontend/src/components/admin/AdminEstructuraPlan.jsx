import { useState } from "react";
import { useDetallePlan } from "@/context/DetallePlanContext";
import { useMeta } from "@/context/MetaContext";

import EstructuraItem from "./estructura/EstructuraItem";
import ItemDialog from "./estructura/ItemDialog";
import MetaDialog from "./estructura/MetaDialog";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const NEXT_TIPO = {
  linea: "componente",
  componente: "apuesta",
  apuesta: "iniciativa",
};

const AdminEstructuraPlan = () => {
  const {
    tree,
    loadingDetalles,
    addDetalle,
    updateDetalle,
    deleteDetalle,
  } = useDetallePlan();

  const { createMeta, fetchMetasByDetalle } = useMeta();

  const [openDialog, setOpenDialog] = useState(false);
  const [editingNode, setEditingNode] = useState(null);
  const [parentNode, setParentNode] = useState(null);
  const [currentTipo, setCurrentTipo] = useState(null);
  const [collapsed, setCollapsed] = useState(new Set());

  const [openMetaDialog, setOpenMetaDialog] = useState(false);
  const [currentIniciativa, setCurrentIniciativa] = useState(null);

  const handleAdd = (parent) => {
    if (parent?.tipo === "iniciativa") {
      setCurrentIniciativa(parent);
      setOpenMetaDialog(true);
      return;
    }

    const tipo = parent ? NEXT_TIPO[parent.tipo] : "linea";

    if (!tipo) {
      console.error("❌FT: Tipo inválido para agregar hijo", parent);
      return;
    }

    setEditingNode(null);
    setParentNode(parent ?? null);
    setCurrentTipo(tipo);
    setOpenDialog(true);
  };

  const handleSave = async ({ nombre, codigo, tipo }) => {
    if (!tipo) {
      console.error("Intento de guardar sin tipo");
      return;
    }

    if (editingNode) {
      await updateDetalle(editingNode.id, { nombre, codigo });
    } else {
      await addDetalle({
        nombre,
        codigo,
        idPadre: parentNode?.id ?? null,
        tipo,
      });
    }

    setOpenDialog(false);
    setEditingNode(null);
    setParentNode(null);
    setCurrentTipo(null);
  };

  const handleEdit = (node, parent) => {
    setEditingNode(node);
    setParentNode(parent);
    setCurrentTipo(node.tipo);
    setOpenDialog(true);
  };

  const handleDelete = async (node) => {
    if (!confirm("¿Eliminar este elemento?")) return;
    await deleteDetalle(node.id);
  };

  const toggleCollapse = (id) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (loadingDetalles) {
    return <p className="text-muted-foreground">Cargando estructura...</p>;
  }

  return (
    <div className="space-y-4 p-2 rounded-lg border bg-card shadow-sm">
      <div className="flex justify-end">
        <Button onClick={() => handleAdd(null)} className="gap-2">
          <Plus size={16} />
          Nueva línea estratégica
        </Button>
      </div>

      {tree.length === 0 ? (
        <p className="text-muted-foreground italic">
          Este plan aún no tiene estructura definida
        </p>
      ) : (
        <div className="space-y-2">
          {tree.map(node => (
            <EstructuraItem
              key={node.id}
              node={node}
              collapsed={collapsed}
              onToggle={toggleCollapse}
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <ItemDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        onSave={handleSave}
        isEditing={!!editingNode}
        initialData={editingNode}
        parentNode={parentNode}
        tipo={currentTipo}
      />

      <MetaDialog
        open={openMetaDialog}
        onOpenChange={setOpenMetaDialog}
        onSave={async (data) => {
          const success = await createMeta({
            ...data,
            id_detalle: currentIniciativa.id,
          });
          if (success) {
            await fetchMetasByDetalle(currentIniciativa.id);
            setOpenMetaDialog(false);
            setCurrentIniciativa(null);
          }
        }}
      />
    </div>
  );
};

export default AdminEstructuraPlan;
