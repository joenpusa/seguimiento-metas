import { useState } from "react";
import { useDetallePlan } from "@/context/DetallePlanContext";
import { useMeta } from "@/context/MetaContext";

import EstructuraItem from "./estructura/EstructuraItem";
import ItemDialog from "./estructura/ItemDialog";
import MetaDialog from "./estructura/MetaDialog";

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

  const { createMeta, fetchMetasByDetalle } = useMeta();

  // ===============================
  // Estados estructura
  // ===============================
  const [openDialog, setOpenDialog] = useState(false);
  const [editingNode, setEditingNode] = useState(null);
  const [parentNode, setParentNode] = useState(null);
  const [suggestedCode, setSuggestedCode] = useState("");

  // ===============================
  // Estados metas
  // ===============================
  const [openMetaDialog, setOpenMetaDialog] = useState(false);
  const [currentIniciativa, setCurrentIniciativa] = useState(null);

  // ===============================
  // Agregar nodo o meta
  // ===============================
  const handleAdd = (parent, isIniciativa = false) => {
    // ➕ Agregar META a una iniciativa
    if (isIniciativa) {
      if (!parent?.id) {
        console.error("❌ Iniciativa inválida", parent);
        return;
      }

      setCurrentIniciativa(parent);
      setOpenMetaDialog(true);
      return;
    }

    // ➕ Agregar detalle normal
    setEditingNode(null);
    setParentNode(parent);
    setSuggestedCode(getSiguienteCodigo(parent?.id ?? null));
    setOpenDialog(true);
  };

  // ===============================
  // Guardar meta
  // ===============================
  const handleSaveMeta = async (data) => {
    if (!currentIniciativa?.id) {
      console.error("❌ No hay iniciativa seleccionada");
      return;
    }
    console.log("el detalle es: " + currentIniciativa.id);
    await createMeta({
      ...data,
      id_detalle: currentIniciativa.id, // 🔥 GARANTIZADO
    });

    await fetchMetasByDetalle(currentIniciativa.id);

    setOpenMetaDialog(false);
    setCurrentIniciativa(null);
  };

  // ===============================
  // Editar detalle
  // ===============================
  const handleEdit = (node) => {
    setEditingNode(node);
    setParentNode(null);
    setSuggestedCode(node.codigo);
    setOpenDialog(true);
  };

  // ===============================
  // Eliminar detalle
  // ===============================
  const handleDelete = async (node) => {
    const ok = confirm(
      "¿Está seguro de eliminar este elemento? Se eliminarán todos sus hijos."
    );
    if (!ok) return;

    await deleteDetalle(node.id);
  };

  // ===============================
  // Guardar detalle
  // ===============================
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

  // ===============================
  // Render
  // ===============================
  if (loadingDetalles) {
    return <p className="text-muted-foreground">Cargando estructura...</p>;
  }

  return (
    <div className="space-y-4 p-2 rounded-lg border bg-card text-card-foreground shadow-sm">
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

      {/* MODAL DETALLE */}
      <ItemDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        onSave={handleSave}
        isEditing={!!editingNode}
        initialData={editingNode}
        parentLabel={parentNode?.nombre}
        suggestedCode={suggestedCode}
      />

      {/* MODAL META */}
      <MetaDialog
        open={openMetaDialog}
        onOpenChange={setOpenMetaDialog}
        onSave={handleSaveMeta}
      />
    </div>
  );
};

export default AdminEstructuraPlan;
