import { Router } from "express"
import { MeController } from "../controllers/MeController";
import { AuthMiddleware } from "../middlewares/AuthMiddleware";

export const router = Router();
router.use(AuthMiddleware);

const meController = new MeController();
router.get("/", meController.index);

export const MeRouter = router;