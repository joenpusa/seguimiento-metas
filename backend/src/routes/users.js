// src/routes/users.js
import express from "express";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

import { authenticateToken, requireRole } from "../middleware/authMiddleware.js";
import { UsersModel } from "../models/usersModel.js";

dotenv.config();

const router = express.Router();
const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);

// =============================================
// GET /api/users (admin)
// =============================================
router.get("/", authenticateToken, requireRole("admin"), async (req, res) => {
  try {
    const users = await UsersModel.getAll();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener usuarios" });
  }
});

// =============================================
// GET /api/users/:id
// =============================================
router.get("/:id", authenticateToken, requireRole("admin"), async (req, res) => {
  try {
    const user = await UsersModel.getById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener usuario" });
  }
});

// =============================================
// POST /api/users (admin)
// =============================================
router.post("/", authenticateToken, requireRole("admin"), async (req, res) => {
  try {
    const { email, nombre, rol, id_secretaria } = req.body;

    if (!email || !rol || !id_secretaria) {
      return res.status(400).json({
        message: "Email, rol e id_secretaria son obligatorios",
      });
    }

    const exists = await UsersModel.getByEmail(email);
    if (exists) {
      return res.status(400).json({ message: "Email ya en uso" });
    }

    const tempPassword = Math.random().toString(36).slice(-10);
    const passwordHash = await bcrypt.hash(tempPassword, saltRounds);

    const result = await UsersModel.create({
      email,
      nombre,
      rol,
      id_secretaria,
      passwordHash,
    });

    res.status(201).json({
      message: "Usuario creado correctamente",
      id_usuario: result.id,
      tempPassword,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al crear usuario" });
  }
});

// =============================================
// PUT /api/users/:id
// =============================================
router.put("/:id", authenticateToken, requireRole("admin"), async (req, res) => {
  try {
    const user = await UsersModel.getById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    await UsersModel.update(req.params.id, req.body);

    res.json({ message: "Usuario actualizado correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al actualizar usuario" });
  }
});

// =============================================
// PUT /api/users/:id/password
// =============================================
router.put("/:id/password", authenticateToken, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "La contraseña es obligatoria" });
    }

    const hash = await bcrypt.hash(password, saltRounds);
    await UsersModel.updatePassword(req.params.id, hash);

    res.json({ message: "Contraseña actualizada correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al cambiar contraseña" });
  }
});

// =============================================
// DELETE /api/users/:id (soft delete)
// =============================================
router.delete("/:id", authenticateToken, requireRole("admin"), async (req, res) => {
  try {
    await UsersModel.deactivate(req.params.id);
    res.json({ message: "Usuario desactivado correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al eliminar usuario" });
  }
});

export default router;
