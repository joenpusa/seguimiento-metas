export const buildTree = (flat = []) => {
  const map = {};
  const roots = [];

  const VALID_HIERARCHY = {
    linea: ["componente"],
    componente: ["apuesta"],
    apuesta: ["iniciativa"],
    iniciativa: [],
  };

  // Inicializar nodos
  flat.forEach(item => {
    map[item.id] = {
      ...item,
      children: [],
    };
  });

  // Construir jerarquía
  flat.forEach(item => {
    const node = map[item.id];

    if (!item.idPadre) {
      roots.push(node);
      return;
    }

    const parent = map[item.idPadre];

    if (!parent) {
      console.warn("Padre no encontrado:", item);
      roots.push(node);
      return;
    }

    if (!parent.tipo || !node.tipo) {
      console.warn("Nodo sin tipo:", { parent, node });
      return;
    }

    const allowed = VALID_HIERARCHY[parent.tipo] || [];

    if (!allowed.includes(node.tipo)) {
      console.warn(`Jerarquía inválida: ${parent.tipo} → ${node.tipo}`);
      return;
    }

    parent.children.push(node);
  });

  // Ordenar hijos
  Object.values(map).forEach(node => {
    node.children.sort((a, b) =>
      a.codigo.localeCompare(b.codigo)
    );
  });

  return roots;
};
