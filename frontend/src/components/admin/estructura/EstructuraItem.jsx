import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash } from "lucide-react";
import MetasTable from "./MetasTable";



const EstructuraItem = ({ node, level = 0, onAdd, onEdit, onDelete }) => {
  const isIniciativa = level === 3;
  return (
    <div className="ml-4">
      <div className="flex items-center gap-2 py-1">
        <span className="font-mono text-sm text-muted-foreground">
          {node.codigo}
        </span>

        <span className="font-medium">{node.nombre}</span>

        <div className="ml-auto flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onAdd(node, isIniciativa)}
          >
            <Plus className="h-4 w-4" />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={() => onEdit(node)}
          >
            <Pencil className="h-4 w-4" />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={() => onDelete(node)}
          >
            <Trash className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>

      {node.children.length > 0 && (
        <div className="ml-4 border-l pl-3">
          {node.children.map((child) => (
            <EstructuraItem
              key={child.id}
              node={child}
              level={level + 1}
              onAdd={onAdd}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      {level === 3 && (
        <MetasTable idDetalle={node.id} />
      )}
    </div>
  );
};

export default EstructuraItem;
