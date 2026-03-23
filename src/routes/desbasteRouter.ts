import { Router } from 'express';
import { desbasteController } from '../controllers/desbaste/desbasteController.js';

const router = Router();

router.post('/desbastes', desbasteController.create);
router.get('/desbastes', desbasteController.list);

export default router;