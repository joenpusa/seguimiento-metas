import { openDb } from "../db.js";

export const ProgramacionesModel = {
  // =========================
  // LISTAR POR META
  // =========================
  async getByMeta(idMeta) {
    const db = await openDb();

    try {
      const [rows] = await db.query(
        `
        SELECT
          p.id_programacion,
          p.id_meta,
          p.anio,
          p.trimestre,

          -- Programado
          p.cantidad AS cantidad_programada,
          p.gasto AS gasto_programado,

          -- Avance (puede ser null)
          a.id_avance,
          a.cantidad AS cantidad_avance,
          a.gasto AS gasto_avance,

          -- Estado calculado
          CASE
            WHEN a.id_avance IS NOT NULL THEN 'reportado'
            WHEN (
              (p.anio * 10 +
                CASE p.trimestre
                  WHEN 'T1' THEN 1
                  WHEN 'T2' THEN 2
                  WHEN 'T3' THEN 3
                  WHEN 'T4' THEN 4
                END
              )
              >
              (YEAR(NOW()) * 10 + QUARTER(NOW()))
            ) THEN 'pendiente'
            ELSE 'vencido'
          END AS estado,

          p.created_at

        FROM programaciones p
        LEFT JOIN avances a
          ON a.id_meta = p.id_meta
        AND a.anio = p.anio
        AND a.trimestre = p.trimestre

        WHERE p.id_meta = ?
        ORDER BY p.anio DESC, p.trimestre DESC
        `,
        [idMeta]
      );
      return rows;
    } finally {
      db.release();
    }
  },

  // =========================
  // VALIDAR DUPLICADO
  // =========================
  async existsCombination({ id_meta, anio, trimestre }, excludeId = null) {
    const db = await openDb();
    try {
      let query = `
        SELECT id_programacion
        FROM programaciones
        WHERE id_meta = ?
          AND anio = ?
          AND trimestre = ?
      `;

      const params = [id_meta, anio, trimestre];

      if (excludeId) {
        query += ` AND id_programacion != ?`;
        params.push(excludeId);
      }

      const [rows] = await db.query(query, params);
      return rows.length > 0;
    } finally {
      db.release();
    }
  },

  // =========================
  // CREAR
  // =========================
  async create(data) {
    const db = await openDb();
    try {
      const { id_meta, anio, trimestre, cantidad = 0, gasto = 0 } = data;

      const [result] = await db.query(
        `
        INSERT INTO programaciones
          (id_meta, anio, trimestre, cantidad, gasto)
        VALUES (?, ?, ?, ?, ?)
        `,
        [id_meta, anio, trimestre, cantidad, gasto]
      );

      return { id: result.insertId };
    } finally {
      db.release();
    }
  },

  // =========================
  // OBTENER POR ID
  // =========================
  async getById(id) {
    const db = await openDb();
    try {
      const [rows] = await db.query(
        `SELECT * FROM programaciones WHERE id_programacion = ?`,
        [id]
      );
      return rows[0];
    } finally {
      db.release();
    }
  },

  // =========================
  // ACTUALIZAR
  // =========================
  async update(id, data) {
    const db = await openDb();
    try {
      const { anio, trimestre, cantidad = 0, gasto = 0 } = data;

      await db.query(
        `
        UPDATE programaciones
        SET anio = ?, trimestre = ?, cantidad = ?, gasto = ?
        WHERE id_programacion = ?
        `,
        [anio, trimestre, cantidad, gasto, id]
      );

      return true;
    } finally {
      db.release();
    }
  },

  async getSiguienteTrimestre(idMeta, anioInicio, anioFin) {
    const db = await openDb();
    try {
      const [rows] = await db.query(
        `
        SELECT anio, trimestre
        FROM programaciones
        WHERE id_meta = ?
        ORDER BY anio ASC, trimestre ASC
        `,
        [idMeta]
      );

      const trimestres = ["T1", "T2", "T3", "T4"];
      const programados = new Set(
        rows.map(r => `${r.anio}-${r.trimestre}`)
      );

      for (let anio = anioInicio; anio <= anioFin; anio++) {
        for (const t of trimestres) {
          const key = `${anio}-${t}`;
          if (!programados.has(key)) {
            return { anio, trimestre: t };
          }
        }
      }

      return null;
    } finally {
      db.release();
    }
  },

};
