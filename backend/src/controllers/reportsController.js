import { ReportsModel } from "../models/reportsModel.js";


export const reportsController = {
  // ==========================================
  // REPORTE 1: GENERAL (Dona + Tabla)
  // ==========================================
  async generateGeneralReport(req, res) {
    const { idPlan, year, quarter } = req.body;

    if (!idPlan || !year || !quarter) {
      return res.status(400).json({ error: "Faltan parámetros (idPlan, year, quarter)" });
    }

    try {
      // 1. Obtener datos desde el modelo
      const data = await ReportsModel.getGeneralReportData(idPlan, year, quarter);
      if (!data || !data.plan) {
        return res.status(404).json({ error: "Plan no encontrado o sin datos." });
      }

      const { plan, metas } = data;

      // 2. Calcular distribución (Lógica de negocio)
      let counts = {
        rango0: 0,
        rango_low: 0,      // < 26.25%
        rango_mid: 0,      // >= 26.25% && < 43.75%
        rango_high: 0,     // >= 43.75% && < 100%
        rango100: 0
      };

      metas.forEach(m => {
        const total = parseFloat(m.meta_total) || 0;
        const avance = parseFloat(m.avance_acumulado) || 0;
        let p = 0;
        if (total > 0) {
          p = (avance / total) * 100;
        }
        if (p > 100) p = 100;

        // Añadir el porcentaje calculado a cada meta por si se necesita en el frontend
        m.porcentaje_avance = parseFloat(p.toFixed(2));

        if (p === 0) counts.rango0++;
        else if (p < 26.25) counts.rango_low++;
        else if (p < 43.75) counts.rango_mid++;
        else if (p < 100) counts.rango_high++;
        else counts.rango100++;
      });

      // Retornar JSON para el frontend
      res.json({
        plan,
        metas,
        counts,
        totalMetas: metas.length
      });

    } catch (error) {
      console.error("Error generando reporte:", error);
      res.status(500).json({ error: "Error interno al generar reporte" });
    }
  },

  // ==========================================
  // REPORTE 2: METAS POR LINEAS
  // ==========================================
  async generateLineasReport(req, res) {
    const { idPlan, year, quarter } = req.body;

    if (!idPlan || !year || !quarter) {
      return res.status(400).json({ error: "Faltan parámetros (idPlan, year, quarter)" });
    }

    try {
      // 1. Obtener datos
      const data = await ReportsModel.getLineasReportData(idPlan, year, quarter);
      if (!data || !data.plan) {
        return res.status(404).json({ error: "Plan no encontrado o sin datos." });
      }

      const { plan, metas } = data;

      // 2. Agrupar por Linea
      // Estructura: { [nombreLinea]: { metas: [], counts: {...} } }
      const groups = {};

      metas.forEach(m => {
        const lineaName = m.linea_nombre || "Sin Línea Asignada";

        if (!groups[lineaName]) {
          groups[lineaName] = {
            nombre: lineaName,
            metas: [],
            counts: {
              rango0: 0,
              rango_low: 0,    // < 26.25%
              rango_mid: 0,    // >= 26.25% && < 43.75%
              rango_high: 0,   // >= 43.75% && < 100%
              rango100: 0
            }
          };
        }

        // Calcular porcentaje individual
        const total = parseFloat(m.meta_total) || 0;
        const avance = parseFloat(m.avance_acumulado) || 0;
        let p = 0;
        if (total > 0) {
          p = (avance / total) * 100;
        }
        if (p > 100) p = 100;

        m.porcentaje_avance = parseFloat(p.toFixed(2));

        // Clasificar
        if (p === 0) groups[lineaName].counts.rango0++;
        else if (p < 26.25) groups[lineaName].counts.rango_low++;
        else if (p < 43.75) groups[lineaName].counts.rango_mid++;
        else if (p < 100) groups[lineaName].counts.rango_high++;
        else groups[lineaName].counts.rango100++;

        groups[lineaName].metas.push(m);
      });

      // Convertir object a array
      const lineas = Object.values(groups);

      res.json({
        plan,
        lineas
      });

    } catch (error) {
      console.error("Error generando reporte lineas:", error);
      res.status(500).json({ error: "Error interno al generar reporte" });
    }
  }
};
