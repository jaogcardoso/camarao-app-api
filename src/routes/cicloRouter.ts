import { Router } from "express";
import { cicloController } from "../controllers/ciclo/cicloController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/", authMiddleware, cicloController.create);
router.get("/", authMiddleware, cicloController.listAll);
router.get('/resumos/ativos', authMiddleware, cicloController.resumosAtivos);
router.get('/:cicloId', authMiddleware, cicloController.show);
router.patch('/:cicloId/finalizar', authMiddleware, cicloController.finish);
router.patch('/:cicloId', authMiddleware, cicloController.update);
router.post('/:cicloId/consumir', authMiddleware, cicloController.consumir);
router.get('/:cicloId/resumo', authMiddleware, cicloController.resumo);
router.get('/:cicloId/eventos', authMiddleware, cicloController.eventos);
router.get('/:cicloId/consumos', authMiddleware, cicloController.consumos);
router.get('/:cicloId/desbastes', authMiddleware, cicloController.desbastes);
router.post('/:cicloId/biometria', authMiddleware, cicloController.biometria);
router.post('/:cicloId/despesca', authMiddleware, cicloController.despesca);


export const cicloRoutes = router;
