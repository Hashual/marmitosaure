import type { Request, Response } from "express";
import { AuthRepository } from "../models/auth.ts";
import bcrypt from "bcrypt";
import { v6 as uuidv6 } from "uuid";
import type { User } from "../types/User";
import { createUser, getUserFromUsername } from "../models/user.ts";


const SALT = 10

export class AuthController {
    private authRepository = new AuthRepository();

    login = async (req: Request, res: Response) => {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).send({ error: "Missing username or password"  });
        }

        const user = await getUserFromUsername(username);
        if (!user) {
            return res.status(401).send({ error: "Invalid username or password 1" });
        }

        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).send({ error: "Invalid username or password 2" });
        }

        const jwt = await this.authRepository.createSession(user);

        res.status(200).send({ token: jwt });
    }

    register = async (req: Request, res: Response) => {
        const { username, password, email } = req.body;
        const hashedPassword = bcrypt.hashSync(password, SALT);
        const user : User = {
            _id : uuidv6(),
            username,
            password: hashedPassword,
            email,
            registration_date : new Date().toISOString()
        }

        if (!username || !password || !email) {
            return res.status(400).send({ error: "Missing username, password or email" });
        }
        else {
            const existingUser = await getUserFromUsername(username);
            if (existingUser) {
                return res.status(409).send({ error: "Username already exists" });
            }
            else {
                await createUser(user);
                res.status(201).send({ message: "User registered successfully" });
            }
        }
    }
}
