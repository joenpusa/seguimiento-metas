import { ChevronRight, ChevronDown, Plus, Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import MetasTable from "./MetasTable";

const EstructuraItem = ({
  node,
  collapsed,
  onToggle,
  onAdd,
  onEdit,
  onDelete
}) => {
  const isIniciativa = node.tipo === "iniciativa";
  const hasChildren = node.children.length > 0;
  const showToggle = hasChildren || isIniciativa;
  const isCollapsed = collapsed.has(node.id);

  return (
    <div className="ml-4">
      {/* HEADER */}
      <div className="flex items-center gap-2 py-1">
        <div className="w-4">
          {showToggle && (
            <button
              onClick={() => onToggle(node.id)}
              className="text-muted-foreground hover:text-foreground"
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        <span className="font-mono text-sm text-muted-foreground">
          {node.codigo}
        </span>

        <span className="font-medium">{node.nombre}</span>

        <div className="ml-auto flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onAdd(node)}
          >
            <Plus className="h-4 w-4" />
            {isIniciativa && <span className="ml-1">Meta</span>}
          </Button>

          <Button size="icon" variant="ghost" onClick={() => onEdit(node)}>
            <Pencil className="h-4 w-4" />
          </Button>

          <Button size="icon" variant="ghost" onClick={() => onDelete(node)}>
            <Trash className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>

      {/* HIJOS */}
      {!isCollapsed && hasChildren && (
        <div className="ml-4 border-l pl-3">
          {node.children.map(child => (
            <EstructuraItem
              key={child.id}
              node={child}
              collapsed={collapsed}
              onToggle={onToggle}
              onAdd={onAdd}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      {/* METAS */}
      {!isCollapsed && isIniciativa && (
        <div className="ml-8">
          <MetasTable idDetalle={node.id} />
        </div>
      )}
    </div>
  );
};

export default EstructuraItem;
