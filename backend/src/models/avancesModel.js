import { openDb } from "../db.js";

export const AvancesModel = {

  // =============================================
  // 📌 Obtener avances (con filtros)
  // =============================================
  async getAll(filters = {}) {
    const db = await openDb();

    try {
      const {
        idMeta,
        anio,
        trimestre,
        idSecretaria,
      } = filters;

      const conditions = [];
      const params = [];

      if (idMeta) {
        conditions.push("a.id_meta = ?");
        params.push(idMeta);
      }

      if (anio) {
        conditions.push("a.anio = ?");
        params.push(anio);
      }

      if (trimestre) {
        conditions.push("a.trimestre = ?");
        params.push(trimestre);
      }

      if (idSecretaria) {
        conditions.push("m.id_secretaria = ?");
        params.push(idSecretaria);
      }

      const whereClause =
        conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

      const [rows] = await db.query(
        `
        SELECT
          a.id_avance,
          a.anio,
          a.trimestre,
          a.id_meta,
          a.fec_especifica,
          a.descripcion,
          a.cantidad,
          a.gasto,
          a.url_evidencia,
          a.created_at,

          -- Datos de la meta
          m.nombre AS meta_nombre,
          m.cantidad AS meta_cantidad,

          (IFNULL(m.valor,0) + IFNULL(m.valor2,0) + IFNULL(m.valor3,0) + IFNULL(m.valor4,0)) AS meta_presupuesto_total,

          -- % avance financiero (trimestre)
          ROUND(
            CASE
              WHEN (IFNULL(m.valor,0) + IFNULL(m.valor2,0) + IFNULL(m.valor3,0) + IFNULL(m.valor4,0)) > 0
              THEN (a.gasto * 100.0) /
                  (IFNULL(m.valor,0) + IFNULL(m.valor2,0) + IFNULL(m.valor3,0) + IFNULL(m.valor4,0))
              ELSE 0
            END
          , 2) AS porcentaje_financiero,

          -- % avance físico (trimestre)
          ROUND(
            CASE
              WHEN m.cantidad > 0
              THEN (a.cantidad * 100.0) / m.cantidad
              ELSE 0
            END
          , 2) AS porcentaje_fisico,

          -- ¿Es el último avance?
          CASE
            WHEN a.id_avance = (
              SELECT ax.id_avance
              FROM avances ax
              WHERE ax.id_meta = a.id_meta
              ORDER BY
                ax.anio DESC,
                CASE ax.trimestre
                  WHEN 'T1' THEN 1
                  WHEN 'T2' THEN 2
                  WHEN 'T3' THEN 3
                  WHEN 'T4' THEN 4
                END DESC
              LIMIT 1
            )
            THEN 1
            ELSE 0
          END AS es_ultimo

        FROM avances a
        INNER JOIN metas m ON m.id_meta = a.id_meta
        ${whereClause}
        ORDER BY
          a.anio DESC,
          CASE a.trimestre
            WHEN 'T1' THEN 1
            WHEN 'T2' THEN 2
            WHEN 'T3' THEN 3
            WHEN 'T4' THEN 4
          END DESC
        `,
        params
      );
      return rows;
    } finally {
      db.release();
    }
  },


  // =============================================
  // 📌 Obtener avance por ID
  // =============================================
  async getById(id) {
    const db = await openDb();
    try {
      const [rows] = await db.query(
        `SELECT * FROM avances WHERE id_avance = ?`,
        [id]
      );
      return rows[0];
    } finally {
      db.release();
    }
  },

  // =============================================
  // 📌 Crear avance
  // =============================================
  async create(data) {
    const db = await openDb();
    try {
      const [result] = await db.query(
        `
        INSERT INTO avances (
          anio,
          trimestre,
          id_meta,
          fec_especifica,
          descripcion,
          cantidad,
          gasto,
          url_evidencia,

          cantidad_0_5,
          cantidad_6_12,
          cantidad_13_17,
          cantidad_18_24,
          cantidad_25_62,
          cantidad_65_mas,

          cantesp_mujer,
          cantesp_discapacidad,
          cantesp_etnia,
          cantesp_victima,
          cantesp_desmovilizado,
          cantesp_lgtbi,
          cantesp_migrante,
          cantesp_indigente,
          cantesp_privado
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          data.anio,
          data.trimestre,
          data.id_meta,
          data.fec_especifica || null,
          data.descripcion,
          data.cantidad || 0,
          data.gasto || 0,
          data.url_evidencia,

          data.cantidad_0_5 || 0,
          data.cantidad_6_12 || 0,
          data.cantidad_13_17 || 0,
          data.cantidad_18_24 || 0,
          data.cantidad_25_62 || 0,
          data.cantidad_65_mas || 0,

          data.cantesp_mujer || 0,
          data.cantesp_discapacidad || 0,
          data.cantesp_etnia || 0,
          data.cantesp_victima || 0,
          data.cantesp_desmovilizado || 0,
          data.cantesp_lgtbi || 0,
          data.cantesp_migrante || 0,
          data.cantesp_indigente || 0,
          data.cantesp_privado || 0,
        ]
      );
      return { id: result.insertId };
    } finally {
      db.release();
    }
  },

  // =============================================
  // 📌 Actualizar avance
  // =============================================
  async update(id, data) {
    const db = await openDb();
    try {
      await db.query(
        `
        UPDATE avances SET
          fec_especifica = ?,
          descripcion = ?,
          cantidad = ?,
          gasto = ?,
          url_evidencia = ?,

          cantidad_0_5 = ?,
          cantidad_6_12 = ?,
          cantidad_13_17 = ?,
          cantidad_18_24 = ?,
          cantidad_25_62 = ?,
          cantidad_65_mas = ?,

          cantesp_mujer = ?,
          cantesp_discapacidad = ?,
          cantesp_etnia = ?,
          cantesp_victima = ?,
          cantesp_desmovilizado = ?,
          cantesp_lgtbi = ?,
          cantesp_migrante = ?,
          cantesp_indigente = ?,
          cantesp_privado = ?
        WHERE id_avance = ?
        `,
        [
          data.fec_especifica || null,
          data.descripcion,
          data.cantidad || 0,
          data.gasto || 0,
          data.url_evidencia,

          data.cantidad_0_5 || 0,
          data.cantidad_6_12 || 0,
          data.cantidad_13_17 || 0,
          data.cantidad_18_24 || 0,
          data.cantidad_25_62 || 0,
          data.cantidad_65_mas || 0,

          data.cantesp_mujer || 0,
          data.cantesp_discapacidad || 0,
          data.cantesp_etnia || 0,
          data.cantesp_victima || 0,
          data.cantesp_desmovilizado || 0,
          data.cantesp_lgtbi || 0,
          data.cantesp_migrante || 0,
          data.cantesp_indigente || 0,
          data.cantesp_privado || 0,

          id,
        ]
      );
      return true;
    } finally {
      db.release();
    }
  },

  // =============================================
  // 📌 Eliminar avance
  // =============================================
  async delete(id) {
    const db = await openDb();
    try {
      await db.query(
        `DELETE FROM avances WHERE id_avance = ?`,
        [id]
      );
      return true;
    } finally {
      db.release();
    }
  },

  // =============================================
  // ultimo avance de una meta
  // =============================================
  async getUltimoAvancePorMeta(idMeta) {
    const db = await openDb();
    try {
      const [rows] = await db.query(
        `
        SELECT id_avance
        FROM avances
        WHERE id_meta = ?
        ORDER BY
          anio DESC,
          CASE trimestre
            WHEN 'T1' THEN 1
            WHEN 'T2' THEN 2
            WHEN 'T3' THEN 3
            WHEN 'T4' THEN 4
          END DESC
        LIMIT 1
        `,
        [idMeta]
      );
      return rows[0];
    } finally {
      db.release();
    }
  }
};
