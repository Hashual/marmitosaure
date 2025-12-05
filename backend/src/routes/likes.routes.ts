// /recipes/:recipe_id/like

import { Router } from "express";
import { LikesController } from "../controllers/LikesController";

export const LikesRouter = Router();

LikesRouter.post("/:id/likes", LikesController.postRecipeLike);
LikesRouter.delete("/:id/likes", LikesController.deleteRecipeLike);