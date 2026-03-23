import { Router } from 'express';
import { consumoController } from '../controllers/consumo/consumoController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

export const consumoRoutes = Router();

consumoRoutes.post(
  '/consumir',
  authMiddleware,
  consumoController.consumir
);