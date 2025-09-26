import "dotenv/config";
import { MongoClient } from "mongodb";
import { logger } from "../utils/logger";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/marmitosaure";

export const mongodb = new MongoClient(MONGODB_URI);

await mongodb.connect();

logger.info("Connected to MongoDB");

mongodb.on("close", () => {
	logger.warn("Disconnected from MongoDB");
});

mongodb.on("reconnect", () => {
	logger.warn("Reconnecting to MongoDB...");
});