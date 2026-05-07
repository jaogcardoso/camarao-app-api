import { Router } from 'express';
import { estoqueController } from '../controllers/estoque/estoqueController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

export const estoqueRoutes = Router();

estoqueRoutes.post('/entrada', authMiddleware, estoqueController.entrada);
estoqueRoutes.get('/resumo', authMiddleware, estoqueController.resumo);
estoqueRoutes.get('/historico', authMiddleware, estoqueController.historico);
estoqueRoutes.delete('/lote/:loteId', authMiddleware, estoqueController.deletarLote);