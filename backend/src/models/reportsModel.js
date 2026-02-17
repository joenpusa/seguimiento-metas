import { openDb } from "../db.js";

export const ReportsModel = {
  // =============================================
  // 📌 Obtener datos para el Reporte General
  // =============================================
  async getGeneralReportData(idPlan, year, quarter) {
    const db = await openDb();
    try {
      // 1. Obtener información del PLAN
      const [planRows] = await db.query(
        "SELECT * FROM planes_desarrollo WHERE id_plan = ?",
        [idPlan]
      );
      const plan = planRows[0];
      if (!plan) return null;

      // 2. Mapeo de trimestres a orden
      const trimestreOrder = { T1: 1, T2: 2, T3: 3, T4: 4 };
      const qOrder = trimestreOrder[quarter] || 4; // Default to 4 if invalid

      // 3. Consulta de Metas y Avances
      const sqlMetas = `
        SELECT
          m.id_meta,
          m.nombre AS meta_nombre,
          m.codigo AS meta_codigo,
          (m.cant_ano1 + m.cant_ano2 + m.cant_ano3 + m.cant_ano4) AS meta_total,
          COALESCE(SUM(av.cantidad), 0) AS avance_acumulado
        FROM metas m
        INNER JOIN detalles_plan dp ON dp.id_detalle = m.id_detalle
        LEFT JOIN avances av ON av.id_meta = m.id_meta
          AND (
             av.anio < ? 
             OR (av.anio = ? AND 
                 CASE av.trimestre
                   WHEN 'T1' THEN 1
                   WHEN 'T2' THEN 2
                   WHEN 'T3' THEN 3
                   WHEN 'T4' THEN 4
                 END <= ?)
          )
        WHERE dp.id_plan = ?
        GROUP BY m.id_meta
      `;

      const [metas] = await db.query(sqlMetas, [year, year, qOrder, idPlan]);

      return { plan, metas };
    } finally {
      db.release();
    }
  },

  // =============================================
  // 📌 Obtener datos para el Reporte por Lineas
  // =============================================
  async getLineasReportData(idPlan, year, quarter) {
    const db = await openDb();
    try {
      // 1. Obtener información del PLAN
      const [planRows] = await db.query(
        "SELECT * FROM planes_desarrollo WHERE id_plan = ?",
        [idPlan]
      );
      const plan = planRows[0];
      if (!plan) return null;

      // 2. Mapeo de trimestres a orden
      const trimestreOrder = { T1: 1, T2: 2, T3: 3, T4: 4 };
      const qOrder = trimestreOrder[quarter] || 4;

      // 3. Consulta de Metas + Jerarquía (Lineas)
      const sqlMetas = `
        SELECT
          m.id_meta,
          m.nombre AS meta_nombre,
          m.codigo AS meta_codigo,
          (m.cant_ano1 + m.cant_ano2 + m.cant_ano3 + m.cant_ano4) AS meta_total,
          COALESCE(SUM(av.cantidad), 0) AS avance_acumulado,
          
          l.id_detalle AS linea_id,
          l.nombre_detalle AS linea_nombre
          
        FROM metas m
        INNER JOIN detalles_plan dp ON dp.id_detalle = m.id_detalle
        
        -- Joins para Jerarquía
        LEFT JOIN detalles_plan i ON i.id_detalle = m.id_detalle
        LEFT JOIN detalles_plan a ON a.id_detalle = i.id_detalle_padre
        LEFT JOIN detalles_plan c ON c.id_detalle = a.id_detalle_padre
        LEFT JOIN detalles_plan l ON l.id_detalle = c.id_detalle_padre
        
        LEFT JOIN avances av ON av.id_meta = m.id_meta
          AND (
             av.anio < ? 
             OR (av.anio = ? AND 
                 CASE av.trimestre
                   WHEN 'T1' THEN 1
                   WHEN 'T2' THEN 2
                   WHEN 'T3' THEN 3
                   WHEN 'T4' THEN 4
                 END <= ?)
          )
        WHERE dp.id_plan = ?
        GROUP BY m.id_meta, l.id_detalle
        ORDER BY l.codigo ASC, m.codigo ASC
      `;

      const [metas] = await db.query(sqlMetas, [year, year, qOrder, idPlan]);

      return { plan, metas };
    } finally {
      db.release();
    }
  },

  // =============================================
  // 📌 Obtener datos para el Reporte por Componentes
  // =============================================
  async getComponentesReportData(idPlan, year, quarter) {
    const db = await openDb();
    try {
      // 1. Obtener información del PLAN
      const [planRows] = await db.query(
        "SELECT * FROM planes_desarrollo WHERE id_plan = ?",
        [idPlan]
      );
      const plan = planRows[0];
      if (!plan) return null;

      // 2. Mapeo de trimestres a orden
      const trimestreOrder = { T1: 1, T2: 2, T3: 3, T4: 4 };
      const qOrder = trimestreOrder[quarter] || 4;

      // 3. Consulta de Metas + Jerarquía (Componentes)
      const sqlMetas = `
        SELECT
          m.id_meta,
          m.nombre AS meta_nombre,
          m.codigo AS meta_codigo,
          (m.cant_ano1 + m.cant_ano2 + m.cant_ano3 + m.cant_ano4) AS meta_total,
          COALESCE(SUM(av.cantidad), 0) AS avance_acumulado,
          
          c.id_detalle AS componente_id,
          c.nombre_detalle AS componente_nombre
          
        FROM metas m
        INNER JOIN detalles_plan dp ON dp.id_detalle = m.id_detalle
        
        -- Joins para Jerarquía
        LEFT JOIN detalles_plan i ON i.id_detalle = m.id_detalle
        LEFT JOIN detalles_plan a ON a.id_detalle = i.id_detalle_padre
        LEFT JOIN detalles_plan c ON c.id_detalle = a.id_detalle_padre
        -- LEFT JOIN detalles_plan l ON l.id_detalle = c.id_detalle_padre -- No necesitamos la linea aqui
        
        LEFT JOIN avances av ON av.id_meta = m.id_meta
          AND (
             av.anio < ? 
             OR (av.anio = ? AND 
                 CASE av.trimestre
                   WHEN 'T1' THEN 1
                   WHEN 'T2' THEN 2
                   WHEN 'T3' THEN 3
                   WHEN 'T4' THEN 4
                 END <= ?)
          )
        WHERE dp.id_plan = ?
        GROUP BY m.id_meta, c.id_detalle
        ORDER BY c.codigo ASC, m.codigo ASC
      `;

      const [metas] = await db.query(sqlMetas, [year, year, qOrder, idPlan]);

      return { plan, metas };
    } finally {
      db.release();
    }
  }
};
