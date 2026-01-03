import { openDb } from "../db.js";

export const SecretariasModel = {

  // =============================================
  // 📌 Obtener todas las secretarías
  // =============================================
  async getAll() {
    const db = await openDb();
    try {
      const [rows] = await db.query(
        `SELECT 
           id_secretaria,
           nombre,
           es_activo,
           created_at
         FROM secretarias
         ORDER BY nombre ASC`
      );
      return rows;
    } finally {
      db.release();
    }
  },

  // =============================================
  // 📌 Obtener secretaría por ID
  // =============================================
  async getById(id) {
    const db = await openDb();
    try {
      const [rows] = await db.query(
        `SELECT 
           id_secretaria,
           nombre,
           es_activo,
           created_at
         FROM secretarias
         WHERE id_secretaria = ?`,
        [id]
      );
      return rows[0];
    } finally {
      db.release();
    }
  },

  // =============================================
  // 📌 Crear secretaría
  // =============================================
  async create(data) {
    const db = await openDb();
    try {
      const { nombre, es_activo = 1 } = data;

      const [result] = await db.query(
        `INSERT INTO secretarias (nombre, es_activo)
         VALUES (?, ?)`,
        [nombre, es_activo]
      );

      return {
        id: result.insertId
      };
    } finally {
      db.release();
    }
  },

  // =============================================
  // 📌 Actualizar secretaría
  // =============================================
  async update(id, data) {
    const db = await openDb();
    try {
      const { nombre, es_activo = 1 } = data;

      await db.query(
        `UPDATE secretarias
         SET nombre = ?, es_activo = ?
         WHERE id_secretaria = ?`,
        [nombre, es_activo, id]
      );

      return true;
    } finally {
      db.release();
    }
  },

  // =============================================
  // 📌 Eliminar secretaría
  // =============================================
  async delete(id) {
    const db = await openDb();
    try {
      await db.query(
        `DELETE FROM secretarias WHERE id_secretaria = ?`,
        [id]
      );
      return true;
    } finally {
      db.release();
    }
  },
};
