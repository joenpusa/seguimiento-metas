import { openDb } from "../db.js";

export const SecretariasModel = {

  // =============================================
  // 📌 Obtener todas las secretarías
  // =============================================
  async getAll() {
    const db = await openDb();

    const rows = await db.all(
      `SELECT 
         id_secretaria,
         nombre,
         es_activo,
         created_at
       FROM secretarias
       ORDER BY nombre ASC`
    );

    await db.close();
    return rows;
  },

  // =============================================
  // 📌 Obtener secretaría por ID
  // =============================================
  async getById(id) {
    const db = await openDb();

    const row = await db.get(
      `SELECT 
         id_secretaria,
         nombre,
         es_activo,
         created_at
       FROM secretarias
       WHERE id_secretaria = ?`,
      [id]
    );

    await db.close();
    return row;
  },

  // =============================================
  // 📌 Crear secretaría
  // =============================================
  async create(data) {
    const db = await openDb();
    const { nombre, es_activo = 1 } = data;

    const result = await db.run(
      `INSERT INTO secretarias (nombre, es_activo)
       VALUES (?, ?)`,
      [nombre, es_activo]
    );

    await db.close();

    return {
      id: result.lastID
    };
  },

  // =============================================
  // 📌 Actualizar secretaría
  // =============================================
  async update(id, data) {
    const db = await openDb();
    const { nombre, es_activo = 1 } = data;

    await db.run(
      `UPDATE secretarias
       SET nombre = ?, es_activo = ?
       WHERE id_secretaria = ?`,
      [nombre, es_activo, id]
    );

    await db.close();
    return true;
  },

  // =============================================
  // 📌 Eliminar secretaría
  // =============================================
  async delete(id) {
    const db = await openDb();

    await db.run(
      `DELETE FROM secretarias WHERE id_secretaria = ?`,
      [id]
    );

    await db.close();
    return true;
  },
};
