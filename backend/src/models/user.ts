import db from "../lib/cassandra";
import type { User } from "../types/User";

export async function getUserFromUsername(username: string): Promise<User | undefined> {
	const currentDb = await db();
	return currentDb.collection("users").findOne({ username }) as Promise<User | undefined>;
}

export async function getUserFromId(id: string): Promise<User | undefined> {
	const currentDb = await db();
	return currentDb.collection("users").findOne({ _id: id }) as Promise<User | undefined>;
}

export async function createUser(user: User): Promise<User> {
	const currentDb = await db();
	await currentDb.collection("users").insertOne(user);
	return user;
}