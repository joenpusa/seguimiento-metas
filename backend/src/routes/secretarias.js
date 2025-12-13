// src/routes/secretarias.js
import express from "express";
import { authenticateToken, requireRole } from "../middleware/authMiddleware.js";
import { SecretariasModel } from "../models/secretariasModel.js";

const router = express.Router();

// 🔹 GET /api/secretarias
router.get("/", authenticateToken, async (req, res) => {
  try {
    const data = await SecretariasModel.getAll();
    res.json(data);
  } catch (err) {
    console.error("Error al obtener secretarías:", err);
    res.status(500).json({ message: "Error al obtener secretarías" });
  }
});

// 🔹 GET /api/secretarias/:id
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const secretaria = await SecretariasModel.getById(req.params.id);

    if (!secretaria) {
      return res.status(404).json({ message: "Secretaría no encontrada" });
    }

    res.json(secretaria);
  } catch (err) {
    console.error("Error al obtener secretaría:", err);
    res.status(500).json({ message: "Error al obtener la secretaría" });
  }
});

// 🔹 POST /api/secretarias
router.post("/", authenticateToken, requireRole("admin"), async (req, res) => {
  try {
    const { nombre } = req.body;

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ message: "El nombre es obligatorio" });
    }

    const result = await SecretariasModel.create(req.body);

    res.status(201).json({
      message: "Secretaría creada correctamente",
      id: result.id,
    });
  } catch (err) {
    console.error("Error al crear secretaría:", err);
    res.status(500).json({ message: "Error al crear secretaría" });
  }
});

// 🔹 PUT /api/secretarias/:id
router.put("/:id", authenticateToken, requireRole("admin"), async (req, res) => {
  try {
    const secretaria = await SecretariasModel.getById(req.params.id);

    if (!secretaria) {
      return res.status(404).json({ message: "Secretaría no encontrada" });
    }

    const { nombre } = req.body;

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ message: "El nombre es obligatorio" });
    }

    await SecretariasModel.update(req.params.id, req.body);

    res.json({ message: "Secretaría actualizada correctamente" });
  } catch (err) {
    console.error("Error al actualizar secretaría:", err);
    res.status(500).json({ message: "Error al actualizar secretaría" });
  }
});

// 🔹 DELETE /api/secretarias/:id
router.delete("/:id", authenticateToken, requireRole("admin"), async (req, res) => {
  try {
    const secretaria = await SecretariasModel.getById(req.params.id);

    if (!secretaria) {
      return res.status(404).json({ message: "Secretaría no encontrada" });
    }

    await SecretariasModel.delete(req.params.id);

    res.json({ message: "Secretaría eliminada correctamente" });
  } catch (err) {
    console.error("Error al eliminar secretaría:", err);
    res.status(500).json({ message: "Error al eliminar secretaría" });
  }
});

export default router;
