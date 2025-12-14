export const buildTree = (items) => {
  const map = {};
  const roots = [];

  // Inicializar nodos
  items.forEach((item) => {
    map[item.id] = { ...item, children: [] };
  });

  // Construir jerarquía
  items.forEach((item) => {
    if (item.idPadre) {
      map[item.idPadre]?.children.push(map[item.id]);
    } else {
      roots.push(map[item.id]);
    }
  });

  // Ordenar por código (1, 1.1, 1.1.1...)
  const sortTree = (nodes) => {
    nodes.sort((a, b) =>
      a.codigo.localeCompare(b.codigo, undefined, { numeric: true })
    );
    nodes.forEach((n) => sortTree(n.children));
  };

  sortTree(roots);

  return roots;
};
