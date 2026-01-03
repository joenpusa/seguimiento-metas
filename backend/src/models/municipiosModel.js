// src/models/municipiosModel.js
import { openDb } from "../db.js";

export const MunicipiosModel = {
  async getAll() {
    const db = await openDb();
    try {
      const [rows] = await db.query(
        `SELECT id_municipio, id_departamento, codigo_municipio, nombre, id_zona, activo
         FROM municipios
         ORDER BY nombre ASC`
      );
      return rows;
    } finally {
      db.release();
    }
  },

  async getById(id) {
    const db = await openDb();
    try {
      const [rows] = await db.query(`SELECT * FROM municipios WHERE id_municipio = ?`, [id]);
      return rows[0];
    } finally {
      db.release();
    }
  },

  async create(data) {
    const db = await openDb();
    try {
      const { codigo_municipio, nombre, id_zona, id_departamento = 54, activo = 1 } = data;

      const [result] = await db.query(
        `INSERT INTO municipios (codigo_municipio, nombre, id_zona, id_departamento, activo)
         VALUES (?, ?, ?, ?, ?)`,
        [codigo_municipio, nombre, id_zona, id_departamento, activo]
      );

      return { id: result.insertId };
    } finally {
      db.release();
    }
  },

  async update(id, data) {
    const db = await openDb();
    try {
      const { codigo_municipio, nombre, id_zona, activo = 1 } = data;

      await db.query(
        `UPDATE municipios
         SET codigo_municipio = ?, nombre = ?, id_zona = ?, activo = ?
         WHERE id_municipio = ?`,
        [codigo_municipio, nombre, id_zona, activo, id]
      );

      return true;
    } finally {
      db.release();
    }
  },

  async delete(id) {
    const db = await openDb();
    try {
      await db.query(`DELETE FROM municipios WHERE id_municipio = ?`, [id]);
      return true;
    } finally {
      db.release();
    }
  },
};
