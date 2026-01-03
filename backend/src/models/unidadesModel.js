import { openDb } from "../db.js";

export const UnidadesModel = {

  // =============================================
  // 📌 Obtener todas las unidades
  // =============================================
  async getAll() {
    const db = await openDb();
    try {
      const [rows] = await db.query(
        `SELECT
           id_unidad,
           nombre,
           codigo,
           created_at
         FROM unidades
         ORDER BY nombre ASC`
      );
      return rows;
    } finally {
      db.release();
    }
  },

  // =============================================
  // 📌 Obtener unidad por ID
  // =============================================
  async getById(id) {
    const db = await openDb();
    try {
      const [rows] = await db.query(
        `SELECT
           id_unidad,
           nombre,
           codigo,
           created_at
         FROM unidades
         WHERE id_unidad = ?`,
        [id]
      );
      return rows[0];
    } finally {
      db.release();
    }
  },

  // =============================================
  // 📌 Crear unidad
  // =============================================
  async create(data) {
    const db = await openDb();
    try {
      const { nombre, codigo } = data;

      const [result] = await db.query(
        `INSERT INTO unidades (nombre, codigo)
         VALUES (?, ?)`,
        [nombre, codigo]
      );

      return {
        id: result.insertId,
      };
    } finally {
      db.release();
    }
  },

  // =============================================
  // 📌 Actualizar unidad
  // =============================================
  async update(id, data) {
    const db = await openDb();
    try {
      const { nombre, codigo } = data;

      await db.query(
        `UPDATE unidades
         SET nombre = ?, codigo = ?
         WHERE id_unidad = ?`,
        [nombre, codigo, id]
      );

      return true;
    } finally {
      db.release();
    }
  },

  // =============================================
  // 📌 Eliminar unidad
  // =============================================
  async delete(id) {
    const db = await openDb();
    try {
      await db.query(
        `DELETE FROM unidades WHERE id_unidad = ?`,
        [id]
      );
      return true;
    } finally {
      db.release();
    }
  },
};
