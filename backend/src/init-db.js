// src/init-db.js
import { openDb } from "./db.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);

// 👥 Usuarios iniciales
const initialUsers = [
  {
    id: "1",
    email: "admin@nortedesantander.gov.co",
    nombre: "Administrador Principal",
    rol: "admin",
    activo: 1,
    password: "adminpass",
    requiereCambioClave: 0,
  },
  {
    id: "2",
    email: "joenpusa@gmail.com",
    nombre: "Jorge E. Pulido S.",
    rol: "admin",
    activo: 1,
    password: "admin123",
    requiereCambioClave: 0,
  },
  {
    id: "3",
    email: "responsable1@example.com",
    nombre: "Secretaría General",
    rol: "responsable",
    activo: 1,
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

      -- ============================================
      -- USERS
      -- ============================================
      CREATE TABLE IF NOT EXISTS users (
        id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
        email VARCHAR(120) UNIQUE NOT NULL,
        nombre VARCHAR(120),
        rol VARCHAR(50) NOT NULL,
        es_activo INTEGER DEFAULT 1,
        id_secretaria INTEGER NOT NULL,
        password VARCHAR(255) NOT NULL,
        requiereCambioClave INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- ============================================
      -- MUNICIPIOS
      -- ============================================
      CREATE TABLE IF NOT EXISTS municipios (
        id_municipio INTEGER PRIMARY KEY AUTOINCREMENT,
        id_departamento INTEGER DEFAULT 54,
        codigo_municipio VARCHAR(10) UNIQUE NOT NULL,
        nombre VARCHAR(120) NOT NULL,
        id_zona VARCHAR(20) NOT NULL,
        activo INTEGER DEFAULT 1
      );

      -- ============================================
      -- UNIDADES
      -- ============================================
      CREATE TABLE IF NOT EXISTS unidades (
        id_unidad INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre VARCHAR(120) NOT NULL,
        codigo VARCHAR(50) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- ============================================
      -- SECRETARIAS
      -- ============================================
      CREATE TABLE IF NOT EXISTS secretarias (
        id_secretaria INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre VARCHAR(120) NOT NULL,
        es_activo INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- ============================================
      -- PLANES DESARROLLO
      -- ============================================
      CREATE TABLE IF NOT EXISTS planes_desarrollo (
        id_plan INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre_plan VARCHAR(200) NOT NULL,
        vigencia_inicio VARCHAR(10) NOT NULL,
        vigencia_fin VARCHAR(10) NOT NULL,
        es_activo INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- ============================================
      -- DETALLES DEL PLAN (estructura jerárquica)
      -- ============================================
      CREATE TABLE IF NOT EXISTS detalles_plan (
        id_detalle INTEGER PRIMARY KEY AUTOINCREMENT,
        id_plan INTEGER NOT NULL,
        tipo VARRCHAR(20) NOT NULL,
        codigo VARRCHAR(20) NOT NULL,
        nombre_detalle VARCHAR(200) NOT NULL,
        id_detalle_padre INTEGER NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(id_plan) REFERENCES planes_desarrollo(id_plan),
        FOREIGN KEY(id_detalle_padre) REFERENCES detalles_plan(id_detalle)
      );

      -- ============================================
      -- METAS
      -- ============================================
      CREATE TABLE IF NOT EXISTS metas (
        id_meta INTEGER PRIMARY KEY AUTOINCREMENT,
        codigo VARCHAR(200) NOT NULL,
        nombre VARCHAR(120) NOT NULL,
        descripcion VARCHAR(500) NOT NULL,
        id_detalle INTEGER NOT NULL,
        cantidad INTEGER DEFAULT 0,
        id_unidad INTEGER NOT NULL,
        valor DOUBLE DEFAULT 0,
        valor2 DOUBLE DEFAULT 0,
        valor3 DOUBLE DEFAULT 0,
        valor4 DOUBLE DEFAULT 0,
        recurrente INTEGER DEFAULT 0,
        id_secretaria INTEGER NOT NULL,
        fecha_limite VARCHAR(10),

        cantidad_0_5 INTEGER DEFAULT 0,
        cantidad_6_12 INTEGER DEFAULT 0,
        cantidad_13_17 INTEGER DEFAULT 0,
        cantidad_18_24 INTEGER DEFAULT 0,
        cantidad_25_62 INTEGER DEFAULT 0,
        cantidad_65_mas INTEGER DEFAULT 0,

        cantesp_mujer INTEGER DEFAULT 0,
        cantesp_discapacidad INTEGER DEFAULT 0,
        cantesp_etnia INTEGER DEFAULT 0,
        cantesp_victima INTEGER DEFAULT 0,
        cantesp_desmovilizado INTEGER DEFAULT 0,
        cantesp_lgtbi INTEGER DEFAULT 0,
        cantesp_migrante INTEGER DEFAULT 0,
        cantesp_indigente INTEGER DEFAULT 0,
        cantesp_privado INTEGER DEFAULT 0,

        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(id_detalle) REFERENCES detalles_plan(id_detalle),
        FOREIGN KEY(id_unidad) REFERENCES unidades(id_unidad),
        FOREIGN KEY(id_secretaria) REFERENCES secretarias(id_secretaria)
      );

      -- ============================================
      -- METAS POR MUNICIPIO
      -- ============================================
      CREATE TABLE IF NOT EXISTS metasxmunicipio (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        id_meta INTEGER NOT NULL,
        id_municipio INTEGER NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(id_meta) REFERENCES metas(id_meta),
        FOREIGN KEY(id_municipio) REFERENCES municipios(id_municipio)
      );

      -- ============================================
      -- PROGRAMACIONES
      -- ============================================
      CREATE TABLE IF NOT EXISTS programaciones (
        id_programacion INTEGER PRIMARY KEY AUTOINCREMENT,
        anio VARCHAR(4) NOT NULL,
        trimestre VARCHAR(2) NOT NULL,
        id_meta INTEGER NOT NULL,
        cantidad INTEGER DEFAULT 0,
        gasto INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY(id_meta) REFERENCES metas(id_meta)
      );

      CREATE UNIQUE INDEX IF NOT EXISTS idx_programaciones_meta_anio_trimestre
      ON programaciones (id_meta, anio, trimestre);

      -- ============================================
      -- AVANCES
      -- ============================================
      CREATE TABLE IF NOT EXISTS avances (
        id_avance INTEGER PRIMARY KEY AUTOINCREMENT,
        anio VARCHAR(4) NOT NULL,
        trimestre VARCHAR(2) NOT NULL,
        id_meta INTEGER NOT NULL,
        fec_especifica DATETIME DEFAULT NULL,
        descripcion VARCHAR(500) NOT NULL, 
        cantidad INTEGER DEFAULT 0,
        gasto INTEGER DEFAULT 0,
        url_evidencia VARCHAR(500) NOT NULL,

        cantidad_0_5 INTEGER DEFAULT 0,
        cantidad_6_12 INTEGER DEFAULT 0,
        cantidad_13_17 INTEGER DEFAULT 0,
        cantidad_18_24 INTEGER DEFAULT 0,
        cantidad_25_62 INTEGER DEFAULT 0,
        cantidad_65_mas INTEGER DEFAULT 0,

        cantesp_mujer INTEGER DEFAULT 0,
        cantesp_discapacidad INTEGER DEFAULT 0,
        cantesp_etnia INTEGER DEFAULT 0,
        cantesp_victima INTEGER DEFAULT 0,
        cantesp_desmovilizado INTEGER DEFAULT 0,
        cantesp_lgtbi INTEGER DEFAULT 0,
        cantesp_migrante INTEGER DEFAULT 0,
        cantesp_indigente INTEGER DEFAULT 0,
        cantesp_privado INTEGER DEFAULT 0,

        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY(id_meta) REFERENCES metas(id_meta)
      );

    `);

    // ===============================
    // 👤 Usuarios iniciales
    // ===============================
    for (const u of initialUsers) {
      const hashed = await bcrypt.hash(u.password, saltRounds);
      await db.run(
        `INSERT INTO users (id_usuario, email, nombre, rol, password, requiereCambioClave, es_activo)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(email) DO UPDATE SET
          nombre = excluded.nombre,
          rol = excluded.rol,
          password = excluded.password,
          requiereCambioClave = excluded.requiereCambioClave,
          es_activo = excluded.es_activo`,
        [
          u.id,
          u.email,
          u.nombre,
          u.rol,
          hashed,
          u.requiereCambioClave,
          u.activo
        ]
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
