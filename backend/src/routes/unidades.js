import express from "express";
import { authenticateToken, requireRole } from "../middleware/authMiddleware.js";
import { UnidadesModel } from "../models/unidadesModel.js";

const router = express.Router();

// =============================================
// 🔹 GET /api/unidades
// =============================================
router.get("/", authenticateToken, async (req, res) => {
  try {
    const data = await UnidadesModel.getAll();
    res.json(data);
  } catch (err) {
    console.error("Error al obtener unidades:", err);
    res.status(500).json({ message: "Error al obtener unidades" });
  }
});

// =============================================
// 🔹 GET /api/unidades/:id
// =============================================
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const unidad = await UnidadesModel.getById(req.params.id);

    if (!unidad) {
      return res.status(404).json({ message: "Unidad no encontrada" });
    }

    res.json(unidad);
  } catch (err) {
    console.error("Error al obtener unidad:", err);
    res.status(500).json({ message: "Error al obtener la unidad" });
  }
});

// =============================================
// 🔹 POST /api/unidades
// =============================================
router.post("/", authenticateToken, requireRole("admin"), async (req, res) => {
  try {
    const { nombre, codigo } = req.body;

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ message: "El nombre es obligatorio" });
    }

    if (!codigo || !codigo.trim()) {
      return res.status(400).json({ message: "El código es obligatorio" });
    }

    const result = await UnidadesModel.create(req.body);

    res.status(201).json({
      message: "Unidad creada correctamente",
      id: result.id,
    });
  } catch (err) {
    console.error("Error al crear unidad:", err);
    res.status(500).json({ message: "Error al crear unidad" });
  }
});

// =============================================
// 🔹 PUT /api/unidades/:id
// =============================================
router.put("/:id", authenticateToken, requireRole("admin"), async (req, res) => {
  try {
    const unidad = await UnidadesModel.getById(req.params.id);

    if (!unidad) {
      return res.status(404).json({ message: "Unidad no encontrada" });
    }

    const { nombre, codigo } = req.body;

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ message: "El nombre es obligatorio" });
    }

    if (!codigo || !codigo.trim()) {
      return res.status(400).json({ message: "El código es obligatorio" });
    }

    await UnidadesModel.update(req.params.id, req.body);

    res.json({ message: "Unidad actualizada correctamente" });
  } catch (err) {
    console.error("Error al actualizar unidad:", err);
    res.status(500).json({ message: "Error al actualizar unidad" });
  }
});

// =============================================
// 🔹 DELETE /api/unidades/:id
// =============================================
router.delete("/:id", authenticateToken, requireRole("admin"), async (req, res) => {
  try {
    const unidad = await UnidadesModel.getById(req.params.id);

    if (!unidad) {
      return res.status(404).json({ message: "Unidad no encontrada" });
    }

    await UnidadesModel.delete(req.params.id);

    res.json({ message: "Unidad eliminada correctamente" });
  } catch (err) {
    console.error("Error al eliminar unidad:", err);
    res.status(500).json({ message: "Error al eliminar unidad" });
  }
});

export default router;
