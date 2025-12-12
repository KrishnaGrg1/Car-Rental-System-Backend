import { Hono } from "hono";
import { logger } from "hono/logger";
import env from "./config/env";
import mainRoutes from "./routes/main.routes";
import { cors } from "hono/cors";

const app = new Hono();

app.use("*", logger());
app.use("*", cors());
app.route("/api/v1", mainRoutes);

export default {
  port: Number(env.PORT),
  fetch: app.fetch,
};
app.fire();
