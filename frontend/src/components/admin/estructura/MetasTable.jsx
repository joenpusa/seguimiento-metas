import { useMeta } from "@/context/MetaContext";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";
import MetaDialog from "./MetaDialog";

const MetasTable = ({ idDetalle }) => {
  const {
    metasByDetalle,
    fetchMetasByDetalle,
    loadingMetas,
    deleteMeta,
    updateMeta,
    fetchMetaById
  } = useMeta();

  const [editingMeta, setEditingMeta] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchMetasByDetalle(idDetalle);
  }, [idDetalle]);

  const metas = metasByDetalle[idDetalle] || [];

  const handleEdit = async (meta) => {
    try {
      // Cargar info completa (población, municipios, detalle presupuestal)
      // Usamos fetchMetaById del contexto pero necesitamos el valor retornado
      // Como fetchMetaById actualiza el estado selectedMeta, podemos usar una llamada directa a la API o modificar el contexto.
      // Modificaré el contexto para que fetchMetaById retorne los datos.

      // NOTA: Para no romper el contexto, haré que useMeta nos de una función directa o
      // simplemente usaré la función del contexto y esperaré a que selectedMeta cambie?
      // Mejor opción: Modificar MetaContext para que fetchMetaById devuelva la data. 
      // Por ahora, asumiré que voy a modificar MetaContext en el siguiente paso.
      const data = await fetchMetaById(meta.id);
      if (data) {
        setEditingMeta(data);
        setIsDialogOpen(true);
      }
    } catch (error) {
      console.error("Error loading meta details", error);
    }
  };

  const handleDelete = async (meta) => {
    if (confirm(`¿Estás seguro de eliminar la meta "${meta.nombre}"?`)) {
      await deleteMeta(meta.id, idDetalle);
    }
  };

  const handleSave = async (data) => {
    if (editingMeta) {
      const success = await updateMeta(editingMeta.id, data);
      if (success) {
        setIsDialogOpen(false);
        setEditingMeta(null);
      }
    }
  };

  if (loadingMetas) return null;
  if (!metas.length) return null;

  return (
    <>
      <div className="ml-8 mt-2 border rounded-md">
        <table className="w-full text-sm">
          <tbody>
            {metas.map((m) => {
              const total =
                (m.val1_pro || 0) +
                (m.val2_pro || 0) +
                (m.val3_pro || 0) +
                (m.val4_pro || 0) +
                (m.val1_sgp || 0) + (m.val2_sgp || 0) + (m.val3_sgp || 0) + (m.val4_sgp || 0) +
                (m.val1_reg || 0) + (m.val2_reg || 0) + (m.val3_reg || 0) + (m.val4_reg || 0) +
                (m.val1_cre || 0) + (m.val2_cre || 0) + (m.val3_cre || 0) + (m.val4_cre || 0) +
                (m.val1_mun || 0) + (m.val2_mun || 0) + (m.val3_mun || 0) + (m.val4_mun || 0) +
                (m.val1_otr || 0) + (m.val2_otr || 0) + (m.val3_otr || 0) + (m.val4_otr || 0);
              return (
                <tr key={m.id} className="border-t">
                  <td className="p-2"><strong>({m.codigo})</strong> {m.nombre}</td>
                  <td className="p-2 text-center">{m.cantidad} {m.unidad_nombre}</td>
                  <td className="p-2 text-center">
                    ${total.toLocaleString()}
                  </td>
                  <td className="p-2 text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEdit(m)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(m)}
                    >
                      <Trash className="h-4 w-4 text-destructive" />
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <MetaDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSave}
        metaEdit={editingMeta}
      />
    </>
  );
};

export default MetasTable;
