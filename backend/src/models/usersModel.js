// src/models/usersModel.js
import { openDb } from "../db.js";

export const UsersModel = {

  // =============================================
  // 📌 Obtener todos los usuarios
  // =============================================
  async getAll() {
    const db = await openDb();
    try {
      const [rows] = await db.query(`
        SELECT
          id_usuario,
          email,
          nombre,
          rol,
          es_activo,
          id_secretaria,
          requiereCambioClave,
          created_at
        FROM users
        ORDER BY nombre ASC
      `);
      return rows;
    } finally {
      db.release();
    }
  },

  // =============================================
  // 📌 Obtener usuario por ID
  // =============================================
  async getById(id) {
    const db = await openDb();
    try {
      const [rows] = await db.query(
        `
        SELECT
          id_usuario,
          email,
          nombre,
          rol,
          es_activo,
          id_secretaria,
          requiereCambioClave,
          created_at
        FROM users
        WHERE id_usuario = ?
        `,
        [id]
      );
      return rows[0];
    } finally {
      db.release();
    }
  },

  // =============================================
  // 📌 Obtener usuario por email (LOGIN)
  // =============================================
  async getByEmail(email) {
    const db = await openDb();
    try {
      const [rows] = await db.query(
        `
        SELECT
          id_usuario,
          email,
          nombre,
          rol,
          es_activo,
          id_secretaria,
          password,
          requiereCambioClave
        FROM users
        WHERE email = ?
        `,
        [email]
      );
      return rows[0];
    } finally {
      db.release();
    }
  },

  // =============================================
  // 📌 Crear usuario
  // =============================================
  async create(data) {
    const db = await openDb();
    try {
      const {
        email,
        nombre,
        rol,
        id_secretaria,
        passwordHash
      } = data;

      const [result] = await db.query(
        `
        INSERT INTO users (
          email,
          nombre,
          rol,
          id_secretaria,
          password,
          requiereCambioClave,
          es_activo
        ) VALUES (?, ?, ?, ?, ?, 1, 1)
        `,
        [email, nombre, rol, id_secretaria, passwordHash]
      );
      return { id: result.insertId };
    } finally {
      db.release();
    }
  },

  // =============================================
  // 📌 Actualizar usuario
  // =============================================
  async update(id, data) {
    const db = await openDb();
    try {
      const fields = [];
      const values = [];

      if (data.email !== undefined) {
        fields.push("email = ?");
        values.push(data.email);
      }
      if (data.nombre !== undefined) {
        fields.push("nombre = ?");
        values.push(data.nombre);
      }
      if (data.rol !== undefined) {
        fields.push("rol = ?");
        values.push(data.rol);
      }
      if (data.es_activo !== undefined) {
        fields.push("es_activo = ?");
        values.push(data.es_activo);
      }
      if (data.id_secretaria !== undefined) {
        fields.push("id_secretaria = ?");
        values.push(data.id_secretaria);
      }

      values.push(id);

      await db.query(
        `UPDATE users SET ${fields.join(", ")} WHERE id_usuario = ?`,
        values
      );
      return true;
    } finally {
      db.release();
    }
  },


  // =============================================
  // 📌 Actualizar contraseña
  // =============================================
  async updatePassword(id, passwordHash) {
    const db = await openDb();
    try {
      await db.query(`UPDATE users SET password = ?, requiereCambioClave = 0 WHERE id_usuario = ?`, [
        passwordHash,
        id,
      ]);
      return true;
    } finally {
      db.release();
    }
  },

  async forcePasswordReset(id, passwordHash) {
    const db = await openDb();
    try {
      await db.query(`UPDATE users SET password = ?, requiereCambioClave = 1 WHERE id_usuario = ?`, [
        passwordHash,
        id,
      ]);
      return true;
    } finally {
      db.release();
    }
  },

  // =============================================
  // 📌 Soft delete
  // =============================================
  async deactivate(id) {
    const db = await openDb();
    try {
      await db.query(
        `UPDATE users SET es_activo = 0 WHERE id_usuario = ?`,
        [id]
      );
      return true;
    } finally {
      db.release();
    }
  }
};
