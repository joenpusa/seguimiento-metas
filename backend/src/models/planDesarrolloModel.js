// src/models/planDesarrolloModel.js
import { openDb } from "../db.js";

// =============================================
// ✅ Obtener todos los planes
// =============================================
export async function getAllPlanes() {
  const db = await openDb();
  const planes = await db.all(`
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
  await db.close();
  return planes;
}

// =============================================
// ✅ Obtener un plan por ID
// =============================================
export async function getPlanById(id) {
  const db = await openDb();
  const plan = await db.get(
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
  await db.close();
  return plan;
}

// =============================================
// ✅ Crear un nuevo plan (AUTOINCREMENT)
// =============================================
export async function createPlan({ nombrePlan, vigenciaInicio, vigenciaFin }) {
  const db = await openDb();

  const result = await db.run(
    `INSERT INTO planes_desarrollo (nombre_plan, vigencia_inicio, vigencia_fin, es_activo)
     VALUES (?, ?, ?, 0)`,
    [nombrePlan, vigenciaInicio, vigenciaFin]
  );

  const id = result.lastID; // el id autogenerado de SQLite

  await db.close();

  return {
    id_plan: id,
    nombre_plan: nombrePlan,
    vigencia_inicio: vigenciaInicio,
    vigencia_fin: vigenciaFin,
    es_activo: 0
  };
}

// =============================================
// ✅ Actualizar un plan existente
// =============================================
export async function updatePlan(id, { nombrePlan, vigenciaInicio, vigenciaFin }) {
  const db = await openDb();

  await db.run(
    `UPDATE planes_desarrollo
     SET nombre_plan = ?, vigencia_inicio = ?, vigencia_fin = ?
     WHERE id_plan = ?`,
    [nombrePlan, vigenciaInicio, vigenciaFin, id]
  );

  await db.close();

  return {
    id_plan: id,
    nombre_plan: nombrePlan,
    vigencia_inicio: vigenciaInicio,
    vigencia_fin: vigenciaFin
  };
}

// =============================================
// ✅ Eliminar un plan
// =============================================
export async function deletePlan(id) {
  const db = await openDb();
  await db.run(`DELETE FROM planes_desarrollo WHERE id_plan = ?`, [id]);
  await db.close();
  return true;
}

// =============================================
// ✅ Activar un plan (solo uno activo a la vez)
// =============================================
export async function activatePlan(id) {
  const db = await openDb();

  // Desactivar todos
  await db.run(`UPDATE planes_desarrollo SET es_activo = 0`);

  // Activar el seleccionado
  await db.run(`UPDATE planes_desarrollo SET es_activo = 1 WHERE id_plan = ?`, [id]);

  await db.close();

  return {
    id_plan: id,
    es_activo: 1
  };
}
