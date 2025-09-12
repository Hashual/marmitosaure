import { RecipesController } from "../controllers/recipes/RecipesController";
import { Router } from "express";

export const RecipesRouter = Router();

RecipesRouter.get("/", RecipesController.GetAll);
RecipesRouter.post("/", RecipesController.Create);

RecipesRouter.get("/search", RecipesController.Search);

RecipesRouter.get("/:id", RecipesController.GetById);
RecipesRouter.put("/:id", RecipesController.Update);