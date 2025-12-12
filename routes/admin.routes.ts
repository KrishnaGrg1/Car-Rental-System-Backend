import { Hono } from "hono";

import AdminController from "../controllers/admin.controller";
import authMiddleware from "../middlewares/auth.middleware";
import adminMiddleware from "../middlewares/admin.middleware";

const adminRoutes = new Hono();

adminRoutes.use("/*", authMiddleware);
adminRoutes.use("/*", adminMiddleware);

adminRoutes.get("/users", AdminController.getAllUsers);

adminRoutes.get("/bookings", AdminController.getAllBookings);
adminRoutes.put("/bookings/:id/approve", AdminController.approveBooking);

export default adminRoutes;
