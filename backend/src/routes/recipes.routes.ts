import { Router } from "express"
import { RecipesController } from "../controllers/RecipesController"
import { ReviewsRouter } from "./reviews.routes"
import {AuthMiddleware} from "../middlewares/AuthMiddleware.ts";
import {UploadMiddleware} from "../middlewares/UploadMiddleware.ts";

export const RecipesRouter = Router();

RecipesRouter.get("/", RecipesController.GetRecipes);
RecipesRouter.post("/", RecipesController.Create, AuthMiddleware, UploadMiddleware);

RecipesRouter.get("/:id", RecipesController.GetById);
// RecipesRouter.put("/:id", RecipesController.Update);

RecipesRouter.use("/:id/reviews", ReviewsRouter);
