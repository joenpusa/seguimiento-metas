import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './src/routes/auth.js';
import usersRoutes from './src/routes/users.js';
import municipiosRoutes from "./src/routes/municipios.js";
import planesRoutes from "./src/routes/planesDesarrollo.js";
import secretariasRoutes from "./src/routes/secretarias.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// prefijo API
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use("/api/municipios", municipiosRoutes);
app.use("/api/planes-desarrollo", planesRoutes);
app.use("/api/secretarias", secretariasRoutes);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API escuchando en http://localhost:${port}`));
