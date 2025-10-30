// src/db.js
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "../data/seguimiento.db");

// 🔧 Crear carpeta automáticamente
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

export const initDB = async () => {
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  // Crear tabla de ejemplo
  // await db.exec(`
  //   CREATE TABLE IF NOT EXISTS users (
  //     id INTEGER PRIMARY KEY AUTOINCREMENT,
  //     email TEXT UNIQUE,
  //     password TEXT,
  //     role TEXT DEFAULT 'user'
  //   );
  // `);

  return db;
};
