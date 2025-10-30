import express from 'express';
import { openDb } from '../db.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();
const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);

// GET /api/users  (admin)
router.get('/', authenticateToken, requireRole('admin'), async (req, res) => {
  const db = await openDb();
  const users = await db.all('SELECT id, email, nombre, rol, requiereCambioClave, created_at FROM users');
  res.json(users);
});

// POST /api/users  (crear usuario) (admin)
router.post('/', authenticateToken, requireRole('admin'), async (req, res) => {
  const { email, nombre, rol } = req.body;
  const db = await openDb();

  const exists = await db.get('SELECT id FROM users WHERE email = ?', [email]);
  if (exists) return res.status(400).json({ message: 'Email ya en uso' });

  const tempPassword = uuidv4().slice(0,10);
  const hashed = await bcrypt.hash(tempPassword, saltRounds);
  const id = uuidv4();

  await db.run('INSERT INTO users (id,email,nombre,rol,password,requiereCambioClave) VALUES (?, ?, ?, ?, ?, ?)', [id, email, nombre, rol, hashed, 1]);
  res.json({ message: 'Usuario creado', tempPassword, id });
});

export default router;
