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
        id_programacion,
        anio,
        trimestre,
        id_meta,
        cantidad,
        gasto,
        created_at
      FROM programaciones
      WHERE id_meta = ?
      ORDER BY created_at DESC
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
};
