import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Edit } from 'lucide-react';

const MetasSection = ({ metas, iniciativaPath, iniciativaNombre, onOpenMetaDialog, onDeleteMeta }) => {
  if (!metas || metas.length === 0) {
    return <p className="text-xs text-muted-foreground py-1">No hay metas para esta iniciativa.</p>;
  }

  return (
    <ul className="space-y-1 mt-1">
      {metas.map(meta => (
        <li key={meta.idMeta} className="text-xs p-1.5 border-dashed border rounded-md bg-indigo-50 flex justify-between items-center">
          <div>
            <span className="font-medium">{meta.numeroMetaManual ? `(${meta.numeroMetaManual}) ` : ''}{meta.nombreMeta}</span>
            <span className="text-muted-foreground ml-1">({meta.cantidad} {meta.unidadMedida})</span>
          </div>
          <div className="space-x-1">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onOpenMetaDialog(iniciativaPath, iniciativaNombre, meta)}>
              <Edit size={12} />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-600" onClick={() => onDeleteMeta(iniciativaPath, meta.idMeta)}>
              <Trash2 size={12} />
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default MetasSection;