import { DataAPIClient, Db } from "@datastax/astra-db-ts";
import { logger } from "../utils/logger";

const ASTRA_API_KEY = process.env.ASTRA_API_KEY || "";
const ASTRA_ENDPOINT = process.env.ASTRA_ENDPOINT || "";

let db: Db | undefined;
export async function SetupCassandra() {
    const client = new DataAPIClient(ASTRA_API_KEY);
    db = client.db(ASTRA_ENDPOINT);

    await db.listCollections();
    logger.info('Successfully connected to AstraDB');
}

export function getDb(): Db {
    if (!db) {
        throw new Error("Database connection not initialized");
    }
    return db;
}

export default getDb;