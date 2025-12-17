import express from "express";
import { authenticateToken, requireRole } from "../middleware/authMiddleware.js";
import { DetallesPlanModel } from "../models/detallesPlanModel.js";

const router = express.Router();

// =============================================
// GET /api/detalles-plan/:idPlan
// =============================================
router.get(
  "/:idPlan",
  authenticateToken,
  async (req, res) => {
    try {
      const detalles = await DetallesPlanModel.getByPlan(req.params.idPlan);
      res.json(detalles);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error al obtener detalles del plan" });
    }
  }
);

// =============================================
// POST /api/detalles-plan
// =============================================
router.post(
  "/",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    try {
      const {
        id_plan,
        nombre_detalle,
        id_detalle_padre,
        codigo, 
        tipo
      } = req.body;

      if (!id_plan || !nombre_detalle || !codigo || !tipo) {
        return res.status(400).json({
          message: "id_plan, nombre_detalle y codigo son obligatorios"
        });
      }

      if (tipo !== "linea" && !id_detalle_padre) {
        return res.status(400).json({
          message: "Este tipo de elemento requiere un padre"
        });
      }

      const result = await DetallesPlanModel.create({
        id_plan,
        nombre_detalle,
        id_detalle_padre,
        codigo,
        tipo
      });

      res.status(201).json({
        message: "Detalle creado correctamente",
        id_detalle: result.id
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error al crear detalle del plan" });
    }
  }
);

// =============================================
// PUT /api/detalles-plan/:id
// =============================================
router.put(
  "/:id",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    try {
      const detalle = await DetallesPlanModel.getById(req.params.id);

      if (!detalle) {
        return res.status(404).json({ message: "Detalle no encontrado" });
      }

      await DetallesPlanModel.update(req.params.id, req.body);

      res.json({ message: "Detalle actualizado correctamente" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error al actualizar detalle" });
    }
  }
);

// =============================================
// DELETE /api/detalles-plan/:id
// =============================================
router.delete(
  "/:id",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    try {
      const hasChildren = await DetallesPlanModel.hasChildren(req.params.id);

      if (hasChildren) {
        return res.status(400).json({
          message: "No se puede eliminar un detalle que tiene hijos"
        });
      }

      await DetallesPlanModel.delete(req.params.id);

      res.json({ message: "Detalle eliminado correctamente" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error al eliminar detalle" });
    }
  }
);

export default router;
