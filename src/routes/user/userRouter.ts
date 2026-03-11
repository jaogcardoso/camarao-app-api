// src/routes/userRoutes.ts
import { Router } from 'express';
import { userController } from '../../controllers/user/userController.js';

const userRoutes = Router();

userRoutes.post('/usuarios', userController.create);

export { userRoutes };
