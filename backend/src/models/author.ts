import type { UUID } from "crypto"
import db from "../lib/cassandra"


const usersCollection = db().collection('users');

export interface Author {
    _id: UUID;
    username: string;
}

export async function getAuthorsByIds(ids: string[]): Promise<Author[]> {
    if (ids.length === 0) return [];

    try {
        const authors = await usersCollection.find<Author>(
            { 
                _id: { $in: ids } 
            },
            {
                projection: { _id: 1, username: 1 }
            }
        ).toArray();

        return authors;
    } catch (error) {
        console.error("Erreur lors de la récupération des auteurs ciblés:", error);
        return [];
    }
}