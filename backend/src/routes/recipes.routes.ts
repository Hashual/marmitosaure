import { RecipesController } from "../controllers/RecipesController";
import { Router } from "express";
import { ReviewsRouter } from "./reviews.routes";

export const RecipesRouter = Router();

RecipesRouter.get("/", RecipesController.GetAll);
RecipesRouter.post("/", RecipesController.Create);

RecipesRouter.get("/search", RecipesController.Search);

RecipesRouter.get("/:id", RecipesController.GetById);
RecipesRouter.put("/:id", RecipesController.Update);

RecipesRouter.use('/:id/reviews', ReviewsRouter);