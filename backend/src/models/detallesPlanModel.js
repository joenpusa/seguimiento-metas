import { openDb } from "../db.js";

export const DetallesPlanModel = {

  // =============================================
  // 📌 Obtener detalles por plan
  // =============================================
  async getByPlan(idPlan) {
    const db = await openDb();
    try {
      const [rows] = await db.query(
        `
        SELECT
          id_detalle,
          id_plan,
          nombre_detalle,
          id_detalle_padre,
          codigo,
          tipo,
          created_at
        FROM detalles_plan
        WHERE id_plan = ?
        ORDER BY codigo ASC
        `,
        [idPlan]
      );
      return rows;
    } finally {
      db.release();
    }
  },

  // =============================================
  // 📌 Obtener detalle por ID
  // =============================================
  async getById(id) {
    const db = await openDb();
    try {
      const [rows] = await db.query(
        `
        SELECT
          id_detalle,
          id_plan,
          nombre_detalle,
          id_detalle_padre,
          codigo,
          tipo,
          created_at
        FROM detalles_plan
        WHERE id_detalle = ?
        `,
        [id]
      );
      return rows[0];
    } finally {
      db.release();
    }
  },

  // =============================================
  // 📌 Crear detalle (VALIDA CÓDIGO ÚNICO POR PLAN)
  // =============================================
  async create(data) {
    const db = await openDb();
    try {
      const {
        id_plan,
        nombre_detalle,
        id_detalle_padre,
        codigo,
        tipo
      } = data;

      // 🔍 Validar código duplicado en el plan
      const [existe] = await db.query(
        `
        SELECT 1
        FROM detalles_plan
        WHERE id_plan = ?
          AND codigo = ?
        LIMIT 1
        `,
        [id_plan, codigo]
      );

      if (existe.length > 0) {
        throw new Error("Ya existe un elemento con ese código en este plan");
      }

      const [result] = await db.query(
        `
        INSERT INTO detalles_plan (
          id_plan,
          nombre_detalle,
          id_detalle_padre,
          codigo,
          tipo
        ) VALUES (?, ?, ?, ?, ?)
        `,
        [
          id_plan,
          nombre_detalle,
          id_detalle_padre || null,
          codigo,
          tipo
        ]
      );

      return { id_detalle: result.insertId };
    } finally {
      db.release();
    }
  },

  // =============================================
  // 📌 Actualizar detalle (VALIDA CÓDIGO ÚNICO)
  // =============================================
  async update(id, data) {
    const db = await openDb();
    try {
      const fields = [];
      const values = [];

      // 🔍 Si se intenta cambiar el código, validar duplicado
      if (data.codigo !== undefined) {
        const [existe] = await db.query(
          `
          SELECT 1
          FROM detalles_plan
          WHERE id_plan = ?
            AND codigo = ?
            AND id_detalle != ?
          LIMIT 1
          `,
          [data.id_plan, data.codigo, id]
        );

        if (existe.length > 0) {
          throw new Error("Ya existe otro elemento con ese código en este plan");
        }

        fields.push("codigo = ?");
        values.push(data.codigo);
      }

      if (data.nombre_detalle !== undefined) {
        fields.push("nombre_detalle = ?");
        values.push(data.nombre_detalle);
      }

      if (fields.length === 0) {
        return false;
      }

      values.push(id);

      await db.query(
        `UPDATE detalles_plan SET ${fields.join(", ")} WHERE id_detalle = ?`,
        values
      );

      return true;
    } finally {
      db.release();
    }
  },

  // =============================================
  // 📌 Eliminar detalle
  // (nota: no soft delete porque es estructura)
  // =============================================
  async delete(id) {
    const db = await openDb();
    try {
      await db.query(
        `DELETE FROM detalles_plan WHERE id_detalle = ?`,
        [id]
      );
      return true;
    } finally {
      db.release();
    }
  },

  // =============================================
  // 📌 Verificar si tiene hijos
  // =============================================
  async hasChildren(id) {
    const db = await openDb();
    try {
      const [rows] = await db.query(
        `
        SELECT COUNT(*) as total
        FROM detalles_plan
        WHERE id_detalle_padre = ?
        `,
        [id]
      );
      return rows[0].total > 0;
    } finally {
      db.release();
    }
  }
};
