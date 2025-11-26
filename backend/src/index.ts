import { SetupCassandra } from "./lib/cassandra";
import { SetupMongoose } from "./lib/mongodb";
import express from "express";
import session from "express-session"
import bodyParser from "body-parser";
import { logger } from "./utils/logger";

const SESSION_SECRET = process.env.SESSION_SECRET || 'default';

const app = express();
const port = 5000;

const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use(session({
    secret: SESSION_SECRET,
    cookie: { maxAge: 60000 }
}));

app.use(jsonParser);
app.use(urlencodedParser);

await SetupMongoose();
await SetupCassandra();

const { RecipesRouter } = await import("./routes/recipes.routes");
const { TagsRouter } = await import("./routes/tags.routes");
const { AuthRouter } = await import("./routes/auth.routes");
const { MeRouter } = await import("./routes/me.routes");

app.use('/recipes', RecipesRouter);
app.use('/tags', TagsRouter);
app.use('/login', AuthRouter);
app.use('/me', MeRouter);

app.listen(port, () => {
  logger.info(`Listening on port ${port}`);
});
