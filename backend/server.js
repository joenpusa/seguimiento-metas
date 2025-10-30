import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './src/routes/auth.js';
import usersRoutes from './src/routes/users.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// prefijo API
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API escuchando en http://localhost:${port}`));
