import { Router } from "express";
import { ReviewsController } from "../controllers/ReviewsController";

export const ReviewsRouter = Router();

ReviewsRouter.post("/", ReviewsController.Create);
ReviewsRouter.get("/", ReviewsController.GetAll);