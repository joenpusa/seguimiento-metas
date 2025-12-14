import { useState } from "react";
import { useDetallePlan } from "@/context/DetallePlanContext";
import EstructuraItem from "./estructura/EstructuraItem";
import ItemDialog from "./estructura/ItemDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const AdminEstructuraPlan = () => {
  const {
    tree,
    loadingDetalles,
    addDetalle,
    updateDetalle,
    deleteDetalle,
    getSiguienteCodigo,
  } = useDetallePlan();

  const [openDialog, setOpenDialog] = useState(false);
  const [editingNode, setEditingNode] = useState(null);
  const [parentNode, setParentNode] = useState(null);
  const [suggestedCode, setSuggestedCode] = useState("");

  const handleAdd = (parent = null) => {
    console.log("➡️ handleAdd", parent);

    setEditingNode(null);
    setParentNode(parent);

    const codigo = getSiguienteCodigo(parent?.id ?? null);
    console.log("➡️ código sugerido:", codigo);

    setSuggestedCode(codigo);
    setOpenDialog(true);
  };

  const handleEdit = (node) => {
    setEditingNode(node);
    setParentNode(null);
    setSuggestedCode(node.codigo);
    setOpenDialog(true);
  };

  const handleDelete = async (node) => {
    const ok = confirm(
      "¿Está seguro de eliminar este elemento? Se eliminarán todos sus hijos."
    );
    if (!ok) return;

    await deleteDetalle(node.id);
  };

  const handleSave = async ({ nombre, codigo }) => {
    if (editingNode) {
      await updateDetalle(editingNode.id, { nombre, codigo });
    } else {
      await addDetalle({
        nombre,
        codigo,
        idPadre: parentNode?.id ?? null,
      });
    }

    setOpenDialog(false);
    setEditingNode(null);
    setParentNode(null);
    setSuggestedCode("");
  };

  if (loadingDetalles) {
    return <p className="text-muted-foreground">Cargando estructura...</p>;
  }

  return (
    <div className="space-y-4">
      {/* HEADER */}
      <div className="flex justify-end">
        <Button onClick={() => handleAdd(null)} className="gap-2">
          <Plus size={16} />
          Nueva línea estratégica
        </Button>
      </div>

      {/* CONTENIDO */}
      {tree.length === 0 ? (
        <p className="text-muted-foreground italic">
          Este plan aún no tiene estructura definida
        </p>
      ) : (
        <div className="space-y-2">
          {tree.map((node) => (
            <EstructuraItem
              key={node.id}
              node={node}
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* ✅ MODAL SIEMPRE MONTADO */}
      <ItemDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        onSave={handleSave}
        isEditing={!!editingNode}
        initialData={editingNode}
        parentLabel={parentNode?.nombre}
        suggestedCode={suggestedCode}
      />
    </div>
  );
};

export default AdminEstructuraPlan;
