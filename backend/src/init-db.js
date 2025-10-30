import { openDb } from './db.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);

const initialUsers = [
  { id: 'admin-user-id', email: 'admin@example.com', nombre: 'Administrador Principal', rol: 'admin', password: 'adminpass', requiereCambioClave: 0 },
  { id: 'resp1-user-id', email: 'responsable1@example.com', nombre: 'Secretaría General', rol: 'responsable', password: 'resppass', requiereCambioClave: 1 },
  { id: 'resp2-user-id', email: 'responsable2@example.com', nombre: 'Oficina de Planeación', rol: 'responsable', password: 'resppass', requiereCambioClave: 1 },
];

const run = async () => {
  const db = await openDb();

  await db.exec(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      nombre TEXT,
      rol TEXT,
      password TEXT NOT NULL,
      requiereCambioClave INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  for (const u of initialUsers) {
    const hashed = await bcrypt.hash(u.password, saltRounds);
    // upsert simple: si existe lo actualiza
    await db.run(
      `INSERT INTO users (id,email,nombre,rol,password,requiereCambioClave)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(email) DO UPDATE SET id=excluded.id, nombre=excluded.nombre, rol=excluded.rol, password=excluded.password, requiereCambioClave=excluded.requiereCambioClave;
      `,
      [u.id, u.email, u.nombre, u.rol, hashed, u.requiereCambioClave]
    );
  }

  console.log('DB inicializada en', process.env.DATABASE_PATH || './data/database.sqlite');
  await db.close();
};

run().catch(err => { console.error(err); process.exit(1); });
