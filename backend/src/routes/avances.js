import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { AvancesModel } from "../models/avancesModel.js";

const router = express.Router();

// 🔹 GET /api/avances
router.get("/", authenticateToken, async (req, res) => {
  try {
    const data = await AvancesModel.getAll(req.query);
    res.json(data);
  } catch (err) {
    console.error("Error al obtener avances:", err);
    res.status(500).json({ message: "Error al obtener avances" });
  }
});

// 🔹 GET /api/avances/:id
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const avance = await AvancesModel.getById(req.params.id);

    if (!avance) {
      return res.status(404).json({ message: "Avance no encontrado" });
    }

    res.json(avance);
  } catch (err) {
    console.error("Error al obtener avance:", err);
    res.status(500).json({ message: "Error al obtener avance" });
  }
});

// 🔹 POST /api/avances
router.post("/", authenticateToken, async (req, res) => {
  try {
    const result = await AvancesModel.create(req.body);

    res.status(201).json({
      message: "Avance creado correctamente",
      id: result.id,
    });
  } catch (err) {
    if (err.message?.includes("UNIQUE")) {
      return res
        .status(409)
        .json({ message: "Ya existe un avance para ese meta, año y trimestre" });
    }

    console.error("Error al crear avance:", err);
    res.status(500).json({ message: "Error al crear avance" });
  }
});

// 🔹 PUT /api/avances/:id
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const avance = await AvancesModel.getById(req.params.id);

    if (!avance) {
      return res.status(404).json({ message: "Avance no encontrado" });
    }

    await AvancesModel.update(req.params.id, req.body);

    res.json({ message: "Avance actualizado correctamente" });
  } catch (err) {
    console.error("Error al actualizar avance:", err);
    res.status(500).json({ message: "Error al actualizar avance" });
  }
});

// 🔹 DELETE /api/avances/:id
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const avance = await AvancesModel.getById(req.params.id);

    if (!avance) {
      return res.status(404).json({ message: "Avance no encontrado" });
    }

    await AvancesModel.delete(req.params.id);

    res.json({ message: "Avance eliminado correctamente" });
  } catch (err) {
    console.error("Error al eliminar avance:", err);
    res.status(500).json({ message: "Error al eliminar avance" });
  }
});

export default router;
