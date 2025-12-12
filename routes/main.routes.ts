import { Hono } from "hono";
import { serveStatic } from "hono/bun";

import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import carRoutes from "./car.routes";
import bookingRoutes from "./booking.routes";
import adminRoutes from "./admin.routes";

const mainRoutes = new Hono();

// API Routes
mainRoutes.route("/auth", authRoutes);
mainRoutes.route("/user", userRoutes);
mainRoutes.route("/car", carRoutes);
mainRoutes.route("/booking", bookingRoutes);
mainRoutes.route("/admin", adminRoutes);

// Static file serving for uploads
mainRoutes.get("/uploads/*", serveStatic({ root: "./" }));

export default mainRoutes;
