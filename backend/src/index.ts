import bodyParser from "body-parser"
import cors from "cors"
import express from "express"
import session from "express-session"
import { SetupCassandra } from "./lib/cassandra"
import { SetupMongoose } from "./lib/mongodb"
import { logger } from "./utils/logger"

const SESSION_SECRET = process.env.SESSION_SECRET || 'default';

const app = express();
const port = 5000;

const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use(session({
    secret: SESSION_SECRET,
    cookie: { maxAge: 60000 }
}));

app.use(cors({
    origin: 'http://localhost:5174',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(jsonParser);
app.use(urlencodedParser);

await SetupMongoose();
await SetupCassandra();

const { RecipesRouter } = await import("./routes/recipes.routes");
const { ReviewsRouter } = await import("./routes/reviews.routes");
const { TagsRouter } = await import("./routes/tags.routes");
const { AuthRouter } = await import("./routes/auth.routes");
const { MeRouter } = await import("./routes/me.routes");

app.use('/images', express.static('public'));

app.use('/recipes', RecipesRouter);
app.use('/reviews', ReviewsRouter);
app.use('/tags', TagsRouter);
app.use('/auth', AuthRouter);
app.use('/me', MeRouter);

app.listen(port, () => {
  logger.info(`Listening on port ${port}`);
});
