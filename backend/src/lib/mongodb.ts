import "dotenv/config";
import mongoose from "mongoose";
import { logger } from "../utils/logger";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/marmitosaure";

export async function SetupMongoose() {
	await mongoose.connect(MONGODB_URI);

	logger.info('Successfuly connected to MongoDB');	
}