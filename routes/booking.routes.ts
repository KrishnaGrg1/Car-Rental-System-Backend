import { Hono } from "hono";
import authMiddleware from "../middlewares/auth.middleware";
import BookingController from "../controllers/booking.controller";
import validate from "../middlewares/validation.middleware";
import BookingValidation from "../validations/booking.validation";

const bookingRoutes = new Hono();

bookingRoutes.use("/*", authMiddleware);

bookingRoutes.get("", BookingController.getAllBooking);
bookingRoutes.get("/:id", BookingController.getBookingDetailsById);
bookingRoutes.put("/:id/cancel", BookingController.cancelBooking);
bookingRoutes.post(
  "/create",
  validate(BookingValidation.createBooking),
  BookingController.createBooking
);

export default bookingRoutes;
