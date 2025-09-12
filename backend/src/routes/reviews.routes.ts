import { Router } from "express";
import { ReviewsController } from "../controllers/recipes/reviews/ReviewsController";

export const ReviewsRouter = Router();

ReviewsRouter.post("/", ReviewsController.Create);
ReviewsRouter.get("/", ReviewsController.GetAll);

ReviewsRouter.post("/:id/like", ReviewsController.Like);
ReviewsRouter.get("/:id/likes/count", ReviewsController.CountLikes);