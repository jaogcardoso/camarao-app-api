import { Router } from 'express';
import { loteController } from '../controllers/lote/loteController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

export const loteRoutes = Router();

loteRoutes.post('/', authMiddleware, loteController.create);
loteRoutes.get('/', authMiddleware, loteController.list);
loteRoutes.get('/:id', authMiddleware, loteController.show);
loteRoutes.delete('/:id', authMiddleware, loteController.delete);