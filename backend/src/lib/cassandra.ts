import { DataAPIClient, Db } from "@datastax/astra-db-ts";
import { logger } from "../utils/logger";

const ASTRA_API_KEY = process.env.ASTRA_API_KEY || "";
const ASTRA_ENDPOINT = process.env.ASTRA_ENDPOINT || "";

let _db: Db | undefined;
export async function SetupCassandra() {
    const client = new DataAPIClient(ASTRA_API_KEY);
    _db = client.db(ASTRA_ENDPOINT);

    await _db.listCollections();
    logger.info('Successfully connected to AstraDB');
}

export default function db(): Db {
    if (!_db) throw new Error("Database connection not initialized");
    return _db;
}
