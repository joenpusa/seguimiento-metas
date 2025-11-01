import express from 'express';
import { openDb } from '../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { safeUser } from '../helpers/safeUser.js';

dotenv.config();
const router = express.Router();
const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const db = await openDb();
  const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
  if (!user) return res.status(401).json({ message: 'Credenciales incorrectas' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: 'Credenciales incorrectas' });

  const payload = { id: user.id, email: user.email, nombre: user.nombre, rol: user.rol, requiereCambioClave: !!user.requiereCambioClave };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '8h' });

  // res.json({ token, user: safeUser(user) });
  res.json({
  accessToken: token,
  refreshToken: null, // o genera uno si lo implementas luego
  user: safeUser(user),
});

});

// POST /api/auth/change-password
// body: { userId, currentPassword, newPassword }
import { authenticateToken } from '../middleware/authMiddleware.js';
router.post('/change-password', authenticateToken, async (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;
  const db = await openDb();
  const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) return res.status(400).json({ message: 'Contraseña actual incorrecta' });

  const hashed = await bcrypt.hash(newPassword, saltRounds);
  await db.run('UPDATE users SET password = ?, requiereCambioClave = 0 WHERE id = ?', [hashed, userId]);
  res.json({ message: 'Contraseña actualizada' });
});

// POST /api/auth/reset-password  (admin only)
// body: { userId }
import { requireRole } from '../middleware/authMiddleware.js';
router.post('/reset-password', authenticateToken, requireRole('admin'), async (req, res) => {
  const { userId } = req.body;
  const db = await openDb();
  const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

  const newPassword = uuidv4().slice(0, 10);
  const hashed = await bcrypt.hash(newPassword, saltRounds);
  await db.run('UPDATE users SET password = ?, requiereCambioClave = 1 WHERE id = ?', [hashed, userId]);
  res.json({ message: 'Contraseña restablecida', tempPassword: newPassword });
});

export default router;
