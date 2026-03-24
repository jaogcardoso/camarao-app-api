import { Router } from "express";
import { cicloController } from "../controllers/ciclo/cicloController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/", authMiddleware, cicloController.create);
router.get("/", authMiddleware, cicloController.listAll);
router.get('/:cicloId', authMiddleware, cicloController.show);
router.patch('/:cicloId/finalizar', authMiddleware, cicloController.finish);
router.post('/:cicloId/consumir', authMiddleware, cicloController.consumir);
router.get('/ciclos/:id/resumo', cicloController.resumo);


export const cicloRoutes = router;
