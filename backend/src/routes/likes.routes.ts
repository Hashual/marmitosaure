import { Router } from "express";
import { LikesController } from "../controllers/LikesController";
import { AuthMiddleware } from "../middlewares/AuthMiddleware";

export const LikesRouter = Router();
LikesRouter.use(AuthMiddleware);

LikesRouter.post("/:id/likes", LikesController.postRecipeLike);
LikesRouter.delete("/:id/likes", LikesController.deleteRecipeLike);
