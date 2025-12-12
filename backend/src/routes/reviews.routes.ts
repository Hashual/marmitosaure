import { Router } from "express";
import { ReviewsController } from "../controllers/ReviewsController";

export const ReviewsRouter = Router();
const controller = new ReviewsController();

ReviewsRouter.get("/users/low-rating", controller.lowRatingUsers);
ReviewsRouter.get("/users/:userId", controller.getAllForUser);
ReviewsRouter.get("/best-rated", controller.getBestRated);