// src/routes/metas.js
import express from "express";
import { authenticateToken, requireRole } from "../middleware/authMiddleware.js";
import { MetasModel } from "../models/metasModel.js";

const router = express.Router();

// ===============================
// GET /api/metas/detalle/:id
// ===============================
router.get(
  "/detalle/:id",
  authenticateToken,
  async (req, res) => {
    try {
      const data = await MetasModel.getByDetalle(req.params.id);
      res.json(data);
    } catch (err) {
      console.error("Error al obtener metas:", err);
      res.status(500).json({ message: "Error al obtener metas" });
    }
  }
);

// ===============================
// POST /api/metas
// ===============================
router.post(
  "/",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    try {
      const {
        codigo,
        nombre,
        descripcion,
        id_detalle,
        id_unidad,
        id_secretaria,
        fecha_limite,
      } = req.body;

      if (
        !codigo ||
        !nombre ||
        !descripcion ||
        !id_detalle ||
        !id_unidad ||
        !id_secretaria ||
        !fecha_limite
      ) {
        return res
          .status(400)
          .json({ message: "Campos requeridos faltantes" });
      }

      const result = await MetasModel.create(req.body);

      res.status(201).json({
        message: "Meta creada correctamente",
        id: result.id,
      });
    } catch (err) {
      console.error("Error al crear meta:", err);
      res.status(500).json({
        message: err.message || "Error al crear meta",
      });
    }
  }
);

// ===============================
// DELETE /api/metas/:id
// ===============================
router.delete(
  "/:id",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    try {
      await MetasModel.delete(req.params.id);
      res.json({ message: "Meta eliminada correctamente" });
    } catch (err) {
      console.error("Error al eliminar meta:", err);
      res.status(500).json({ message: "Error al eliminar meta" });
    }
  }
);

// ===============================
// METAS SEGÚN FILTROS
// ===============================
router.get("/", async (req, res) => {
  try {
    const {
      idPlan,
      responsableId,
      municipioId,
      q,
      estadoProgreso,
    } = req.query;

    // 🔴 VALIDACIÓN OBLIGATORIA
    if (!idPlan) {
      return res.status(400).json({
        message: "El parámetro idPlan es obligatorio",
      });
    }

    const metas = await MetasModel.getFiltered({
      idPlan: Number(idPlan),
      responsableId: responsableId ? Number(responsableId) : null,
      municipioId: municipioId ? Number(municipioId) : null,
      q: q?.trim() || null,
      estadoProgreso: estadoProgreso || null,
    });

    res.json(metas);
  } catch (error) {
    console.error("❌ Error obteniendo metas filtradas:", error);

    // Error de validación desde el modelo
    if (error.message?.includes("idPlan")) {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({
      message: "Error obteniendo metas",
    });
  }
});

export default router;
