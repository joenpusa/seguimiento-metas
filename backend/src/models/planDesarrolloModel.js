// src/models/planDesarrolloModel.js
import { openDb } from "../db.js";

// =============================================
// ✅ Obtener todos los planes
// =============================================
export async function getAllPlanes() {
  const db = await openDb();
  try {
    const [planes] = await db.query(`
      SELECT 
        id_plan,
        nombre_plan,
        vigencia_inicio,
        vigencia_fin,
        es_activo,
        created_at
      FROM planes_desarrollo
      ORDER BY created_at DESC
    `);
    return planes;
  } finally {
    db.release();
  }
}

// =============================================
// ✅ Obtener un plan por ID
// =============================================
export async function getPlanById(id) {
  const db = await openDb();
  try {
    const [rows] = await db.query(
      `SELECT 
          id_plan,
          nombre_plan,
          vigencia_inicio,
          vigencia_fin,
          es_activo,
          created_at
       FROM planes_desarrollo
       WHERE id_plan = ?`,
      [id]
    );
    return rows[0];
  } finally {
    db.release();
  }
}

// =============================================
// ✅ Crear un nuevo plan (AUTOINCREMENT)
// =============================================
export async function createPlan({ nombrePlan, vigenciaInicio, vigenciaFin }) {
  const db = await openDb();
  try {
    const [result] = await db.query(
      `INSERT INTO planes_desarrollo (nombre_plan, vigencia_inicio, vigencia_fin, es_activo)
       VALUES (?, ?, ?, 0)`,
      [nombrePlan, vigenciaInicio, vigenciaFin]
    );

    const id = result.insertId;

    return {
      id_plan: id,
      nombre_plan: nombrePlan,
      vigencia_inicio: vigenciaInicio,
      vigencia_fin: vigenciaFin,
      es_activo: 0
    };
  } finally {
    db.release();
  }
}

// =============================================
// ✅ Actualizar un plan existente
// =============================================
export async function updatePlan(id, { nombrePlan, vigenciaInicio, vigenciaFin }) {
  const db = await openDb();
  try {
    await db.query(
      `UPDATE planes_desarrollo
       SET nombre_plan = ?, vigencia_inicio = ?, vigencia_fin = ?
       WHERE id_plan = ?`,
      [nombrePlan, vigenciaInicio, vigenciaFin, id]
    );

    return {
      id_plan: id,
      nombre_plan: nombrePlan,
      vigencia_inicio: vigenciaInicio,
      vigencia_fin: vigenciaFin
    };
  } finally {
    db.release();
  }
}

// =============================================
// ✅ Eliminar un plan
// =============================================
export async function deletePlan(id) {
  const db = await openDb();
  try {
    await db.query(`DELETE FROM planes_desarrollo WHERE id_plan = ?`, [id]);
    return true;
  } finally {
    db.release();
  }
}

// =============================================
// ✅ Activar un plan (solo uno activo a la vez)
// =============================================
export async function activatePlan(id) {
  const db = await openDb();
  try {
    // Desactivar todos
    await db.query(`UPDATE planes_desarrollo SET es_activo = 0`);

    // Activar el seleccionado
    await db.query(`UPDATE planes_desarrollo SET es_activo = 1 WHERE id_plan = ?`, [id]);

    return {
      id_plan: id,
      es_activo: 1
    };
  } finally {
    db.release();
  }
}
