import type { Request, Response } from "express";
import { AuthRepository } from "../models/auth.ts";
// import bcrypt from "bcrypt";


const SALT = 10

export class AuthController {
    private authRepository = new AuthRepository();

    login = async (req: Request, res: Response) => {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).send({ error: "Missing username or password" });
        }

        // const mdpHash =  bcrypt.hashSync(mot_de_passe, SALT);

        const user = await this.authRepository.findUserByUsername(username);
        if (!user) {
            return res.status(401).send({ error: "Invalid username or password" });
        }

        const jwt = await this.authRepository.createSession(user);

        res.status(200).send({ token: jwt });
    }
}
