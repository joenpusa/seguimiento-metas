import { openDb } from "../db.js";

export const AvancesModel = {

  // =============================================
  // 📌 Obtener avances (con filtros)
  // =============================================
  async getAll(filters = {}) {
    const db = await openDb();

    const {
      idPlan,
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

    if (idPlan) {
      conditions.push("m.id_plan = ?");
      params.push(idPlan);
    }

    const whereClause =
      conditions.length > 0
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

    const rows = await db.all(
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

        a.cantidad_0_5,
        a.cantidad_6_12,
        a.cantidad_13_17,
        a.cantidad_18_24,
        a.cantidad_25_62,
        a.cantidad_65_mas,

        a.cantesp_mujer,
        a.cantesp_discapacidad,
        a.cantesp_etnia,
        a.cantesp_victima,
        a.cantesp_desmovilizado,
        a.cantesp_lgtbi,
        a.cantesp_migrante,
        a.cantesp_indigente,
        a.cantesp_privado,

        a.created_at,

        m.nombre AS meta_nombre,
        m.id_secretaria
      FROM avances a
      INNER JOIN metas m ON m.id_meta = a.id_meta
      ${whereClause}
      ORDER BY a.created_at DESC
      `,
      params
    );

    await db.close();
    return rows;
  },

  // =============================================
  // 📌 Obtener avance por ID
  // =============================================
  async getById(id) {
    const db = await openDb();

    const row = await db.get(
      `SELECT * FROM avances WHERE id_avance = ?`,
      [id]
    );

    await db.close();
    return row;
  },

  // =============================================
  // 📌 Crear avance
  // =============================================
  async create(data) {
    const db = await openDb();

    const result = await db.run(
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
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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

    await db.close();
    return { id: result.lastID };
  },

  // =============================================
  // 📌 Actualizar avance
  // =============================================
  async update(id, data) {
    const db = await openDb();

    await db.run(
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

    await db.close();
    return true;
  },

  // =============================================
  // 📌 Eliminar avance
  // =============================================
  async delete(id) {
    const db = await openDb();

    await db.run(
      `DELETE FROM avances WHERE id_avance = ?`,
      [id]
    );

    await db.close();
    return true;
  },
};
