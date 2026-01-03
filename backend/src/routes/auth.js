import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { safeUser } from '../helpers/safeUser.js';
import { UsersModel } from '../models/usersModel.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

dotenv.config();
const router = express.Router();
const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UsersModel.getByEmail(email);

    if (!user) return res.status(401).json({ message: 'Credenciales incorrectas' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Credenciales incorrectas' });

    const payload = { id: user.id, email: user.email, nombre: user.nombre, rol: user.rol, requiereCambioClave: !!user.requiereCambioClave };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '8h' });

    res.json({
      accessToken: token,
      refreshToken: null, // o genera uno si lo implementas luego
      user: safeUser(user),
    });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// POST /api/auth/change-password
// body: { userId, currentPassword, newPassword }
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;
    const user = await UsersModel.getById(userId);

    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(400).json({ message: 'Contraseña actual incorrecta' });

    const hashed = await bcrypt.hash(newPassword, saltRounds);
    await UsersModel.updatePassword(userId, hashed);

    res.json({ message: 'Contraseña actualizada' });
  } catch (err) {
    console.error('Error al cambiar contraseña:', err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// POST /api/auth/reset-password  (admin only)
// body: { userId }
router.post('/reset-password', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await UsersModel.getById(userId);

    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const newPassword = uuidv4().slice(0, 10);
    const hashed = await bcrypt.hash(newPassword, saltRounds);

    await UsersModel.forcePasswordReset(userId, hashed);

    res.json({ message: 'Contraseña restablecida', tempPassword: newPassword });
  } catch (err) {
    console.error('Error al restablecer contraseña:', err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

export default router;
