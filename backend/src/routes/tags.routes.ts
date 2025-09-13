import { Router } from "express";
import type { Request, Response } from "express";
import { TagsController } from "../controllers/recipes/TagsController.js";

export const TagsRouter = Router();



TagsRouter.get("/", TagsController.getAll, (req: Request, res: Response) => {});

