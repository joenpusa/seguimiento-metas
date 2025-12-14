import { openDb } from "../db.js";

export const DetallesPlanModel = {

  // =============================================
  // 📌 Obtener detalles por plan
  // =============================================
  async getByPlan(idPlan) {
    const db = await openDb();

    const rows = await db.all(
      `
      SELECT
        id_detalle,
        id_plan,
        nombre_detalle,
        id_detalle_padre,
        codigo,
        created_at
      FROM detalles_plan
      WHERE id_plan = ?
      ORDER BY codigo ASC
      `,
      [idPlan]
    );

    await db.close();
    return rows;
  },

  // =============================================
  // 📌 Obtener detalle por ID
  // =============================================
  async getById(id) {
    const db = await openDb();

    const row = await db.get(
      `
      SELECT
        id_detalle,
        id_plan,
        nombre_detalle,
        id_detalle_padre,
        codigo,
        created_at
      FROM detalles_plan
      WHERE id_detalle = ?
      `,
      [id]
    );

    await db.close();
    return row;
  },

  // =============================================
  // 📌 Crear detalle
  // =============================================
  async create(data) {
    const db = await openDb();

    const {
      id_plan,
      nombre_detalle,
      id_detalle_padre,
      codigo
    } = data;

    const result = await db.run(
      `
      INSERT INTO detalles_plan (
        id_plan,
        nombre_detalle,
        id_detalle_padre,
        codigo
      ) VALUES (?, ?, ?, ?)
      `,
      [
        id_plan,
        nombre_detalle,
        id_detalle_padre || null,
        codigo
      ]
    );

    await db.close();
    return { id: result.lastID };
  },

  // =============================================
  // 📌 Actualizar detalle
  // =============================================
  async update(id, data) {
    const db = await openDb();

    const fields = [];
    const values = [];

    if (data.nombre_detalle !== undefined) {
      fields.push("nombre_detalle = ?");
      values.push(data.nombre_detalle);
    }

    if (data.codigo !== undefined) {
      fields.push("codigo = ?");
      values.push(data.codigo);
    }

    if (fields.length === 0) {
      await db.close();
      return false;
    }

    values.push(id);

    await db.run(
      `UPDATE detalles_plan SET ${fields.join(", ")} WHERE id_detalle = ?`,
      values
    );

    await db.close();
    return true;
  },

  // =============================================
  // 📌 Eliminar detalle
  // (nota: no soft delete porque es estructura)
  // =============================================
  async delete(id) {
    const db = await openDb();

    await db.run(
      `DELETE FROM detalles_plan WHERE id_detalle = ?`,
      [id]
    );

    await db.close();
    return true;
  },

  // =============================================
  // 📌 Verificar si tiene hijos
  // =============================================
  async hasChildren(id) {
    const db = await openDb();

    const row = await db.get(
      `
      SELECT COUNT(*) as total
      FROM detalles_plan
      WHERE id_detalle_padre = ?
      `,
      [id]
    );

    await db.close();
    return row.total > 0;
  }
};
