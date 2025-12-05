import type { Request, Response } from "express";

export class MeController {
    index = async (req: Request, res: Response) => {
        const user = req.session.user!;

        res.status(200).send({ user });
    }
}