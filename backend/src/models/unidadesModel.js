import { openDb } from "../db.js";

export const UnidadesModel = {

  // =============================================
  // 📌 Obtener todas las unidades
  // =============================================
  async getAll() {
    const db = await openDb();

    const rows = await db.all(
      `SELECT
         id_unidad,
         nombre,
         codigo,
         created_at
       FROM unidades
       ORDER BY nombre ASC`
    );

    await db.close();
    return rows;
  },

  // =============================================
  // 📌 Obtener unidad por ID
  // =============================================
  async getById(id) {
    const db = await openDb();

    const row = await db.get(
      `SELECT
         id_unidad,
         nombre,
         codigo,
         created_at
       FROM unidades
       WHERE id_unidad = ?`,
      [id]
    );

    await db.close();
    return row;
  },

  // =============================================
  // 📌 Crear unidad
  // =============================================
  async create(data) {
    const db = await openDb();
    const { nombre, codigo } = data;

    const result = await db.run(
      `INSERT INTO unidades (nombre, codigo)
       VALUES (?, ?)`,
      [nombre, codigo]
    );

    await db.close();

    return {
      id: result.lastID,
    };
  },

  // =============================================
  // 📌 Actualizar unidad
  // =============================================
  async update(id, data) {
    const db = await openDb();
    const { nombre, codigo } = data;

    await db.run(
      `UPDATE unidades
       SET nombre = ?, codigo = ?
       WHERE id_unidad = ?`,
      [nombre, codigo, id]
    );

    await db.close();
    return true;
  },

  // =============================================
  // 📌 Eliminar unidad
  // =============================================
  async delete(id) {
    const db = await openDb();

    await db.run(
      `DELETE FROM unidades WHERE id_unidad = ?`,
      [id]
    );

    await db.close();
    return true;
  },
};
