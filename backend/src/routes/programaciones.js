import express from "express";
import { authenticateToken, requireRole } from "../middleware/authMiddleware.js";
import { ProgramacionesModel } from "../models/programacionesModel.js";

const router = express.Router();

// =========================
// GET /api/programaciones/meta/:idMeta
// =========================
router.get(
  "/meta/:idMeta",
  authenticateToken,
  async (req, res) => {
    try {
      const { idMeta } = req.params;

      const data = await ProgramacionesModel.getByMeta(idMeta);
      res.json(data);
    } catch (err) {
      console.error("Error al listar programaciones:", err);
      res.status(500).json({ message: "Error al obtener programaciones" });
    }
  }
);

// =========================
// POST /api/programaciones
// =========================
router.post(
  "/",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { id_meta, anio, trimestre } = req.body;

      if (!id_meta || !anio || !trimestre) {
        return res.status(400).json({
          message: "Campos requeridos: id_meta, anio, trimestre",
        });
      }

      const exists = await ProgramacionesModel.existsCombination({
        id_meta,
        anio,
        trimestre,
      });

      if (exists) {
        return res.status(400).json({
          message:
            "Ya existe una programación para esta meta, año y trimestre",
        });
      }

      const result = await ProgramacionesModel.create(req.body);

      res.status(201).json({
        message: "Programación creada correctamente",
        id: result.id,
      });
    } catch (err) {
      console.error("Error al crear programación:", err);
      res.status(500).json({ message: "Error al crear programación" });
    }
  }
);

// =========================
// PUT /api/programaciones/:id
// =========================
router.put(
  "/:id",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { id_meta, anio, trimestre } = req.body;

      const programacion = await ProgramacionesModel.getById(id);
      if (!programacion) {
        return res
          .status(404)
          .json({ message: "Programación no encontrada" });
      }

      const exists = await ProgramacionesModel.existsCombination(
        { id_meta, anio, trimestre },
        id
      );

      if (exists) {
        return res.status(400).json({
          message:
            "Ya existe otra programación con esta meta, año y trimestre",
        });
      }

      await ProgramacionesModel.update(id, req.body);

      res.json({ message: "Programación actualizada correctamente" });
    } catch (err) {
      console.error("Error al actualizar programación:", err);
      res.status(500).json({ message: "Error al actualizar programación" });
    }
  }
);

export default router;
