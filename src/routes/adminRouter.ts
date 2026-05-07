import { Router } from 'express';
import { adminController } from '../controllers/admin/adminController.js';
import { adminMiddleware } from '../middlewares/adminMiddleware.js';

const router = Router();

router.post('/admin/login', adminController.login);
router.get('/admin/tenants', adminMiddleware, adminController.listTenants);
router.patch('/admin/tenants/:tenantId/bloquear', adminMiddleware, adminController.bloquear);
router.patch('/admin/tenants/:tenantId/desbloquear', adminMiddleware, adminController.desbloquear);
router.get('/admin/tenants/:tenantId/stats', adminMiddleware, adminController.stats);

export { router as adminRoutes };