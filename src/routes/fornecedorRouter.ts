import { Router } from 'express';
import { fornecedorController } from '../controllers/fornecedor/fornecedorController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

export const fornecedorRoutes = Router();

fornecedorRoutes.post('/', authMiddleware, fornecedorController.create);
fornecedorRoutes.get('/', authMiddleware, fornecedorController.list);
fornecedorRoutes.get('/:id', authMiddleware, fornecedorController.show);
fornecedorRoutes.patch('/:id', authMiddleware, fornecedorController.update);
fornecedorRoutes.delete('/:id', authMiddleware, fornecedorController.delete);