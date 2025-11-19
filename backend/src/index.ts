import { SetupCassandra } from "./lib/cassandra";
import { SetupMongoose } from "./lib/mongodb";
import { RecipesRouter } from "./routes/recipes.routes";
import { TagsRouter } from "./routes/tags.routes";
import express from "express";
import { logger } from "./utils/logger";

const app = express();
const port = 5000;

await SetupMongoose();
await SetupCassandra();

app.use('/recipes', RecipesRouter);
app.use('/tags', TagsRouter);

app.listen(port, () => {
  logger.info(`Listening on port ${port}`);
});
