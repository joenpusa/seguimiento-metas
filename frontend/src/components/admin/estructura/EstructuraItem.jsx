import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit, ChevronDown, ChevronRight, Target as TargetIcon } from 'lucide-react';
import MetasSection from '@/components/admin/estructura/MetasSection'; // Assuming MetasSection is extracted

const EstructuraItem = ({ item, type, path, onOpenItemDialog, onDeleteItem, onOpenMetaDialog, onDeleteMeta, renderEstructuraRecursive }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const itemId = item.id;
  const itemNombre = item.nombre;
  const itemMetas = type === 'iniciativa' ? item.metas : undefined;

  const childTypeMap = {
    lineaEstrategica: 'componente',
    componente: 'apuesta',
    apuesta: 'iniciativa',
  };
  const childCollectionKeyMap = {
    lineaEstrategica: 'componentes',
    componente: 'apuestas',
    apuesta: 'iniciativas',
  };

  const childType = childTypeMap[type];
  const childCollectionKey = childCollectionKeyMap[type];
  const children = childCollectionKey && item[childCollectionKey];
  const hasChildren = children && children.length > 0;
  const canHaveChildren = type !== 'iniciativa';

  const toggleExpand = () => setIsExpanded(!isExpanded);

  return (
    <li className="p-2 border rounded-md bg-white shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" onClick={toggleExpand} className="mr-1 p-1 h-auto">
            {hasChildren || (type === 'iniciativa' && itemMetas && itemMetas.length > 0) ? 
              (isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />) 
              : <span className="w-4 inline-block"></span>}
          </Button>
          <span className="font-medium text-sm">{itemNombre}</span>
        </div>
        <div className="space-x-1">
          {type === 'iniciativa' && (
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => onOpenMetaDialog(path, itemNombre, null)}>
              <TargetIcon size={14} />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onOpenItemDialog(type, item, path.slice(0, -1))}>
            <Edit size={14} />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600" onClick={() => onDeleteItem(type, path.slice(0, -1), item)}>
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
      {isExpanded && (
        <div className="mt-2 pl-4 border-l-2 border-gray-200">
          {hasChildren && renderEstructuraRecursive(children, childType, path)}
          {type === 'iniciativa' && (
            <MetasSection 
              metas={itemMetas} 
              iniciativaPath={path} 
              iniciativaNombre={itemNombre} 
              onOpenMetaDialog={onOpenMetaDialog}
              onDeleteMeta={onDeleteMeta}
            />
          )}
          {canHaveChildren && (
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2 gap-1 text-xs" 
              onClick={() => onOpenItemDialog(childType, null, path)}
            >
              <Plus size={14} /> Añadir {childType.charAt(0).toUpperCase() + childType.slice(1)}
            </Button>
          )}
        </div>
      )}
    </li>
  );
};

export default EstructuraItem;