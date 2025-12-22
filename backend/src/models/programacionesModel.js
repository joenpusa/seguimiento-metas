import { openDb } from "../db.js";

export const ProgramacionesModel = {
  // =========================
  // LISTAR POR META
  // =========================
  async getByMeta(idMeta) {
    const db = await openDb();

    const rows = await db.all(
      `
      SELECT
        p.id_programacion,
        p.id_meta,
        p.anio,
        p.trimestre,

        -- Programado
        p.cantidad AS cantidad_programada,
        p.gasto AS gasto_programado,

        -- Avance (puede ser null)
        a.id_avance,
        a.cantidad AS cantidad_avance,
        a.gasto AS gasto_avance,

        -- Estado calculado
        CASE
          WHEN a.id_avance IS NOT NULL THEN 'reportado'
          WHEN (
            (p.anio * 10 +
              CASE p.trimestre
                WHEN 'T1' THEN 1
                WHEN 'T2' THEN 2
                WHEN 'T3' THEN 3
                WHEN 'T4' THEN 4
              END
            )
            >
            (
              CAST(strftime('%Y','now') AS INTEGER) * 10 +
              CASE
                WHEN CAST(strftime('%m','now') AS INTEGER) BETWEEN 1 AND 3 THEN 1
                WHEN CAST(strftime('%m','now') AS INTEGER) BETWEEN 4 AND 6 THEN 2
                WHEN CAST(strftime('%m','now') AS INTEGER) BETWEEN 7 AND 9 THEN 3
                ELSE 4
              END
            )
          ) THEN 'pendiente'
          ELSE 'vencido'
        END AS estado,

        p.created_at

      FROM programaciones p
      LEFT JOIN avances a
        ON a.id_meta = p.id_meta
      AND a.anio = p.anio
      AND a.trimestre = p.trimestre

      WHERE p.id_meta = ?
      ORDER BY p.anio DESC, p.trimestre DESC
      `,
      [idMeta]
    );

    await db.close();
    return rows;
  },

  // =========================
  // VALIDAR DUPLICADO
  // =========================
  async existsCombination({ id_meta, anio, trimestre }, excludeId = null) {
    const db = await openDb();

    let query = `
      SELECT id_programacion
      FROM programaciones
      WHERE id_meta = ?
        AND anio = ?
        AND trimestre = ?
    `;

    const params = [id_meta, anio, trimestre];

    if (excludeId) {
      query += ` AND id_programacion != ?`;
      params.push(excludeId);
    }

    const row = await db.get(query, params);
    await db.close();

    return !!row;
  },

  // =========================
  // CREAR
  // =========================
  async create(data) {
    const db = await openDb();
    const { id_meta, anio, trimestre, cantidad = 0, gasto = 0 } = data;

    const result = await db.run(
      `
      INSERT INTO programaciones
        (id_meta, anio, trimestre, cantidad, gasto)
      VALUES (?, ?, ?, ?, ?)
      `,
      [id_meta, anio, trimestre, cantidad, gasto]
    );

    await db.close();
    return { id: result.lastID };
  },

  // =========================
  // OBTENER POR ID
  // =========================
  async getById(id) {
    const db = await openDb();
    const row = await db.get(
      `SELECT * FROM programaciones WHERE id_programacion = ?`,
      [id]
    );
    await db.close();
    return row;
  },

  // =========================
  // ACTUALIZAR
  // =========================
  async update(id, data) {
    const db = await openDb();
    const { anio, trimestre, cantidad = 0, gasto = 0 } = data;

    await db.run(
      `
      UPDATE programaciones
      SET anio = ?, trimestre = ?, cantidad = ?, gasto = ?
      WHERE id_programacion = ?
      `,
      [anio, trimestre, cantidad, gasto, id]
    );

    await db.close();
    return true;
  },

  async getSiguienteTrimestre(idMeta, anioInicio, anioFin) {
    const db = await openDb();
    const rows = await db.all(
      `
      SELECT anio, trimestre
      FROM programaciones
      WHERE id_meta = ?
      ORDER BY anio ASC, trimestre ASC
      `,
      [idMeta]
    );

    await db.close();

    const trimestres = ["T1", "T2", "T3", "T4"];
    const programados = new Set(
      rows.map(r => `${r.anio}-${r.trimestre}`)
    );

    for (let anio = anioInicio; anio <= anioFin; anio++) {
      for (const t of trimestres) {
        const key = `${anio}-${t}`;
        if (!programados.has(key)) {
          return { anio, trimestre: t };
        }
      }
    }

    return null;
  },

};
