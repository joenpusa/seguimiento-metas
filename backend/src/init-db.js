// src/init-db.js
import { openDb } from "./db.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);

// 👥 Usuarios iniciales
const initialUsers = [
  {
    id: "admin-user-id",
    email: "admin@example.com",
    nombre: "Administrador Principal",
    rol: "admin",
    password: "adminpass",
    requiereCambioClave: 0,
  },
  {
    id: "jorge-pulido",
    email: "joenpusa@gmail.com",
    nombre: "Jorge E. Pulido S.",
    rol: "admin",
    password: "admin123",
    requiereCambioClave: 0,
  },
  {
    id: "resp1-user-id",
    email: "responsable1@example.com",
    nombre: "Secretaría General",
    rol: "responsable",
    password: "resppass",
    requiereCambioClave: 1,
  },
  {
    id: "resp2-user-id",
    email: "responsable2@example.com",
    nombre: "Oficina de Planeación",
    rol: "responsable",
    password: "resppass",
    requiereCambioClave: 1,
  },
];

const run = async () => {
  try {
    const db = await openDb();

    // ===============================
    // 🧱 Creación de tablas
    // ===============================
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

      CREATE TABLE IF NOT EXISTS municipios (
        id_municipio INTEGER PRIMARY KEY AUTOINCREMENT,
        id_departamento INTEGER DEFAULT 54,
        codigo_municipio TEXT UNIQUE NOT NULL,
        nombre TEXT NOT NULL,
        id_zona TEXT CHECK(id_zona IN ('Centro', 'Norte', 'Sur', 'Oriente', 'Occidente')),
        activo INTEGER DEFAULT 1
      );
    `);

    // ===============================
    // 👤 Usuarios iniciales
    // ===============================
    for (const u of initialUsers) {
      const hashed = await bcrypt.hash(u.password, saltRounds);
      await db.run(
        `INSERT INTO users (id, email, nombre, rol, password, requiereCambioClave)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(email) DO UPDATE SET
           id = excluded.id,
           nombre = excluded.nombre,
           rol = excluded.rol,
           password = excluded.password,
           requiereCambioClave = excluded.requiereCambioClave;`,
        [u.id, u.email, u.nombre, u.rol, hashed, u.requiereCambioClave]
      );
    }

    // ===============================
    // 🏙️ Insertar municipio por defecto
    // ===============================
    const existe = await db.get(
      `SELECT * FROM municipios WHERE LOWER(nombre) = LOWER('Todo el departamento')`
    );

    if (!existe) {
      await db.run(
        `INSERT INTO municipios (codigo_municipio, nombre, id_zona)
         VALUES (?, ?, ?)`,
        ["000", "Todo el departamento", "Centro"]
      );
      console.log("🌍 Insertado municipio por defecto: 'Todo el departamento'");
    }

    console.log("✅ Base de datos inicializada correctamente.");
    console.log("📁 Ubicación:", process.env.DATABASE_PATH || "./data/seguimiento.db");

    await db.close();
  } catch (err) {
    console.error("❌ Error al inicializar la base de datos:", err);
    process.exit(1);
  }
};

// 🚀 Ejecutar script
run();
