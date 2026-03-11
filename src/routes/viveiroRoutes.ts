import { Router } from "express";
import { viveiroController } from "../controllers/viveiro/viveiroController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/", authMiddleware, viveiroController.create);
router.get("/", authMiddleware, viveiroController.list);
router.patch("/:id", authMiddleware, viveiroController.update);
router.delete("/:id", authMiddleware, viveiroController.delete);

export default router;