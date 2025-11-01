// src/routes/municipios.js
import express from "express";
import { authenticateToken, requireRole } from "../middleware/authMiddleware.js";
import { MunicipiosModel } from "../models/municipiosModel.js";

const router = express.Router();

// 🔹 GET /api/municipios
router.get("/", authenticateToken, async (req, res) => {
  try {
    const data = await MunicipiosModel.getAll();
    res.json(data);
  } catch (err) {
    console.error("Error al obtener municipios:", err);
    res.status(500).json({ message: "Error al obtener municipios" });
  }
});

// 🔹 GET /api/municipios/:id
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const municipio = await MunicipiosModel.getById(req.params.id);
    if (!municipio) return res.status(404).json({ message: "Municipio no encontrado" });
    res.json(municipio);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener el municipio" });
  }
});

// 🔹 POST /api/municipios
router.post("/", authenticateToken, requireRole("admin"), async (req, res) => {
  try {
    const { codigo_municipio, nombre, id_zona } = req.body;

    if (!codigo_municipio || !nombre || !id_zona)
      return res.status(400).json({ message: "Campos requeridos faltantes" });

    if (nombre.trim().toLowerCase() === "todo el departamento") {
      return res
        .status(400)
        .json({ message: "No puede añadir 'Todo el departamento' manualmente" });
    }

    const result = await MunicipiosModel.create(req.body);
    res.status(201).json({ message: "Municipio creado", id: result.id });
  } catch (err) {
    console.error("Error al crear municipio:", err);
    res.status(500).json({ message: "Error al crear municipio" });
  }
});

// 🔹 PUT /api/municipios/:id
router.put("/:id", authenticateToken, requireRole("admin"), async (req, res) => {
  try {
    const municipio = await MunicipiosModel.getById(req.params.id);
    if (!municipio) return res.status(404).json({ message: "Municipio no encontrado" });

    if (municipio.nombre.toLowerCase() === "todo el departamento") {
      return res
        .status(400)
        .json({ message: "No se puede editar 'Todo el departamento'" });
    }

    await MunicipiosModel.update(req.params.id, req.body);
    res.json({ message: "Municipio actualizado" });
  } catch (err) {
    console.error("Error al actualizar municipio:", err);
    res.status(500).json({ message: "Error al actualizar municipio" });
  }
});

// 🔹 DELETE /api/municipios/:id
router.delete("/:id", authenticateToken, requireRole("admin"), async (req, res) => {
  try {
    const municipio = await MunicipiosModel.getById(req.params.id);
    if (!municipio) return res.status(404).json({ message: "Municipio no encontrado" });

    if (municipio.nombre.toLowerCase() === "todo el departamento") {
      return res
        .status(400)
        .json({ message: "No se puede eliminar 'Todo el departamento'" });
    }

    await MunicipiosModel.delete(req.params.id);
    res.json({ message: "Municipio eliminado correctamente" });
  } catch (err) {
    console.error("Error al eliminar municipio:", err);
    res.status(500).json({ message: "Error al eliminar municipio" });
  }
});

export default router;
