// src/models/municipiosModel.js
import { openDb } from "../db.js";

export const MunicipiosModel = {
  async getAll() {
    const db = await openDb();
    const rows = await db.all(
      `SELECT id_municipio, id_departamento, codigo_municipio, nombre, id_zona, activo
       FROM municipios
       ORDER BY nombre ASC`
    );
    await db.close();
    return rows;
  },

  async getById(id) {
    const db = await openDb();
    const row = await db.get(`SELECT * FROM municipios WHERE id_municipio = ?`, [id]);
    await db.close();
    return row;
  },

  async create(data) {
    const db = await openDb();
    const { codigo_municipio, nombre, id_zona, id_departamento = 54, activo = 1 } = data;

    const result = await db.run(
      `INSERT INTO municipios (codigo_municipio, nombre, id_zona, id_departamento, activo)
       VALUES (?, ?, ?, ?, ?)`,
      [codigo_municipio, nombre, id_zona, id_departamento, activo]
    );

    await db.close();
    return { id: result.lastID };
  },

  async update(id, data) {
    const db = await openDb();
    const { codigo_municipio, nombre, id_zona, activo = 1 } = data;

    await db.run(
      `UPDATE municipios
       SET codigo_municipio = ?, nombre = ?, id_zona = ?, activo = ?
       WHERE id_municipio = ?`,
      [codigo_municipio, nombre, id_zona, activo, id]
    );

    await db.close();
    return true;
  },

  async delete(id) {
    const db = await openDb();
    await db.run(`DELETE FROM municipios WHERE id_municipio = ?`, [id]);
    await db.close();
    return true;
  },
};
