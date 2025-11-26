import { Router } from "express";
import { AuthController } from "../controllers/AuthController";

export const AuthRouter = Router();
const authController = new AuthController();

AuthRouter.post("/", authController.Login);