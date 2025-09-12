import express from "express";
import { RecipesRouter } from "./routes/recipes.routes";

const app = express();
const port = 3000;

app.use('/recipes', RecipesRouter);

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
