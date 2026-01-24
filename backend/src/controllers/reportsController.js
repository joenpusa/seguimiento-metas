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
        rango1_40: 0,
        rango41_70: 0,
        rango71_99: 0,
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
        else if (p <= 40) counts.rango1_40++;
        else if (p <= 70) counts.rango41_70++;
        else if (p < 100) counts.rango71_99++;
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
  }
};
