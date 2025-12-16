import { useMeta } from "@/context/MetaContext";
import { useEffect } from "react";

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
        <thead className="bg-muted">
          <tr>
            <th className="p-2 text-left">Meta</th>
            <th className="p-2 text-center">Cantidad</th>
            <th className="p-2 text-center">Unidad</th>
            <th className="p-2 text-right">Valor</th>
          </tr>
        </thead>
        <tbody>
          {metas.map((m) => (
            <tr key={m.id} className="border-t">
              <td className="p-2">{m.nombre}</td>
              <td className="p-2 text-center">{m.cantidad}</td>
              <td className="p-2 text-center">{m.unidad_nombre}</td>
              <td className="p-2 text-right">
                ${Number(m.valor).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MetasTable;
