import { useMeta } from "@/context/MetaContext";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";

const MetasTable = ({ idDetalle }) => {
  const { metasByDetalle, fetchMetasByDetalle, loadingMetas } = useMeta();

  useEffect(() => {
    fetchMetasByDetalle(idDetalle);
  }, [idDetalle]);

  const metas = metasByDetalle[idDetalle] || [];
  
  if (loadingMetas) return null;
  if (!metas.length) return null;

  return (
    <div className="ml-8 mt-2 border rounded-md">
      <table className="w-full text-sm">
        {/* <thead className="bg-muted">
          <tr>
            <th className="p-2 text-left">Meta</th>
            <th className="p-2 text-center">Cantidad</th>
            <th className="p-2 text-center">Unidad</th>
            <th className="p-2 text-center">Valor</th>
            <th className="p-2 text-right"></th>
          </tr>
        </thead> */}
        <tbody>
          {metas.map((m) => {

            const total =
                (m.valor || 0) +
                (m.valor2 || 0) +
                (m.valor3 || 0) +
                (m.valor4 || 0);
            return (
              <tr key={m.id_meta} className="border-t">
                <td className="p-2"><strong>({m.codigo})</strong> {m.nombre}</td>
                <td className="p-2 text-center">{m.cantidad} {m.unidad_nombre}</td>
                {/* <td className="p-2 text-center"></td> */}
                <td className="p-2 text-center">
                  ${total.toLocaleString()}
                </td>
                <td className="p-2 text-right">
                  <Button
                    size="icon"
                    variant="ghost"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
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
  );
};

export default MetasTable;
