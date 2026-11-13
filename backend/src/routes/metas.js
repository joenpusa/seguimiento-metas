// src/routes/metas.js
import express from "express";
import { authenticateToken, requireRole } from "../middleware/authMiddleware.js";
import { MetasModel } from "../models/metasModel.js";

const router = express.Router();

// ===============================
// GET /api/metas/codigo/:codigo/seguimiento
// Detalle completo (Programado vs Ejecutado) por Código de la meta
// ===============================
router.get(
  "/codigo/:codigo/seguimiento",
  authenticateToken,
  async (req, res) => {
    try {
      const { codigo } = req.params;
      const { idPlan } = req.query;

      const data = await MetasModel.getDetalladoMetaByCodigo(
        codigo,
        idPlan ? Number(idPlan) : null
      );

      if (!data) {
        return res.status(404).json({
          message: idPlan
            ? `Meta con código '${codigo}' no encontrada en el plan indicado (${idPlan})`
            : `Meta con código '${codigo}' no encontrada en el plan de desarrollo activo`,
        });
      }

      res.json(data);
    } catch (err) {
      console.error("Error al obtener seguimiento de meta por código:", err);
      res.status(500).json({ message: "Error al obtener seguimiento de meta" });
    }
  }
);

// ===============================
// GET /api/metas/codigo/:codigo
// Obtener una meta por Código (en el plan activo o específico)
// ===============================
router.get(
  "/codigo/:codigo",
  authenticateToken,
  async (req, res) => {
    try {
      const { codigo } = req.params;
      const { idPlan } = req.query;

      const meta = await MetasModel.getByCodigo(
        codigo,
        idPlan ? Number(idPlan) : null
      );

      if (!meta) {
        return res.status(404).json({
          message: idPlan
            ? `Meta con código '${codigo}' no encontrada en el plan indicado (${idPlan})`
            : `Meta con código '${codigo}' no encontrada en el plan de desarrollo activo`,
        });
      }

      res.json(meta);
    } catch (err) {
      console.error("Error al obtener la meta por código:", err);
      res.status(500).json({ message: "Error al obtener la meta" });
    }
  }
);

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
// GET /api/metas/seguimiento/:id 
// Detalle completo (Programado vs Ejecutado) por ID (o código)
// ===============================
router.get(
  "/seguimiento/:id",
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      let data = null;

      if (!isNaN(Number(id))) {
        data = await MetasModel.getDetalladoMeta(id);
      }

      // Fallback si no fue ID numérico o no se encontró
      if (!data) {
        data = await MetasModel.getDetalladoMetaByCodigo(id);
      }

      if (!data) {
        return res.status(404).json({ message: "Meta no encontrada" });
      }

      res.json(data);
    } catch (err) {
      console.error("Error al obtener seguimiento de meta:", err);
      res.status(500).json({ message: "Error al obtener seguimiento de meta" });
    }
  }
);

// ===============================
// GET /api/metas/:id
// Obtener una meta por ID (con fallback por código en plan activo)
// ===============================
router.get(
  "/:id",
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      let meta = null;

      if (!isNaN(Number(id))) {
        meta = await MetasModel.getById(id);
      }

      // Si no existe por ID numérico, intentar buscar por código en el plan activo
      if (!meta) {
        meta = await MetasModel.getByCodigo(id);
      }

      if (!meta) {
        return res
          .status(404)
          .json({ message: "Meta no encontrada" });
      }

      res.json(meta);
    } catch (err) {
      console.error("Error al obtener la meta:", err);
      res
        .status(500)
        .json({ message: "Error al obtener la meta" });
    }
  }
);

// ===============================
// POST /api/metas
// ===============================
router.post(
  "/",
  authenticateToken,
  requireRole("admin", "responsable_carga"),
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
        !id_secretaria
      ) {
        return res
          .status(400)
          .json({ message: "Campos requeridos faltantes" });
      }

      if (
        req.user.rol !== "admin" &&
        req.user.id_secretaria !== Number(id_secretaria)
      ) {
        return res.status(403).json({ message: "No tiene permiso para crear metas en esta secretaría" });
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
// PUT /api/metas/:id
// ===============================
router.put(
  "/:id",
  authenticateToken,
  requireRole("admin", "responsable_carga"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const {
        codigo,
        nombre,
        descripcion,
        id_unidad,
        id_secretaria,
        fecha_limite,
      } = req.body;

      if (
        !codigo ||
        !nombre ||
        !descripcion ||
        !id_unidad ||
        !id_secretaria
      ) {
        return res
          .status(400)
          .json({ message: "Campos requeridos faltantes" });
      }

      const meta = await MetasModel.getById(id);
      if (!meta) {
        return res.status(404).json({ message: "Meta no encontrada" });
      }

      if (req.user.rol !== "admin") {
        if (req.user.id_secretaria !== meta.id_secretaria || req.user.id_secretaria !== Number(id_secretaria)) {
          return res.status(403).json({ message: "No tiene permiso para modificar esta meta o asignarla a otra secretaría" });
        }
      }

      await MetasModel.update(id, req.body);

      res.json({ message: "Meta actualizada correctamente" });
    } catch (err) {
      console.error("Error al actualizar meta:", err);
      res.status(500).json({
        message: err.message || "Error al actualizar meta",
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
  requireRole("admin", "responsable_carga"),
  async (req, res) => {
    try {
      const meta = await MetasModel.getById(req.params.id);
      if (!meta) {
        return res.status(404).json({ message: "Meta no encontrada" });
      }

      if (req.user.rol !== "admin" && req.user.id_secretaria !== meta.id_secretaria) {
        return res.status(403).json({ message: "No tiene permiso para eliminar esta meta" });
      }

      await MetasModel.delete(req.params.id);
      res.json({ message: "Meta eliminada correctamente" });
    } catch (err) {
      console.error("Error al eliminar meta:", err);
      res.status(500).json({ message: "Error al eliminar meta" });
    }
  }
);

// ===============================
// METAS SEGÚN FILTROS (O DEL PLAN ACTIVO)
// ===============================
router.get("/", authenticateToken, async (req, res) => {
  try {
    const {
      idPlan,
      responsableId,
      municipioId,
      q,
      estadoProgreso,
      codigo,
      limit,
      all,
    } = req.query;

    const metas = await MetasModel.getFiltered({
      idPlan: idPlan ? Number(idPlan) : null,
      responsableId: responsableId ? Number(responsableId) : null,
      municipioId: municipioId ? Number(municipioId) : null,
      q: q?.trim() || null,
      estadoProgreso: estadoProgreso || null,
      codigo: codigo ? String(codigo).trim() : null,
      limit: limit || (all === "true" || all === "1" ? "all" : null),
    });

    res.json(metas);
  } catch (error) {
    console.error("Error obteniendo metas filtradas:", error);

    res.status(500).json({
      message: "Error obteniendo metas",
      error: error.message,
    });
  }
});

export default router;
