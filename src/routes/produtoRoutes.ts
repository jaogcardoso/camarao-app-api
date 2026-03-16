import { Router } from 'express';
import { produtoController } from '../controllers/produto/produtoController.js';
import { authMiddleware } from "../middlewares/authMiddleware.js";

const produtoRoutes = Router();

// Todas as rotas protegidas por login
produtoRoutes.post('/', authMiddleware, produtoController.create);
produtoRoutes.get('/', authMiddleware, produtoController.list);
produtoRoutes.get('/:id', authMiddleware, produtoController.show);
produtoRoutes.patch('/:id', authMiddleware, produtoController.update);
produtoRoutes.delete('/:id', authMiddleware, produtoController.remove);

export { produtoRoutes };
