import { Hono } from "hono";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import carRoutes from "./car.routes";

const mainRoutes = new Hono();

mainRoutes.route("/auth", authRoutes);
mainRoutes.route("/user", userRoutes);
mainRoutes.route("/car", carRoutes);
export default mainRoutes;
