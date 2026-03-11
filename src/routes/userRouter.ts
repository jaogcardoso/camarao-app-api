import { Router } from 'express';
import { userController } from '../controllers/user/userController.js';

const userRoutes = Router();

userRoutes.post('/usuarios', userController.create);

userRoutes.post('/login', userController.login);


export { userRoutes };
