import type { Request, Response } from "express";
import { AuthRepository } from "../models/auth";
import type { User } from "../types/User";

const authRepository = new AuthRepository();

declare module "express-session" {
    interface SessionData {
        user: User | undefined;
    }
}

export async function AuthMiddleware(req: Request, res: Response, next: Function) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).send({ error: "No token provided" });
    }

    const userSession = await authRepository.verifySession(token);
    if (!userSession) {
        return res.status(403).send({ error: "Invalid or expired token" });
    }

    req.session.user = userSession;

    await next();
}