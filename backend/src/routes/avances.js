import express from "express";
import { authenticateToken, requireRole } from "../middleware/authMiddleware.js";
import { AvancesModel } from "../models/avancesModel.js";
import { MetasModel } from "../models/metasModel.js";

const router = express.Router();

// 🔹 GET /api/avances
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { idPlan } = req.query;

    if (!idPlan) {
      return res.status(400).json({ message: "El parámetro idPlan es obligatorio" });
    }

    const data = await AvancesModel.getAll(req.query);
    res.json(data);
  } catch (err) {
    console.error("Error al obtener avances:", err);
    res.status(500).json({ message: "Error al obtener avances", error: err.message });
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
router.post("/", authenticateToken, requireRole("admin", "responsable_carga"), async (req, res) => {
  try {
    const meta = await MetasModel.getById(req.body.id_meta);
    if (!meta) {
      return res.status(404).json({ message: "Meta no encontrada" });
    }
    if (req.user.rol !== "admin" && req.user.id_secretaria !== meta.id_secretaria) {
      return res.status(403).json({ message: "No tiene permiso para añadir avances a esta meta" });
    }

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
router.put("/:id", authenticateToken, requireRole("admin", "responsable_carga"), async (req, res) => {
  try {
    const avance = await AvancesModel.getById(req.params.id);

    if (!avance) {
      return res.status(404).json({ message: "Avance no encontrado" });
    }

    const meta = await MetasModel.getById(avance.id_meta);
    if (req.user.rol !== "admin" && req.user.id_secretaria !== meta.id_secretaria) {
      return res.status(403).json({ message: "No tiene permiso para modificar avances de esta meta" });
    }

    await AvancesModel.update(req.params.id, req.body);

    res.json({ message: "Avance actualizado correctamente" });
  } catch (err) {
    console.error("Error al actualizar avance:", err);
    res.status(500).json({ message: "Error al actualizar avance" });
  }
});

// DELETE /api/avances/:id
router.delete("/:id", authenticateToken, requireRole("admin", "responsable_carga"), async (req, res) => {
  try {
    const avance = await AvancesModel.getById(req.params.id);

    if (!avance) {
      return res.status(404).json({ message: "Avance no encontrado" });
    }

    const meta = await MetasModel.getById(avance.id_meta);
    if (req.user.rol !== "admin" && req.user.id_secretaria !== meta.id_secretaria) {
      return res.status(403).json({ message: "No tiene permiso para eliminar avances de esta meta" });
    }

    // 🔒 Obtener el último avance de esa meta
    const ultimo = await AvancesModel.getUltimoAvancePorMeta(avance.id_meta);

    if (!ultimo || ultimo.id_avance !== avance.id_avance) {
      return res.status(409).json({
        message:
          "Solo se puede eliminar el último avance registrado de la meta. Debe eliminar primero los avances más recientes.",
      });
    }

    await AvancesModel.delete(req.params.id);

    res.json({ message: "Avance eliminado correctamente" });
  } catch (err) {
    console.error("Error al eliminar avance:", err);
    res.status(500).json({ message: "Error al eliminar avance" });
  }
});

export default router;
