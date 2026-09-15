import cors from "cors";
import express from "express";

import { env } from "./config/env.js";
import { requestIdMiddleware } from "./middleware/request-id.middleware.js";
import { notFoundMiddleware } from "./middleware/not-found.middleware.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import routes from "./routes.js";

const app = express();

app.use(
  cors({
    origin: env.FRONTEND_ORIGIN,
  }),
);

app.use(express.json({ limit: "100kb" }));

app.use(requestIdMiddleware);

app.use("/api", routes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;