import { SetupMongoose } from "./lib/mongodb";
import { RecipesRouter } from "./routes/recipes.routes";
import { TagsRouter } from "./routes/tags.routes";
import express from "express";

const app = express();
const port = 3000;

await SetupMongoose();

app.use('/recipes', RecipesRouter);
app.use('/tags', TagsRouter);

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
