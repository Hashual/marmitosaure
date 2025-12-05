import { SetupCassandra } from "./lib/cassandra";
import { SetupMongoose } from "./lib/mongodb";
import express from "express";
import session from "express-session"
import cors from "cors";
import bodyParser from "body-parser";
import { logger } from "./utils/logger";
import { RecipesRouter } from "./routes/recipes.routes";
import { TagsRouter } from "./routes/tags.routes";
import { AuthRouter } from "./routes/auth.routes";
import { MeRouter } from "./routes/me.routes";

const SESSION_SECRET = process.env.SESSION_SECRET || 'default';

const app = express();
const port = 5000;

const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use(session({
    secret: SESSION_SECRET,
    cookie: { maxAge: 60000 }
}));
app.use(cors());

app.use(jsonParser);
app.use(urlencodedParser);

await SetupMongoose();
await SetupCassandra();

app.use('/recipes', RecipesRouter);
app.use('/tags', TagsRouter);
app.use('/auth', AuthRouter);
app.use('/me', MeRouter);

app.listen(port, () => {
  logger.info(`Listening on port ${port}`);
});
