import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usePlan } from '@/context/PlanContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import AdminMetaForm from '@/components/admin/AdminMetaForm';
import ItemDialog from '@/components/admin/estructura/ItemDialog';
import EstructuraItem from '@/components/admin/estructura/EstructuraItem';
import { v4 as uuidv4 } from 'uuid';

const AdminEstructuraPlan = ({ plan }) => {
  const { 
    updateEstructuraPDI: updateEstructuraPDIContext, 
    addMetaToIniciativa, 
    updateMetaInIniciativa, 
    deleteMetaFromIniciativa 
  } = usePlan();

  const [openItemDialog, setOpenItemDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null); 
  const [itemType, setItemType] = useState(''); 
  const [parentPath, setParentPath] = useState([]); 
  const [itemName, setItemName] = useState('');
  
  const [openMetaDialog, setOpenMetaDialog] = useState(false);
  const [editingMeta, setEditingMeta] = useState(null);
  const [currentIniciativaPath, setCurrentIniciativaPath] = useState([]);
  const [currentIniciativaNombre, setCurrentIniciativaNombre] = useState('');

  const estructuraPDI = plan.estructuraPDI;

  const handleOpenItemDialog = (type, currentItem = null, path = []) => {
    setItemType(type);
    setEditingItem(currentItem);
    setParentPath(path);
    const currentName = typeof currentItem === 'object' ? currentItem?.nombre : typeof currentItem === 'string' ? currentItem : '';
    setItemName(currentName || '');
    setOpenItemDialog(true);
  };
  
  const handleOpenMetaDialog = (iniciativaPathConst, iniciativaNombreConst, meta = null) => {
    setCurrentIniciativaPath(iniciativaPathConst);
    setCurrentIniciativaNombre(iniciativaNombreConst);
    setEditingMeta(meta);
    setOpenMetaDialog(true);
  };

  const handleSaveMeta = (metaData) => {
    if (editingMeta) {
      updateMetaInIniciativa(currentIniciativaPath, editingMeta.idMeta, metaData);
    } else {
      addMetaToIniciativa(currentIniciativaPath, metaData);
    }
    setOpenMetaDialog(false);
    setEditingMeta(null);
  };

  const handleDeleteMeta = (iniciativaPathForMeta, metaId) => {
    deleteMetaFromIniciativa(iniciativaPathForMeta, metaId);
  };

  const ensureItemIsObject = (item, type) => {
    if (typeof item === 'string') {
      const baseObject = { id: uuidv4(), nombre: item };
      if (type === 'iniciativa') baseObject.metas = [];
      else if (type === 'apuesta') baseObject.iniciativas = [];
      else if (type === 'componente') baseObject.apuestas = [];
      else if (type === 'lineaEstrategica') baseObject.componentes = [];
      return baseObject;
    }
    if (typeof item === 'object' && item !== null) {
      if (!item.id) item.id = uuidv4(); // Ensure ID exists
      if (type === 'iniciativa' && !Array.isArray(item.metas)) item.metas = [];
      // Similar checks for other types can be added if necessary
    }
    return item;
  };

  const handleSaveItem = (newName) => {
    let nuevaEstructura = JSON.parse(JSON.stringify(estructuraPDI));

    const getItemRef = (structure, path) => {
      let current = structure;
      for (const segment of path) {
        current = current[segment.type][segment.index];
      }
      return current;
    };
    
    const getCollectionRefAndIndex = (structure, path, itemToFind, itemTypeToFind) => {
        let parent = structure;
        let collectionKey = itemTypeToFind === 'lineaEstrategica' ? 'lineasEstrategicas' : itemTypeToFind + 's';
        if (itemTypeToFind === 'iniciativa' && parentPath.length > 0) {
           collectionKey = 'iniciativas'; 
        }


        for (let i = 0; i < path.length; i++) {
            parent = parent[path[i].type][path[i].index];
        }

        const collection = parent[collectionKey];
        const itemToFindId = typeof itemToFind === 'object' ? itemToFind.id : itemToFind;
        const itemIndex = collection.findIndex(it => {
             const currentItemId = typeof it === 'object' ? it.id : it;
             return currentItemId === itemToFindId;
        });
        return { collection, itemIndex, parentRef: parent, collectionKey };
    };


    if (editingItem) {
      const { collection, itemIndex, parentRef, collectionKey: currentCollectionKey } = getCollectionRefAndIndex(nuevaEstructura, parentPath, editingItem, itemType);
      if (itemIndex > -1) {
        collection[itemIndex] = ensureItemIsObject(collection[itemIndex], itemType);
        collection[itemIndex].nombre = newName;
      }
    } else {
      const newItem = { id: uuidv4(), nombre: newName };
      if (itemType === 'lineaEstrategica') {
        newItem.componentes = [];
        if (!nuevaEstructura.lineasEstrategicas) nuevaEstructura.lineasEstrategicas = [];
        nuevaEstructura.lineasEstrategicas.push(newItem);
      } else {
        let parent = getItemRef(nuevaEstructura, parentPath);
        parent = ensureItemIsObject(parent, parentPath[parentPath.length -1]?.type || 'plan');

        if (itemType === 'componente') {
          newItem.apuestas = [];
          if(!parent.componentes) parent.componentes = [];
          parent.componentes.push(newItem);
        } else if (itemType === 'apuesta') {
          newItem.iniciativas = [];
          if(!parent.apuestas) parent.apuestas = [];
          parent.apuestas.push(newItem);
        } else if (itemType === 'iniciativa') {
          newItem.metas = [];
          if(!parent.iniciativas) parent.iniciativas = [];
          parent.iniciativas.push(newItem);
        }
      }
    }
    updateEstructuraPDIContext(nuevaEstructura);
    setOpenItemDialog(false);
    setItemName('');
    setEditingItem(null);
  };

  const handleDeleteItem = (type, path, itemToDelete) => {
    let nuevaEstructura = JSON.parse(JSON.stringify(estructuraPDI));
    let parent = nuevaEstructura;
    let collectionName = type === 'lineaEstrategica' ? 'lineasEstrategicas' : type === 'iniciativa' ? 'iniciativas' : type + 's';
    
    const itemToDeleteId = typeof itemToDelete === 'object' ? itemToDelete.id : itemToDelete;

    if (path.length === 0) { 
        nuevaEstructura.lineasEstrategicas = nuevaEstructura.lineasEstrategicas.filter(l => (typeof l === 'object' ? l.id : l) !== itemToDeleteId);
    } else {
        for (let i = 0; i < path.length; i++) {
            parent = parent[path[i].type][path[i].index];
        }
        if (parent && parent[collectionName]) {
          parent[collectionName] = parent[collectionName].filter(it => (typeof it === 'object' ? it.id : it) !== itemToDeleteId);
        }
    }
    updateEstructuraPDIContext(nuevaEstructura);
  };

  const renderEstructuraRecursive = (items, type, currentPath = []) => {
    const collectionName = type === 'lineaEstrategica' ? 'lineasEstrategicas' : type === 'iniciativa' ? 'iniciativas' : type + 's';
    
    if (!items || items.length === 0) {
      return (
        <p className="text-xs text-muted-foreground pl-4 py-1">
          No hay {collectionName.replace(/([A-Z])/g, ' $1').toLowerCase()} definidos.
        </p>
      );
    }

    return (
      <ul className="pl-4 space-y-2">
        {items.map((itemData, index) => {
          const itemObject = ensureItemIsObject(itemData, type);
          const newPath = [...currentPath, { type: collectionName, index }];
          return (
            <EstructuraItem
              key={itemObject.id || index}
              item={itemObject}
              type={type}
              path={newPath}
              onOpenItemDialog={handleOpenItemDialog}
              onDeleteItem={handleDeleteItem}
              onOpenMetaDialog={handleOpenMetaDialog}
              onDeleteMeta={handleDeleteMeta}
              renderEstructuraRecursive={renderEstructuraRecursive}
            />
          );
        })}
      </ul>
    );
  };

  return (
    <motion.div 
      className="lg:col-span-2"
      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card>
        <CardHeader className="relative">
          <CardTitle>Estructura de: {plan.nombrePlan}</CardTitle>
          <Button size="sm" className="gap-1 absolute top-4 right-4" onClick={() => handleOpenItemDialog('lineaEstrategica', null, [])}>
            <Plus size={16} /> Añadir Línea Estratégica
          </Button>
        </CardHeader>
        <CardContent className="max-h-[calc(100vh-280px)] overflow-y-auto p-4 bg-gray-50 rounded-b-md">
          {(estructuraPDI.lineasEstrategicas && estructuraPDI.lineasEstrategicas.length > 0) ? 
            renderEstructuraRecursive(estructuraPDI.lineasEstrategicas, 'lineaEstrategica') :
            <p className="text-muted-foreground text-center py-4">No hay líneas estratégicas definidas para este plan. Comience añadiendo una.</p>
          }
        </CardContent>
      </Card>

      <ItemDialog
        open={openItemDialog}
        onOpenChange={setOpenItemDialog}
        onSave={handleSaveItem}
        itemType={itemType}
        initialName={itemName}
        isEditing={!!editingItem}
      />

      <AdminMetaForm 
        open={openMetaDialog}
        onOpenChange={setOpenMetaDialog}
        onSave={handleSaveMeta}
        metaToEdit={editingMeta}
        iniciativaNombre={currentIniciativaNombre}
      />
    </motion.div>
  );
};

export default AdminEstructuraPlan;