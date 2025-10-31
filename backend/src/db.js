// src/db.js
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// 📍 Necesario para obtener rutas absolutas correctamente en módulos ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 📁 Ruta del archivo de base de datos
const dbPath = path.join(__dirname, "../data/seguimiento.db");

// 🧩 Crear carpeta automáticamente si no existe
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

// 🧠 Función para abrir la conexión a la base de datos
export async function openDb() {
  try {
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    return db;
  } catch (err) {
    console.error("❌ Error al abrir la base de datos:", err);
    throw err;
  }
}
