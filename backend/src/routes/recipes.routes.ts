import { Router } from "express"
import { RecipesController } from "../controllers/RecipesController"
import { ReviewsRouter } from "./reviews.routes"
import {AuthMiddleware} from "../middlewares/AuthMiddleware.ts";
import {UploadMiddleware} from "../middlewares/UploadMiddleware.ts";

export const RecipesRouter = Router();

RecipesRouter.get("/", RecipesController.GetRecipes);
RecipesRouter.post("/", AuthMiddleware, UploadMiddleware, RecipesController.Create);

RecipesRouter.get("/:id", RecipesController.GetById);
RecipesRouter.put("/:id", AuthMiddleware, UploadMiddleware, RecipesController.Update);

RecipesRouter.delete("/:id", AuthMiddleware, RecipesController.Delete);

RecipesRouter.use("/:id/reviews", ReviewsRouter);
