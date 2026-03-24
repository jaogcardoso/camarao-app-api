import { Router } from 'express';
import { desbasteController } from '../controllers/desbaste/desbasteController.js';

const router = Router();

router.post('/', desbasteController.create);
router.get('/', desbasteController.list);


export default router;