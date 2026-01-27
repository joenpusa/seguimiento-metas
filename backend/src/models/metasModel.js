// src/models/metasModel.js
import { openDb } from "../db.js";

export const MetasModel = {
  // =========================
  // OBTENER UNA META
  // =========================
  async getById(idMeta) {
    const db = await openDb();
    try {
      const sql = `
        SELECT
          m.*,
          
          -- Calculado para compatibilidad
          CASE
            WHEN m.recurrente = 1 THEN (m.cant_ano1 + m.cant_ano2 + m.cant_ano3 + m.cant_ano4) / 4
            ELSE (m.cant_ano1 + m.cant_ano2 + m.cant_ano3 + m.cant_ano4)
          END AS cantidad,

          -- ACUMULADOS FISICOS
          CASE
            WHEN m.recurrente = 1 THEN COALESCE(av.total_cantidad, 0) / 4
            ELSE COALESCE(av.total_cantidad, 0)
          END AS acumulado_fisico,
          -- ACUMULADOS DE GASTOS
          COALESCE(av.acumulado_pro, 0) AS acumulado_pro,
          COALESCE(av.acumulado_sgp, 0) AS acumulado_sgp,
          COALESCE(av.acumulado_reg, 0) AS acumulado_reg,
          COALESCE(av.acumulado_cre, 0) AS acumulado_cre,
          COALESCE(av.acumulado_mun, 0) AS acumulado_mun,
          COALESCE(av.acumulado_otr, 0) AS acumulado_otr,
          COALESCE(av.total_gasto, 0) AS total_gasto,

          -- ACUMULADOS POBLACION
          COALESCE(av.acumulado_0_5, 0) AS acumulado_0_5,
          COALESCE(av.acumulado_6_12, 0) AS acumulado_6_12,
          COALESCE(av.acumulado_13_17, 0) AS acumulado_13_17,
          COALESCE(av.acumulado_18_24, 0) AS acumulado_18_24,
          COALESCE(av.acumulado_25_62, 0) AS acumulado_25_62,
          COALESCE(av.acumulado_65_mas, 0) AS acumulado_65_mas,

          COALESCE(av.acumulado_mujer, 0) AS acumulado_mujer,
          COALESCE(av.acumulado_discapacidad, 0) AS acumulado_discapacidad,
          COALESCE(av.acumulado_etnia, 0) AS acumulado_etnia,
          COALESCE(av.acumulado_victima, 0) AS acumulado_victima,
          COALESCE(av.acumulado_desmovilizado, 0) AS acumulado_desmovilizado,
          COALESCE(av.acumulado_lgtbi, 0) AS acumulado_lgtbi,
          COALESCE(av.acumulado_migrante, 0) AS acumulado_migrante,
          COALESCE(av.acumulado_indigente, 0) AS acumulado_indigente,
          COALESCE(av.acumulado_privado, 0) AS acumulado_privado,

          -- PORCENTAJES
          CASE
            WHEN (m.cant_ano1 + m.cant_ano2 + m.cant_ano3 + m.cant_ano4) > 0
            THEN LEAST(ROUND(COALESCE(av.total_cantidad, 0) * 100.0 / (m.cant_ano1 + m.cant_ano2 + m.cant_ano3 + m.cant_ano4), 2), 100)
            ELSE 0
          END AS porcentaje_fisico,

          CASE
            WHEN (
              m.val1_pro + m.val2_pro + m.val3_pro + m.val4_pro +
              m.val1_sgp + m.val2_sgp + m.val3_sgp + m.val4_sgp +
              m.val1_reg + m.val2_reg + m.val3_reg + m.val4_reg +
              m.val1_cre + m.val2_cre + m.val3_cre + m.val4_cre +
              m.val1_mun + m.val2_mun + m.val3_mun + m.val4_mun +
              m.val1_otr + m.val2_otr + m.val3_otr + m.val4_otr
            ) > 0
            THEN LEAST(ROUND(
              COALESCE(av.total_gasto, 0) * 100.0 /
              (
                m.val1_pro + m.val2_pro + m.val3_pro + m.val4_pro +
                m.val1_sgp + m.val2_sgp + m.val3_sgp + m.val4_sgp +
                m.val1_reg + m.val2_reg + m.val3_reg + m.val4_reg +
                m.val1_cre + m.val2_cre + m.val3_cre + m.val4_cre +
                m.val1_mun + m.val2_mun + m.val3_mun + m.val4_mun +
                m.val1_otr + m.val2_otr + m.val3_otr + m.val4_otr
              ),
              2
            ), 100)
            ELSE 0
          END AS porcentaje_financiero,

          -- Estado de progreso
          CASE
            WHEN
              COALESCE(av.total_cantidad, 0) = 0
              OR (m.cant_ano1 + m.cant_ano2 + m.cant_ano3 + m.cant_ano4) = 0
            THEN 'SIN_INICIAR'

            WHEN
              ROUND(COALESCE(av.total_cantidad, 0) * 100.0 / (m.cant_ano1 + m.cant_ano2 + m.cant_ano3 + m.cant_ano4), 2) >= 100
            THEN 'COMPLETADA'

            ELSE 'EN_EJECUCION'
          END AS estadoProgreso,

          i.id_detalle   AS iniciativa_id,
          i.codigo       AS iniciativa_codigo,
          i.nombre_detalle AS iniciativa_nombre,

          a.id_detalle   AS apuesta_id,
          a.codigo       AS apuesta_codigo,
          a.nombre_detalle AS apuesta_nombre,

          c.id_detalle   AS componente_id,
          c.codigo       AS componente_codigo,
          c.nombre_detalle AS componente_nombre,

          l.id_detalle   AS linea_id,
          l.codigo       AS linea_codigo,
          l.nombre_detalle AS linea_nombre,

          s.nombre AS secretaria_nombre,
          u.nombre AS unidad_nombre,

          GROUP_CONCAT(mu.id_municipio) AS municipios

        FROM metas m

        INNER JOIN detalles_plan i ON i.id_detalle = m.id_detalle
        LEFT JOIN detalles_plan a ON a.id_detalle = i.id_detalle_padre
        LEFT JOIN detalles_plan c ON c.id_detalle = a.id_detalle_padre
        LEFT JOIN detalles_plan l ON l.id_detalle = c.id_detalle_padre
        LEFT JOIN secretarias s ON s.id_secretaria = m.id_secretaria
        LEFT JOIN unidades u ON u.id_unidad = m.id_unidad
        LEFT JOIN metasxmunicipio mxm ON mxm.id_meta = m.id_meta
        LEFT JOIN municipios mu ON mu.id_municipio = mxm.id_municipio

        LEFT JOIN (
          SELECT
            id_meta,
            SUM(cantidad) AS total_cantidad,
            SUM(IFNULL(gasto_pro,0)) AS acumulado_pro,
            SUM(IFNULL(gasto_sgp,0)) AS acumulado_sgp,
            SUM(IFNULL(gasto_reg,0)) AS acumulado_reg,
            SUM(IFNULL(gasto_cre,0)) AS acumulado_cre,
            SUM(IFNULL(gasto_mun,0)) AS acumulado_mun,
            SUM(IFNULL(gasto_otr,0)) AS acumulado_otr,
            
            SUM(IFNULL(cantidad_0_5,0)) AS acumulado_0_5,
            SUM(IFNULL(cantidad_6_12,0)) AS acumulado_6_12,
            SUM(IFNULL(cantidad_13_17,0)) AS acumulado_13_17,
            SUM(IFNULL(cantidad_18_24,0)) AS acumulado_18_24,
            SUM(IFNULL(cantidad_25_62,0)) AS acumulado_25_62,
            SUM(IFNULL(cantidad_65_mas,0)) AS acumulado_65_mas,

            SUM(IFNULL(cantesp_mujer,0)) AS acumulado_mujer,
            SUM(IFNULL(cantesp_discapacidad,0)) AS acumulado_discapacidad,
            SUM(IFNULL(cantesp_etnia,0)) AS acumulado_etnia,
            SUM(IFNULL(cantesp_victima,0)) AS acumulado_victima,
            SUM(IFNULL(cantesp_desmovilizado,0)) AS acumulado_desmovilizado,
            SUM(IFNULL(cantesp_lgtbi,0)) AS acumulado_lgtbi,
            SUM(IFNULL(cantesp_migrante,0)) AS acumulado_migrante,
            SUM(IFNULL(cantesp_indigente,0)) AS acumulado_indigente,
            SUM(IFNULL(cantesp_privado,0)) AS acumulado_privado,

            SUM(
              IFNULL(gasto_pro,0) + IFNULL(gasto_cre,0) + IFNULL(gasto_sgp,0) +
              IFNULL(gasto_reg,0) + IFNULL(gasto_otr,0) + IFNULL(gasto_mun,0)
            ) AS total_gasto
          FROM avances
          GROUP BY id_meta
        ) av ON av.id_meta = m.id_meta

        WHERE m.id_meta = ?
        GROUP BY m.id_meta
      `;

      const [rows] = await db.query(sql, [idMeta]);
      const meta = rows[0];

      if (!meta) return null;

      return {
        ...meta,
        municipios: meta.municipios
          ? meta.municipios.split(",").map(Number)
          : [],
      };
    } finally {
      db.release();
    }
  },

  // =========================
  // OBTENER METAS POR DETALLE
  // =========================
  async getByDetalle(id_detalle) {
    const db = await openDb();
    try {
      const [rows] = await db.query(
        `
        SELECT 
          m.*,
          (m.cant_ano1 + m.cant_ano2 + m.cant_ano3 + m.cant_ano4) AS cantidad,
          s.nombre AS secretaria_nombre,
          u.nombre AS unidad_nombre,
          GROUP_CONCAT(mx.id_municipio) AS municipios
        FROM metas m
        JOIN unidades u ON u.id_unidad = m.id_unidad
        JOIN secretarias s ON s.id_secretaria = m.id_secretaria
        LEFT JOIN metasxmunicipio mx ON mx.id_meta = m.id_meta
        WHERE m.id_detalle = ?
        GROUP BY m.id_meta
        ORDER BY m.created_at ASC
        `,
        [id_detalle]
      );

      return rows.map((r) => ({
        ...r,
        municipios: r.municipios ? r.municipios.split(",").map(Number) : [],
      }));
    } finally {
      db.release();
    }
  },

  // =========================
  // CREAR META
  // =========================
  async create(data) {
    const db = await openDb();
    try {
      // 🔹 Validar foráneas
      const [detalle] = await db.query(
        `SELECT id_detalle FROM detalles_plan WHERE id_detalle = ?`,
        [data.id_detalle]
      );
      if (detalle.length === 0) throw new Error("Detalle no existe");

      const [unidad] = await db.query(
        `SELECT id_unidad FROM unidades WHERE id_unidad = ?`,
        [data.id_unidad]
      );
      if (unidad.length === 0) throw new Error("Unidad no existe");

      const [secretaria] = await db.query(
        `SELECT id_secretaria FROM secretarias WHERE id_secretaria = ?`,
        [data.id_secretaria]
      );
      if (secretaria.length === 0) throw new Error("Secretaría no existe");

      // Insert meta
      const [result] = await db.query(
        `
        INSERT INTO metas (
          codigo,
          nombre,
          descripcion,
          id_detalle,
          cant_ano1, cant_ano2, cant_ano3, cant_ano4,
          id_unidad,
          val1_pro, val2_pro, val3_pro, val4_pro,
          recurrente,
          id_secretaria,
          fecha_limite,

          cantidad_0_5,
          cantidad_6_12,
          cantidad_13_17,
          cantidad_18_24,
          cantidad_25_62,
          cantidad_65_mas,

          cantesp_mujer,
          cantesp_discapacidad,
          cantesp_etnia,
          cantesp_victima,
          cantesp_desmovilizado,
          cantesp_lgtbi,
          cantesp_migrante,
          cantesp_indigente,
          cantesp_privado,

          val1_sgp, val1_reg, val1_cre, val1_mun, val1_otr,
          val2_sgp, val2_reg, val2_cre, val2_mun, val2_otr,
          val3_sgp, val3_reg, val3_cre, val3_mun, val3_otr,
          val4_sgp, val4_reg, val4_cre, val4_mun, val4_otr
        )
        VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?
        )
        `,
        [
          data.codigo,
          data.nombre,
          data.descripcion,
          data.id_detalle,
          data.cant_ano1 || 0,
          data.cant_ano2 || 0,
          data.cant_ano3 || 0,
          data.cant_ano4 || 0,
          data.id_unidad,
          data.val1_pro, data.val2_pro, data.val3_pro, data.val4_pro,
          data.recurrente,
          data.id_secretaria,
          data.fecha_limite,

          data.cantidad_0_5,
          data.cantidad_6_12,
          data.cantidad_13_17,
          data.cantidad_18_24,
          data.cantidad_25_62,
          data.cantidad_65_mas,

          data.cantesp_mujer,
          data.cantesp_discapacidad,
          data.cantesp_etnia,
          data.cantesp_victima,
          data.cantesp_desmovilizado,
          data.cantesp_lgtbi,
          data.cantesp_migrante,
          data.cantesp_indigente,
          data.cantesp_privado,

          data.val1_sgp, data.val1_reg, data.val1_cre, data.val1_mun, data.val1_otr,
          data.val2_sgp, data.val2_reg, data.val2_cre, data.val2_mun, data.val2_otr,
          data.val3_sgp, data.val3_reg, data.val3_cre, data.val3_mun, data.val3_otr,
          data.val4_sgp, data.val4_reg, data.val4_cre, data.val4_mun, data.val4_otr,
        ]
      );

      const id_meta = result.insertId;

      // Insert municipios
      if (Array.isArray(data.municipios)) {
        for (const id_municipio of data.municipios) {
          await db.query(
            `
            INSERT INTO metasxmunicipio (id_meta, id_municipio)
            VALUES (?, ?)
            `,
            [id_meta, id_municipio]
          );
        }
      }

      return { id: id_meta };
    } finally {
      db.release();
    }
  },

  // =========================
  // ACTUALIZAR META
  // =========================
  async update(id, data) {
    const db = await openDb();
    try {
      // 1. Validar existencia
      const [existing] = await db.query(
        "SELECT id_meta FROM metas WHERE id_meta = ?",
        [id]
      );
      if (existing.length === 0) {
        throw new Error("Meta no encontrada");
      }

      // 2. Actualizar tabla metas
      await db.query(
        `
        UPDATE metas
        SET
          codigo = ?,
          nombre = ?,
          descripcion = ?,
          cant_ano1 = ?, cant_ano2 = ?, cant_ano3 = ?, cant_ano4 = ?,
          id_unidad = ?,
          val1_pro = ?, val2_pro = ?, val3_pro = ?, val4_pro = ?,
          val1_sgp = ?, val1_reg = ?, val1_cre = ?, val1_mun = ?, val1_otr = ?,
          val2_sgp = ?, val2_reg = ?, val2_cre = ?, val2_mun = ?, val2_otr = ?,
          val3_sgp = ?, val3_reg = ?, val3_cre = ?, val3_mun = ?, val3_otr = ?,
          val4_sgp = ?, val4_reg = ?, val4_cre = ?, val4_mun = ?, val4_otr = ?,

          recurrente = ?,
          id_secretaria = ?,
          fecha_limite = ?,

          cantidad_0_5 = ?,
          cantidad_6_12 = ?,
          cantidad_13_17 = ?,
          cantidad_18_24 = ?,
          cantidad_25_62 = ?,
          cantidad_65_mas = ?,

          cantesp_mujer = ?,
          cantesp_discapacidad = ?,
          cantesp_etnia = ?,
          cantesp_victima = ?,
          cantesp_desmovilizado = ?,
          cantesp_lgtbi = ?,
          cantesp_migrante = ?,
          cantesp_indigente = ?,
          cantesp_privado = ?
        WHERE id_meta = ?
        `,
        [
          data.codigo,
          data.nombre,
          data.descripcion,
          data.cant_ano1 || 0,
          data.cant_ano2 || 0,
          data.cant_ano3 || 0,
          data.cant_ano4 || 0,
          data.id_unidad,
          data.val1_pro, data.val2_pro, data.val3_pro, data.val4_pro,
          data.val1_sgp, data.val1_reg, data.val1_cre, data.val1_mun, data.val1_otr,
          data.val2_sgp, data.val2_reg, data.val2_cre, data.val2_mun, data.val2_otr,
          data.val3_sgp, data.val3_reg, data.val3_cre, data.val3_mun, data.val3_otr,
          data.val4_sgp, data.val4_reg, data.val4_cre, data.val4_mun, data.val4_otr,
          data.recurrente,
          data.id_secretaria,
          data.fecha_limite,

          data.cantidad_0_5,
          data.cantidad_6_12,
          data.cantidad_13_17,
          data.cantidad_18_24,
          data.cantidad_25_62,
          data.cantidad_65_mas,

          data.cantesp_mujer,
          data.cantesp_discapacidad,
          data.cantesp_etnia,
          data.cantesp_victima,
          data.cantesp_desmovilizado,
          data.cantesp_lgtbi,
          data.cantesp_migrante,
          data.cantesp_indigente,
          data.cantesp_privado,
          id,
        ]
      );

      // 3. Actualizar Municipios (Borrar y re-insertar)
      await db.query("DELETE FROM metasxmunicipio WHERE id_meta = ?", [id]);

      if (Array.isArray(data.municipios)) {
        for (const id_municipio of data.municipios) {
          await db.query(
            "INSERT INTO metasxmunicipio (id_meta, id_municipio) VALUES (?, ?)",
            [id, id_municipio]
          );
        }
      }

      return true;
    } finally {
      db.release();
    }
  },

  // =========================
  // ELIMINAR META
  // =========================
  async delete(id) {
    const db = await openDb();
    try {
      // 1. Validar dependencias (Avances)
      const [avances] = await db.query(
        "SELECT id_avance FROM avances WHERE id_meta = ? LIMIT 1",
        [id]
      );
      if (avances.length > 0) {
        throw new Error(
          "No se puede eliminar la meta porque tiene avances registrados."
        );
      }

      // 2. Validar dependencias (Programaciones)
      const [programaciones] = await db.query(
        "SELECT id_programacion FROM programaciones WHERE id_meta = ? LIMIT 1",
        [id]
      );
      if (programaciones.length > 0) {
        throw new Error(
          "No se puede eliminar la meta porque tiene programación registrada."
        );
      }

      await db.query(`DELETE FROM metasxmunicipio WHERE id_meta = ?`, [id]);
      await db.query(`DELETE FROM metas WHERE id_meta = ?`, [id]);
      return true;
    } finally {
      db.release();
    }
  },

  // =========================
  // OBTENER METAS SEGUN FILTROS
  // =========================
  async getFiltered(filters = {}) {
    const db = await openDb();
    try {
      let sql = `
        SELECT DISTINCT
          m.*,
          s.nombre AS secretaria_nombre,
          u.nombre AS unidad_nombre,
          dp.id_plan,

          -- PORCENTAJES
          CASE
            WHEN (m.cant_ano1 + m.cant_ano2 + m.cant_ano3 + m.cant_ano4) > 0
            THEN LEAST(ROUND(COALESCE(av.total_cantidad, 0) * 100.0 / (m.cant_ano1 + m.cant_ano2 + m.cant_ano3 + m.cant_ano4), 2), 100)
            ELSE 0
          END AS porcentaje_fisico,

          CASE
            WHEN m.recurrente = 1 THEN (m.cant_ano1 + m.cant_ano2 + m.cant_ano3 + m.cant_ano4) / 4
            ELSE (m.cant_ano1 + m.cant_ano2 + m.cant_ano3 + m.cant_ano4)
          END AS cantidad,

          CASE
            WHEN m.recurrente = 1 THEN COALESCE(av.total_cantidad, 0) / 4
            ELSE COALESCE(av.total_cantidad, 0)
          END AS acumulado_fisico,

          CASE
            WHEN (
              m.val1_pro + m.val2_pro + m.val3_pro + m.val4_pro +
              m.val1_sgp + m.val2_sgp + m.val3_sgp + m.val4_sgp +
              m.val1_reg + m.val2_reg + m.val3_reg + m.val4_reg +
              m.val1_cre + m.val2_cre + m.val3_cre + m.val4_cre +
              m.val1_mun + m.val2_mun + m.val3_mun + m.val4_mun +
              m.val1_otr + m.val2_otr + m.val3_otr + m.val4_otr
            ) > 0
            THEN LEAST(ROUND(
              COALESCE(av.total_gasto, 0) * 100.0 /
              (
                m.val1_pro + m.val2_pro + m.val3_pro + m.val4_pro +
                m.val1_sgp + m.val2_sgp + m.val3_sgp + m.val4_sgp +
                m.val1_reg + m.val2_reg + m.val3_reg + m.val4_reg +
                m.val1_cre + m.val2_cre + m.val3_cre + m.val4_cre +
                m.val1_mun + m.val2_mun + m.val3_mun + m.val4_mun +
                m.val1_otr + m.val2_otr + m.val3_otr + m.val4_otr
              ),
              2
            ), 100)
            ELSE 0
          END AS porcentaje_financiero,

          -- Estado de progreso
          CASE
            WHEN
              COALESCE(av.total_cantidad, 0) = 0
              OR (m.cant_ano1 + m.cant_ano2 + m.cant_ano3 + m.cant_ano4) = 0
            THEN 'SIN_INICIAR'

            WHEN
              ROUND(COALESCE(av.total_cantidad, 0) * 100.0 / (m.cant_ano1 + m.cant_ano2 + m.cant_ano3 + m.cant_ano4), 2) >= 100
            THEN 'COMPLETADA'

            ELSE 'EN_EJECUCION'
          END AS estadoProgreso,

          -- Arbol de jerarquia
          i.id_detalle   AS iniciativa_id,
          i.codigo       AS iniciativa_codigo,
          i.nombre_detalle AS iniciativa_nombre,

          a.id_detalle   AS apuesta_id,
          a.codigo       AS apuesta_codigo,
          a.nombre_detalle AS apuesta_nombre,

          c.id_detalle   AS componente_id,
          c.codigo       AS componente_codigo,
          c.nombre_detalle AS componente_nombre,

          l.id_detalle   AS linea_id,
          l.codigo       AS linea_codigo,
          l.nombre_detalle AS linea_nombre

        FROM metas m
        INNER JOIN detalles_plan dp ON dp.id_detalle = m.id_detalle
        INNER JOIN planes_desarrollo p ON p.id_plan = dp.id_plan
        LEFT JOIN detalles_plan i ON i.id_detalle = m.id_detalle
        LEFT JOIN detalles_plan a ON a.id_detalle = i.id_detalle_padre
        LEFT JOIN detalles_plan c ON c.id_detalle = a.id_detalle_padre
        LEFT JOIN detalles_plan l ON l.id_detalle = c.id_detalle_padre

        LEFT JOIN (
          SELECT
            id_meta,
            SUM(cantidad) AS total_cantidad,
            SUM(
              IFNULL(gasto_pro,0) + IFNULL(gasto_cre,0) + IFNULL(gasto_sgp,0) +
              IFNULL(gasto_reg,0) + IFNULL(gasto_otr,0) + IFNULL(gasto_mun,0)
            ) AS total_gasto
          FROM avances
          GROUP BY id_meta
        ) av ON av.id_meta = m.id_meta

        LEFT JOIN secretarias s ON s.id_secretaria = m.id_secretaria
        LEFT JOIN metasxmunicipio mxm ON mxm.id_meta = m.id_meta
        LEFT JOIN unidades u ON u.id_unidad = m.id_unidad
        LEFT JOIN municipios mun ON mun.id_municipio = mxm.id_municipio
        WHERE 1 = 1
      `;

      const params = [];

      // ===============================
      // PLAN (OBLIGATORIO)
      // ===============================
      if (!filters.idPlan) {
        throw new Error("idPlan es obligatorio para filtrar metas");
      }

      sql += " AND dp.id_plan = ?";
      params.push(filters.idPlan);

      // ===============================
      // SECRETARÍA
      // ===============================
      if (filters.responsableId) {
        sql += " AND m.id_secretaria = ?";
        params.push(filters.responsableId);
      }

      // ===============================
      // MUNICIPIO
      // ===============================
      if (filters.municipioId) {
        sql += " AND mxm.id_municipio = ?";
        params.push(filters.municipioId);
      }

      // ===============================
      // TEXTO LIBRE
      // ===============================
      if (filters.q) {
        sql += `
          AND (
            m.nombre LIKE ?
            OR m.descripcion LIKE ?
            OR m.codigo LIKE ?
          )
        `;
        params.push(
          `%${filters.q}%`,
          `%${filters.q}%`,
          `%${filters.q}%`
        );
      }

      // ===============================
      // FILTRO POR ESTADO DE PROGRESO
      // ===============================
      if (filters.estadoProgreso) {
        sql += `
          AND (
            CASE
              WHEN
                COALESCE(av.total_cantidad, 0) = 0
                OR (m.cant_ano1 + m.cant_ano2 + m.cant_ano3 + m.cant_ano4) = 0
              THEN 'SIN_INICIAR'
              WHEN
                ROUND(COALESCE(av.total_cantidad, 0) * 100.0 / (m.cant_ano1 + m.cant_ano2 + m.cant_ano3 + m.cant_ano4), 2) >= 100
              THEN 'COMPLETADA'
              ELSE 'EN_EJECUCION'
            END
          ) = ?
        `;
        params.push(filters.estadoProgreso);
      }

      // ===============================
      // ORDER BY
      // ===============================
      sql += " ORDER BY m.codigo ASC";

      // ===============================
      // LIMIT
      // ===============================
      const filtrosOpcionales =
        filters.responsableId ||
        filters.municipioId ||
        filters.q ||
        filters.estadoProgreso;

      if (!filtrosOpcionales) {
        sql += " LIMIT 100";
      }

      const [rows] = await db.query(sql, params);
      return rows;
    } finally {
      db.release();
    }
  },
};
