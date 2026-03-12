import { Router } from "express";
import { cicloController } from "../controllers/ciclo/cicloController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/", authMiddleware, cicloController.create);
router.get("/", authMiddleware, cicloController.list);
router.get("/:id", authMiddleware, cicloController.getById);

export const cicloRoutes = router;
