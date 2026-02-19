import { openDb } from "../db.js";

export const ReportsModel = {
  // =============================================
  // 📌 Obtener datos para el Reporte General
  // =============================================
  async getGeneralReportData(idPlan, year, quarter, idSecretaria) {
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

      // 3. Consulta de Metas + Avances
      // Se agrupa por Meta. Se obtienen los datos acumulados hasta el corte.

      let sqlMetas = `
        SELECT 
          m.id_meta,
          m.nombre AS nombre_meta,
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
      `;

      const params = [year, year, qOrder, idPlan];

      // Filtro por Secretaria
      if (idSecretaria) {
        sqlMetas += " AND m.id_secretaria = ?";
        params.push(idSecretaria);
      }

      sqlMetas += " GROUP BY m.id_meta";

      const [metas] = await db.query(sqlMetas, params);

      return { plan, metas };
    } finally {
      db.release();
    }
  },

  // =============================================
  // 📌 Obtener datos para el Reporte por Lineas
  // =============================================
  async getLineasReportData(idPlan, year, quarter, idSecretaria) {
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
      let sqlMetas = `
        SELECT
          m.id_meta,
          m.nombre AS meta_nombre,
          m.codigo AS meta_codigo,
          (m.cant_ano1 + m.cant_ano2 + m.cant_ano3 + m.cant_ano4) AS meta_total,
          COALESCE(SUM(av.cantidad), 0) AS avance_acumulado,
          
          lin.id_detalle AS linea_id,
          lin.nombre_detalle AS linea_nombre,
          lin.codigo AS linea_codigo
          
        FROM metas m
        INNER JOIN detalles_plan dp ON dp.id_detalle = m.id_detalle
        
        -- Joins para Jerarquía (Meta -> Iniciativa -> Apuesta -> Componente -> Linea)
        LEFT JOIN detalles_plan ini ON ini.id_detalle = m.id_detalle
        LEFT JOIN detalles_plan apu ON apu.id_detalle = ini.id_detalle_padre
        LEFT JOIN detalles_plan com ON com.id_detalle = apu.id_detalle_padre
        LEFT JOIN detalles_plan lin ON lin.id_detalle = com.id_detalle_padre
        
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
      `;

      const params = [year, year, qOrder, idPlan];

      if (idSecretaria) {
        sqlMetas += " AND m.id_secretaria = ?";
        params.push(idSecretaria);
      }

      sqlMetas += " GROUP BY m.id_meta, lin.id_detalle ORDER BY lin.codigo ASC, m.codigo ASC";

      const [metas] = await db.query(sqlMetas, params);

      return { plan, metas };
    } finally {
      db.release();
    }
  },

  // =============================================
  // 📌 Obtener datos para el Reporte por Componentes
  // =============================================
  async getComponentesReportData(idPlan, year, quarter, idSecretaria) {
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
      let sqlMetas = `
        SELECT
          m.id_meta,
          m.nombre AS meta_nombre,
          m.codigo AS meta_codigo,
          (m.cant_ano1 + m.cant_ano2 + m.cant_ano3 + m.cant_ano4) AS meta_total,
          COALESCE(SUM(av.cantidad), 0) AS avance_acumulado,
          
          com.id_detalle AS componente_id,
          com.nombre_detalle AS componente_nombre,
          com.codigo AS componente_codigo
          
        FROM metas m
        INNER JOIN detalles_plan dp ON dp.id_detalle = m.id_detalle
        
        -- Joins para Jerarquía
        LEFT JOIN detalles_plan ini ON ini.id_detalle = m.id_detalle
        LEFT JOIN detalles_plan apu ON apu.id_detalle = ini.id_detalle_padre
        LEFT JOIN detalles_plan com ON com.id_detalle = apu.id_detalle_padre
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
      `;

      const params = [year, year, qOrder, idPlan];
      if (idSecretaria) {
        sqlMetas += " AND m.id_secretaria = ?";
        params.push(idSecretaria);
      }

      sqlMetas += " GROUP BY m.id_meta, com.id_detalle ORDER BY com.codigo ASC, m.codigo ASC";

      const [metas] = await db.query(sqlMetas, params);

      return { plan, metas };
    } finally {
      db.release();
    }
  },

  // =============================================
  // 📌 Obtener datos para el Reporte por Secretarias
  // =============================================
  async getSecretariasReportData(idPlan, year, quarter, idSecretaria) {
    const db = await openDb();
    try {
      const [planRows] = await db.query("SELECT * FROM planes_desarrollo WHERE id_plan = ?", [idPlan]);
      const plan = planRows[0];
      if (!plan) return null;

      const trimestreOrder = { T1: 1, T2: 2, T3: 3, T4: 4 };
      const qOrder = trimestreOrder[quarter] || 4;

      // 3. Consulta de Metas + Secretaria
      let sqlMetas = `
        SELECT
          m.id_meta,
          m.nombre AS meta_nombre,
          m.codigo AS meta_codigo,
          (m.cant_ano1 + m.cant_ano2 + m.cant_ano3 + m.cant_ano4) AS meta_total,
          COALESCE(SUM(av.cantidad), 0) AS avance_acumulado,
          
          s.id_secretaria,
          s.nombre AS secretaria_nombre
          
        FROM metas m
        INNER JOIN detalles_plan dp ON dp.id_detalle = m.id_detalle
        LEFT JOIN secretarias s ON s.id_secretaria = m.id_secretaria
        
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
      `;

      const params = [year, year, qOrder, idPlan];
      if (idSecretaria) {
        // En este reporte, si se selecciona un responsable, solo se ven sus metas. 
        // Si no, se ven todas agrupadas.
        sqlMetas += " AND m.id_secretaria = ?";
        params.push(idSecretaria);
      }

      sqlMetas += " GROUP BY m.id_meta, s.id_secretaria ORDER BY s.nombre ASC, m.codigo ASC";

      const [metas] = await db.query(sqlMetas, params);

      return { plan, metas };
    } finally {
      db.release();
    }
  },

  // =============================================
  // 📌 Obtener datos para el Reporte Arbol (Jerarquía Completa)
  // =============================================
  // Re-saving to clear syntax error cache
  async getArbolReportData(idPlan, year, quarter, idSecretaria) {
    const db = await openDb();
    try {
      const [planRows] = await db.query("SELECT * FROM planes_desarrollo WHERE id_plan = ?", [idPlan]);
      const plan = planRows[0];
      if (!plan) return null;

      const trimestreOrder = { T1: 1, T2: 2, T3: 3, T4: 4 };
      const qOrder = trimestreOrder[quarter] || 4;

      let sqlMetas = `
        SELECT
          m.id_meta,
          m.nombre AS meta_nombre,
          m.codigo AS meta_codigo,
          (m.cant_ano1 + m.cant_ano2 + m.cant_ano3 + m.cant_ano4) AS meta_total,
          COALESCE(SUM(av.cantidad), 0) AS avance_acumulado,
          
          ini.id_detalle AS iniciativa_id,
          ini.nombre_detalle AS iniciativa_nombre,
          ini.codigo AS iniciativa_codigo,
          
          apu.id_detalle AS apuesta_id,
          apu.nombre_detalle AS apuesta_nombre,
          apu.codigo AS apuesta_codigo,
          
          com.id_detalle AS componente_id,
          com.nombre_detalle AS componente_nombre,
          com.codigo AS componente_codigo,
          
          lin.id_detalle AS linea_id,
          lin.nombre_detalle AS linea_nombre,
          lin.codigo AS linea_codigo

        FROM metas m
        INNER JOIN detalles_plan dp ON dp.id_detalle = m.id_detalle
        
        -- Joins para Jerarquía ascendente
        LEFT JOIN detalles_plan ini ON ini.id_detalle = m.id_detalle
        LEFT JOIN detalles_plan apu ON apu.id_detalle = ini.id_detalle_padre
        LEFT JOIN detalles_plan com ON com.id_detalle = apu.id_detalle_padre
        LEFT JOIN detalles_plan lin ON lin.id_detalle = com.id_detalle_padre
        
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
      `;

      const params = [year, year, qOrder, idPlan];
      if (idSecretaria) {
        sqlMetas += " AND m.id_secretaria = ?";
        params.push(idSecretaria);
      }

      sqlMetas += `
        GROUP BY m.id_meta, lin.id_detalle, com.id_detalle, apu.id_detalle, ini.id_detalle
        ORDER BY lin.codigo ASC, com.codigo ASC, apu.codigo ASC, ini.codigo ASC, m.codigo ASC
      `;

      const [metas] = await db.query(sqlMetas, params);

      return { plan, metas };
    } finally {
      db.release();
    }
  },
  // =============================================
  // 📌 Obtener datos para el Reporte Ranking de Componentes
  // =============================================
  async getRankingComponentesData(idPlan, year, quarter, idSecretaria) {
    const db = await openDb();
    try {
      const [planRows] = await db.query("SELECT * FROM planes_desarrollo WHERE id_plan = ?", [idPlan]);
      const plan = planRows[0];
      if (!plan) return null;

      const trimestreOrder = { T1: 1, T2: 2, T3: 3, T4: 4 };
      const qOrder = trimestreOrder[quarter] || 4;

      let sql = `
        SELECT
          com.id_detalle AS componente_id,
          com.nombre_detalle AS componente_nombre,
          MAX(s.nombre) AS secretaria_nombre,
          COUNT(m.id_meta) AS total_metas_count,
          SUM(m.cant_ano1 + m.cant_ano2 + m.cant_ano3 + m.cant_ano4) AS meta_total_sum,
          COALESCE(SUM(av_calc.cantidad), 0) AS avance_acumulado_sum

        FROM metas m
        INNER JOIN detalles_plan dp ON dp.id_detalle = m.id_detalle
        LEFT JOIN secretarias s ON s.id_secretaria = m.id_secretaria
        
        LEFT JOIN detalles_plan ini ON ini.id_detalle = m.id_detalle
        LEFT JOIN detalles_plan apu ON apu.id_detalle = ini.id_detalle_padre
        LEFT JOIN detalles_plan com ON com.id_detalle = apu.id_detalle_padre
        
        LEFT JOIN avances av_calc ON av_calc.id_meta = m.id_meta
          AND (
             av_calc.anio < ? 
             OR (av_calc.anio = ? AND 
                 CASE av_calc.trimestre
                   WHEN 'T1' THEN 1
                   WHEN 'T2' THEN 2
                   WHEN 'T3' THEN 3
                   WHEN 'T4' THEN 4
                 END <= ?)
          )
          
        WHERE dp.id_plan = ?
          AND com.id_detalle IS NOT NULL
      `;

      const params = [year, year, qOrder, idPlan];
      if (idSecretaria) {
        sql += " AND m.id_secretaria = ?";
        params.push(idSecretaria);
      }

      sql += " GROUP BY com.id_detalle";

      const [rows] = await db.query(sql, params);

      return { plan, rows };
    } finally {
      db.release();
    }
  }
  ,

  // =============================================
  // 📌 Obtener datos para el Reporte Ranking de Secretarias (Dependencias)
  // =============================================
  async getRankingSecretariasData(idPlan, year, quarter, idSecretaria) {
    const db = await openDb();
    try {
      const [planRows] = await db.query("SELECT * FROM planes_desarrollo WHERE id_plan = ?", [idPlan]);
      const plan = planRows[0];
      if (!plan) return null;

      const trimestreOrder = { T1: 1, T2: 2, T3: 3, T4: 4 };
      const qOrder = trimestreOrder[quarter] || 4;

      let sql = `
        SELECT
          s.id_secretaria AS secretaria_id,
          s.nombre AS secretaria_nombre,
          COUNT(m.id_meta) AS total_metas_count,
          SUM(m.cant_ano1 + m.cant_ano2 + m.cant_ano3 + m.cant_ano4) AS meta_total_sum,
          COALESCE(SUM(av_calc.cantidad), 0) AS avance_acumulado_sum

        FROM metas m
        INNER JOIN detalles_plan dp ON dp.id_detalle = m.id_detalle
        INNER JOIN secretarias s ON s.id_secretaria = m.id_secretaria
        
        LEFT JOIN avances av_calc ON av_calc.id_meta = m.id_meta
          AND (
             av_calc.anio < ? 
             OR (av_calc.anio = ? AND 
                 CASE av_calc.trimestre
                   WHEN 'T1' THEN 1
                   WHEN 'T2' THEN 2
                   WHEN 'T3' THEN 3
                   WHEN 'T4' THEN 4
                 END <= ?)
          )
          
        WHERE dp.id_plan = ?
      `;

      const params = [year, year, qOrder, idPlan];
      if (idSecretaria) {
        sql += " AND m.id_secretaria = ?";
        params.push(idSecretaria);
      }

      sql += " GROUP BY s.id_secretaria";

      const [rows] = await db.query(sql, params);

      return { plan, rows };
    } finally {
      db.release();
    }
  }
};
