import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { authenticateToken, requireRole } from "../middleware/authMiddleware.js";
import { AvancesModel } from "../models/avancesModel.js";
import { MetasModel } from "../models/metasModel.js";

const router = express.Router();

// Configuración de multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "uploads/avances/";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
});

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
router.post("/", authenticateToken, requireRole("admin", "responsable_carga"), upload.array("archivos", 5), async (req, res) => {
  try {
    const bodyData = req.body;
    
    // Parsear campos que vienen como string desde FormData
    const payload = {
      ...bodyData,
      id_meta: Number(bodyData.id_meta),
      cantidad: Number(bodyData.cantidad) || 0,
      gasto_pro: Number(bodyData.gasto_pro) || 0,
      gasto_cre: Number(bodyData.gasto_cre) || 0,
      gasto_sgp: Number(bodyData.gasto_sgp) || 0,
      gasto_reg: Number(bodyData.gasto_reg) || 0,
      gasto_otr: Number(bodyData.gasto_otr) || 0,
      gasto_mun: Number(bodyData.gasto_mun) || 0,
      municipios: bodyData.municipios ? JSON.parse(bodyData.municipios) : [],
    };
    
    // Asignar variables de poblacion si existen
    const pobFields = [
      "cantidad_0_5", "cantidad_6_12", "cantidad_13_17", "cantidad_18_24", "cantidad_25_62", "cantidad_65_mas",
      "cantesp_mujer", "cantesp_discapacidad", "cantesp_etnia", "cantesp_victima", "cantesp_desmovilizado", 
      "cantesp_lgtbi", "cantesp_migrante", "cantesp_indigente", "cantesp_privado"
    ];
    pobFields.forEach(f => {
      if (bodyData[f] !== undefined) {
        payload[f] = Number(bodyData[f]);
      }
    });

    // Archivos
    if (req.files && req.files.length > 0) {
      payload.archivos = req.files.map(f => ({
        nombre_archivo: f.originalname,
        key_archivo: f.filename
      }));
    } else {
      payload.archivos = [];
    }

    const meta = await MetasModel.getById(payload.id_meta);
    if (!meta) {
      return res.status(404).json({ message: "Meta no encontrada" });
    }
    if (req.user.rol !== "admin" && req.user.id_secretaria !== meta.id_secretaria) {
      return res.status(403).json({ message: "No tiene permiso para añadir avances a esta meta" });
    }

    const result = await AvancesModel.create(payload);

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
router.put("/:id", authenticateToken, requireRole("admin", "responsable_carga"), upload.array("archivos", 5), async (req, res) => {
  try {
    const bodyData = req.body;
    
    // Parsear campos que vienen como string desde FormData
    const payload = {
      ...bodyData,
      cantidad: Number(bodyData.cantidad) || 0,
      gasto_pro: Number(bodyData.gasto_pro) || 0,
      gasto_cre: Number(bodyData.gasto_cre) || 0,
      gasto_sgp: Number(bodyData.gasto_sgp) || 0,
      gasto_reg: Number(bodyData.gasto_reg) || 0,
      gasto_otr: Number(bodyData.gasto_otr) || 0,
      gasto_mun: Number(bodyData.gasto_mun) || 0,
      municipios: bodyData.municipios ? JSON.parse(bodyData.municipios) : [],
    };
    
    // Asignar variables de poblacion si existen
    const pobFields = [
      "cantidad_0_5", "cantidad_6_12", "cantidad_13_17", "cantidad_18_24", "cantidad_25_62", "cantidad_65_mas",
      "cantesp_mujer", "cantesp_discapacidad", "cantesp_etnia", "cantesp_victima", "cantesp_desmovilizado", 
      "cantesp_lgtbi", "cantesp_migrante", "cantesp_indigente", "cantesp_privado"
    ];
    pobFields.forEach(f => {
      if (bodyData[f] !== undefined) {
        payload[f] = Number(bodyData[f]);
      }
    });

    // Archivos
    if (req.files && req.files.length > 0) {
      payload.archivos = req.files.map(f => ({
        nombre_archivo: f.originalname,
        key_archivo: f.filename
      }));
    } else {
      payload.archivos = [];
    }

    const avance = await AvancesModel.getById(req.params.id);

    if (!avance) {
      return res.status(404).json({ message: "Avance no encontrado" });
    }

    const meta = await MetasModel.getById(avance.id_meta);
    if (req.user.rol !== "admin" && req.user.id_secretaria !== meta.id_secretaria) {
      return res.status(403).json({ message: "No tiene permiso para modificar avances de esta meta" });
    }

    await AvancesModel.update(req.params.id, payload);

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
