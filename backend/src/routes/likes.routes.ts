// /recipes/:recipe_id/like

import { Router } from "express";
import { LikesController } from "../controllers/LikesController";

export const LikesRouter = Router();

LikesRouter.get("/:id/likes", LikesController.getRecipeLikes);
LikesRouter.post("/:id/likes", LikesController.postRecipeLikes);