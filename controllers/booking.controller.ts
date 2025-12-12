import type { Context } from "hono";
import { prisma } from "../config/db";
import "../types/hono.d";

class BookingController {
  public createBooking = async (c: Context): Promise<Response> => {
    const userId = c.req.userId;

    if (!userId) {
      return c.json({ message: "Authentication required" }, 401);
    }

    const { carId, startDate, endDate } = c.req.validatedBody as {
      carId: string;
      startDate: Date;
      endDate: Date;
    };

    try {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      });

      if (!existingUser) {
        return c.json({ message: "User not found" }, 404);
      }

      // Check if car exists
      const existingCar = await prisma.car.findUnique({
        where: { id: carId },
      });

      if (!existingCar) {
        return c.json({ message: "Car not found" }, 404);
      }

      // Check for overlapping bookings
      const overlappingBooking = await prisma.booking.findFirst({
        where: {
          carId,
          status: { in: ["PENDING", "CONFIRMED"] },
          OR: [
            {
              AND: [
                { startDate: { lte: startDate } },
                { endDate: { gte: startDate } },
              ],
            },
            {
              AND: [
                { startDate: { lte: endDate } },
                { endDate: { gte: endDate } },
              ],
            },
            {
              AND: [
                { startDate: { gte: startDate } },
                { endDate: { lte: endDate } },
              ],
            },
          ],
        },
      });

      if (overlappingBooking) {
        return c.json(
          { message: "Car is not available for the selected dates" },
          409
        );
      }

      // Create booking
      const booking = await prisma.booking.create({
        data: {
          userId,
          carId,
          startDate,
          endDate,
        },
        include: {
          car: {
            select: {
              name: true,
              brand: true,
              pricePerDay: true,
            },
          },
        },
      });

      // Calculate total price
      const days = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const totalPrice = days * booking.car.pricePerDay;

      return c.json(
        {
          message: "Booking created successfully",
          data: {
            ...booking,
            totalDays: days,
            totalPrice,
          },
        },
        201
      );
    } catch (error: unknown) {
      console.error("Failed creating booking:", error);
      return c.json({ message: "Failed to create booking" }, 500);
    }
  };
  public getAllBooking = async (c: Context): Promise<Response> => {
    const userId = c.req.userId;
    try {
      const page = parseInt(c.req.query("page") as string) || 1;
      const pageSize = parseInt(c.req.query("pageSize") as string) || 10;
      const skip = (page - 1) * pageSize;
      const [users, total] = await Promise.all([
        prisma.booking.findMany({
          where: {
            userId,
          },
          orderBy: {
            createdAt: "desc",
          },
          skip,
          take: pageSize,
        }),
        prisma.booking.count({
          where: {
            userId,
          },
        }),
      ]);
      return c.json({
        users,
        pagination: {
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        },
        message: "Successfully retrieved all booking",
      });
    } catch (e: unknown) {
      console.error("Failed to get all booking");
      const message =
        e instanceof Error ? e.message : "Failed to get all Booking";
      return c.json(
        {
          message,
        },
        500
      );
    }
  };
  public getBookingDetailsById = async (c: Context): Promise<Response> => {
    const bookingId = c.req.param("id");
    try {
      const existingBooking = await prisma.booking.findUnique({
        where: {
          id: bookingId,
        },
      });
      return c.json(
        {
          message: "Successfully retrieved the Booking details",
          existingBooking,
        },
        200
      );
    } catch (e: unknown) {
      console.error("Failed to get booking details", e);
      const message =
        e instanceof Error ? e.message : "Failed to get booking details";
      return c.json({ message: "Failed to get booking details" }, 500);
    }
  };

  public cancelBooking = async (c: Context): Promise<Response> => {
    const userId = c.req.userId;
    const bookingId = c.req.param("id");

    if (!userId) {
      return c.json({ message: "Authentication required" }, 401);
    }

    try {
      const existingBooking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          car: {
            select: {
              name: true,
              brand: true,
            },
          },
        },
      });

      if (!existingBooking) {
        return c.json({ message: "Booking not found" }, 404);
      }

      if (existingBooking.userId !== userId) {
        return c.json({ message: "Unauthorized access" }, 403);
      }

      if (existingBooking.status === "CANCELLED") {
        return c.json({ message: "Booking is already cancelled" }, 400);
      }

      if (existingBooking.status === "COMPLETED") {
        return c.json({ message: "Cannot cancel a completed booking" }, 400);
      }

      if (new Date() > existingBooking.startDate) {
        return c.json(
          { message: "Cannot cancel a booking that has already started" },
          400
        );
      }

      const cancelledBooking = await prisma.booking.update({
        where: { id: bookingId },
        data: { status: "CANCELLED" },
        include: {
          car: {
            select: {
              name: true,
              brand: true,
            },
          },
        },
      });

      return c.json({
        message: "Booking cancelled successfully",
        data: cancelledBooking,
      });
    } catch (error: unknown) {
      console.error("Failed to cancel booking:", error);
      return c.json({ message: "Failed to cancel booking" }, 500);
    }
  };
}

export default new BookingController();
