// src/models/metasModel.js
import { openDb } from "../db.js";

export const MetasModel = {
  // =========================
  // OBTENER UNA META
  // =========================
  async getById(idMeta) {
    const db = await openDb();

    const sql = `
      SELECT
        m.*,

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
      WHERE m.id_meta = ?
      GROUP BY m.id_meta
    `;

    const meta = await db.get(sql, [idMeta]);

    if (!meta) return null;

    return {
      ...meta,
      municipios: meta.municipios
        ? meta.municipios.split(",").map(Number)
        : [],
    };
  },

  // =========================
  // OBTENER METAS POR DETALLE
  // =========================
  async getByDetalle(id_detalle) {
    const db = await openDb();

    const rows = await db.all(
      `
      SELECT 
        m.*,
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

    await db.close();

    return rows.map((r) => ({
      ...r,
      municipios: r.municipios ? r.municipios.split(",").map(Number) : [],
    }));
  },

  // =========================
  // CREAR META
  // =========================
  async create(data) {
    const db = await openDb();

    // 🔹 Validar foráneas
    const detalle = await db.get(
      `SELECT id_detalle FROM detalles_plan WHERE id_detalle = ?`,
      [data.id_detalle]
    );
    if (!detalle) throw new Error("Detalle no existe");

    const unidad = await db.get(
      `SELECT id_unidad FROM unidades WHERE id_unidad = ?`,
      [data.id_unidad]
    );
    if (!unidad) throw new Error("Unidad no existe");

    const secretaria = await db.get(
      `SELECT id_secretaria FROM secretarias WHERE id_secretaria = ?`,
      [data.id_secretaria]
    );
    if (!secretaria) throw new Error("Secretaría no existe");

    // 🔹 Insert meta
    const result = await db.run(
      `
      INSERT INTO metas (
        codigo,
        nombre,
        descripcion,
        id_detalle,
        cantidad,
        id_unidad,
        valor,
        valor2,
        valor3,
        valor4,
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
        cantesp_privado
      )
      VALUES (?,?,?,?,?,?,?,?,?,
              ?,?,?,?,?,?,?,?,?,?,
              ?,?,?,?,?,?,?,?,?)
      `,
      [
        data.codigo,
        data.nombre,
        data.descripcion,
        data.id_detalle,
        data.cantidad,
        data.id_unidad,
        data.valor,
        data.valor2,
        data.valor3,
        data.valor4,
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
      ]
    );

    const id_meta = result.lastID;

    // 🔹 Insert municipios
    if (Array.isArray(data.municipios)) {
      for (const id_municipio of data.municipios) {
        await db.run(
          `
          INSERT INTO metasxmunicipio (id_meta, id_municipio)
          VALUES (?, ?)
          `,
          [id_meta, id_municipio]
        );
      }
    }

    await db.close();
    return { id: id_meta };
  },

  // =========================
  // ELIMINAR META
  // =========================
  async delete(id) {
    const db = await openDb();

    await db.run(`DELETE FROM metasxmunicipio WHERE id_meta = ?`, [id]);
    await db.run(`DELETE FROM metas WHERE id_meta = ?`, [id]);

    await db.close();
    return true;
  },

  async getFiltered(filters = {}) {
    const db = await openDb();

    let sql = `
      SELECT DISTINCT
        m.*,
        s.nombre AS secretaria_nombre,
        u.nombre AS unidad_nombre,
        dp.id_plan
      FROM metas m
      INNER JOIN detalles_plan dp ON dp.id_detalle = m.id_detalle
      INNER JOIN planes_desarrollo p ON p.id_plan = dp.id_plan
      LEFT JOIN secretarias s ON s.id_secretaria = m.id_secretaria
      LEFT JOIN metasxmunicipio mxm ON mxm.id_meta = m.id_meta
      LEFT JOIN unidades u ON u.id_unidad = m.id_unidad
      LEFT JOIN municipios mun ON mun.id_municipio = mxm.id_municipio
      WHERE 1 = 1
    `;

    const params = [];

    // ===============================
    // 🔴 FILTRO BASE OBLIGATORIO: PLAN
    // ===============================
    if (!filters.idPlan) {
      throw new Error("idPlan es obligatorio para filtrar metas");
    }

    sql += " AND dp.id_plan = ?";
    params.push(filters.idPlan);

    // ===============================
    // 🧑 SECRETARÍA
    // ===============================
    if (filters.responsableId) {
      sql += " AND m.id_secretaria = ?";
      params.push(filters.responsableId);
    }

    // ===============================
    // 🗺️ MUNICIPIO
    // ===============================
    if (filters.municipioId) {
      sql += " AND mxm.id_municipio = ?";
      params.push(filters.municipioId);
    }

    // ===============================
    // 🔍 TEXTO LIBRE
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
    // 📊 ESTADO PROGRESO
    // ===============================
    
    //falta por definir

    // ===============================
    // 🔹 LIMIT solo si no hay filtros adicionales
    // ===============================
    const filtrosOpcionales =
      filters.responsableId ||
      filters.municipioId ||
      filters.q ||
      filters.estadoProgreso;

    if (!filtrosOpcionales) {
      sql += " LIMIT 50";
    }

    return db.all(sql, params);
  },

};
