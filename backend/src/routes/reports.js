import express from 'express';
import { reportsController } from '../controllers/reportsController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Todas las rutas de reportes protegidas
router.use(authenticateToken);

// Reporte 1: General
router.post('/general', reportsController.generateGeneralReport);

// Reporte 2: Lineas
router.post('/lineas', reportsController.generateLineasReport);

// Reporte 3: Componentes
router.post('/componentes', reportsController.generateComponentesReport);

// Reporte 5: Secretarías
router.post('/secretarias', reportsController.generateSecretariasReport);

// Reporte 7: Arbol Completo
router.post('/arbol', reportsController.generateArbolReport);

// Reporte 4: Ranking Componentes
router.post('/ranking-componentes', reportsController.generateRankingComponentesReport);

// Reporte 6: Ranking Secretarias
router.post('/ranking-secretarias', reportsController.generateRankingSecretariasReport);

export default router;
