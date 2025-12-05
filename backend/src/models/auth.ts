import { uuid, type Db } from "@datastax/astra-db-ts";
import db from "../lib/cassandra";
import type Redis from "ioredis";
import redis from "../lib/redis";
import type { User } from "../types/User";
import { v6 as uuidv6 } from "uuid";
import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "jwt_secret_key";
const SESSION_EXPIRES_STR = "1h";
const SESSION_EXPIRES_INT = 3600;

export class AuthRepository {
    private redisDb: Redis;

    constructor() {
        this.redisDb = redis;
    }

    findUserByUsername = async (username: string) => {
        return db().collection("users").findOne({ nom_utilisateur: username }) as Promise<User | undefined>;
    }

    createSession = async (user: User) => {
        const sessionId = uuidv6()

        const token = jwt.sign(
            {
                user: {
                    id: user.utilisateur_id,
                    username: user.nom_utilisateur,
                    email: user.email
                },
                sessionId
            },
            ACCESS_TOKEN_SECRET,
            { expiresIn: SESSION_EXPIRES_STR }
        )

        await this.redisDb.set(sessionId, JSON.stringify(user), 'EX', SESSION_EXPIRES_INT);

        return token;
    }

    verifySession = async (token: string) => {
        try {
            const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as { sessionId: string };
            const sessionData = await this.redisDb.get(decoded.sessionId);
            if (!sessionData) {
                return null;
            }

            return JSON.parse(sessionData) as User;
        } catch (err) {
            return null;
        }
    }
}
