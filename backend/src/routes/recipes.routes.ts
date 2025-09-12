import { RecipesController } from "../controllers/recipes/RecipesController";
import { Router } from "express";

export const RecipesRouter = Router();

RecipesRouter.get("/", RecipesController.GetAllRecipes);