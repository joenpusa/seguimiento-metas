// src/db.js
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Pool de conexiones (recomendado)
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: "Z",
  charset: "utf8mb4",
});

export async function openDb() {
  try {
    const connection = await pool.getConnection();
    return connection;
  } catch (err) {
    console.error("❌ Error al conectar a MySQL:", err);
    throw err;
  }
}
