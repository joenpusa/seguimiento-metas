// src/routes/planesDesarrollo.js
import express from "express";
import {
  getAllPlanes,
  getPlanById,
  getActivePlan,
  createPlan,
  updatePlan,
  deletePlan,
  activatePlan
} from "../models/planDesarrolloModel.js";
import { authenticateToken } from "../middleware/authMiddleware.js"; // 👈 tu middleware de autenticación JWT

const router = express.Router();

// ✅ Obtener el plan activo actualmente
router.get("/activo", authenticateToken, async (req, res) => {
  try {
    const plan = await getActivePlan();
    if (!plan) return res.status(404).json({ error: "No hay ningún plan de desarrollo activo" });
    res.json(plan);
  } catch (err) {
    console.error("❌ Error obteniendo plan activo:", err);
    res.status(500).json({ error: "Error obteniendo plan activo" });
  }
});

// ✅ Obtener todos los planes
router.get("/", authenticateToken, async (req, res) => {
  try {
    const planes = await getAllPlanes();
    res.json(planes);
  } catch (err) {
    console.error("❌ Error obteniendo planes:", err);
    res.status(500).json({ error: "Error obteniendo planes" });
  }
});

// ✅ Obtener un plan por ID
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const plan = await getPlanById(req.params.id);
    if (!plan) return res.status(404).json({ error: "Plan no encontrado" });
    res.json(plan);
  } catch (err) {
    console.error("❌ Error obteniendo plan:", err);
    res.status(500).json({ error: "Error obteniendo plan" });
  }
});

// ✅ Crear nuevo plan
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { nombrePlan, vigenciaInicio, vigenciaFin } = req.body;
    if (!nombrePlan || !vigenciaInicio || !vigenciaFin)
      return res.status(400).json({ error: "Todos los campos son obligatorios" });

    const nuevoPlan = await createPlan({ nombrePlan, vigenciaInicio, vigenciaFin });
    res.status(201).json(nuevoPlan);
  } catch (err) {
    console.error("❌ Error creando plan:", err);
    res.status(500).json({ error: "Error creando plan" });
  }
});

// ✅ Actualizar plan existente
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { nombrePlan, vigenciaInicio, vigenciaFin } = req.body;
    const actualizado = await updatePlan(req.params.id, { nombrePlan, vigenciaInicio, vigenciaFin });
    res.json(actualizado);
  } catch (err) {
    console.error("❌ Error actualizando plan:", err);
    res.status(500).json({ error: "Error actualizando plan" });
  }
});

// ✅ Eliminar plan
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    await deletePlan(req.params.id);
    res.json({ message: "Plan eliminado correctamente" });
  } catch (err) {
    console.error("❌ Error eliminando plan:", err);
    res.status(500).json({ error: "Error eliminando plan" });
  }
});

// ✅ Activar plan
router.put("/:id/activar", authenticateToken, async (req, res) => {
  try {
    const result = await activatePlan(req.params.id);
    res.json(result);
  } catch (err) {
    console.error("❌ Error activando plan:", err);
    res.status(500).json({ error: "Error activando plan" });
  }
});

export default router;
