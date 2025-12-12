import type { Context } from "hono";
import { prisma } from "../config/db";
import type { Role, BookingStatus } from "../generated/prisma/enums";
import "../types/hono.d";

/**
 * Admin Controller
 * Handles admin-only operations for users and bookings management
 */
class AdminController {
  /**
   * Get all users with pagination
   * @route GET /admin/users
   * @query page - Page number (default: 1)
   * @query pageSize - Items per page (default: 10)
   * @query role - Filter by role (USER, ADMIN)
   */
  public getAllUsers = async (c: Context): Promise<Response> => {
    try {
      const page = parseInt(c.req.query("page") || "1");
      const pageSize = parseInt(c.req.query("pageSize") || "10");
      const role = c.req.query("role");
      const skip = (page - 1) * pageSize;

      // Build where clause
      const where: { role?: Role } = {};
      if (role) {
        where.role = role.toUpperCase() as Role;
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          orderBy: { createdAt: "desc" },
          skip,
          take: pageSize,
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            licenseUrl: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: { bookings: true },
            },
          },
        }),
        prisma.user.count({}),
      ]);

      return c.json({
        message: "Successfully retrieved users",
        data: users,
        pagination: {
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        },
      });
    } catch (error: unknown) {
      console.error("Failed to get users:", error);
      return c.json({ message: "Failed to get users" }, 500);
    }
  };

  /**
   * Get all bookings with pagination (admin view)
   * @route GET /admin/bookings
   * @query page - Page number (default: 1)
   * @query pageSize - Items per page (default: 10)
   * @query status - Filter by status (PENDING, CONFIRMED, CANCELLED, COMPLETED)
   */
  public getAllBookings = async (c: Context): Promise<Response> => {
    try {
      const page = parseInt(c.req.query("page") || "1");
      const pageSize = parseInt(c.req.query("pageSize") || "10");
      const status = c.req.query("status");
      const skip = (page - 1) * pageSize;

      // Build where clause
      const where: { status?: BookingStatus } = {};
      if (status) {
        where.status = status.toUpperCase() as BookingStatus;
      }

      const [bookings, total] = await Promise.all([
        prisma.booking.findMany({
          orderBy: { createdAt: "desc" },
          skip,
          take: pageSize,
          include: {
            car: {
              select: {
                id: true,
                name: true,
                brand: true,
                type: true,
                pricePerDay: true,
                imageUrl: true,
              },
            },
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        }),
        prisma.booking.count({}),
      ]);

      // Calculate total price for each booking
      const bookingsWithPrice = bookings.map((booking) => {
        const days = Math.ceil(
          (booking.endDate.getTime() - booking.startDate.getTime()) /
            (1000 * 60 * 60 * 24)
        );
        return {
          ...booking,
          totalDays: days,
          totalPrice: days * booking.car.pricePerDay,
        };
      });

      return c.json({
        message: "Successfully retrieved bookings",
        data: bookingsWithPrice,
        pagination: {
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        },
      });
    } catch (error: unknown) {
      console.error("Failed to get bookings:", error);
      return c.json({ message: "Failed to get bookings" }, 500);
    }
  };

  /**
   * Approve a booking (mark as confirmed)
   * @route PUT /admin/bookings/:id/approve
   */
  public approveBooking = async (c: Context): Promise<Response> => {
    const bookingId = c.req.param("id");

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
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

      if (!existingBooking) {
        return c.json({ message: "Booking not found" }, 404);
      }

      // Check booking status
      if (existingBooking.status === "CONFIRMED") {
        return c.json({ message: "Booking is already confirmed" }, 400);
      }

      if (existingBooking.status === "CANCELLED") {
        return c.json({ message: "Cannot approve a cancelled booking" }, 400);
      }

      if (existingBooking.status === "COMPLETED") {
        return c.json({ message: "Booking is already completed" }, 400);
      }

      // Update booking status to CONFIRMED
      const approvedBooking = await prisma.booking.update({
        where: { id: bookingId },
        data: { status: "CONFIRMED" },
        include: {
          car: {
            select: {
              id: true,
              name: true,
              brand: true,
              pricePerDay: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Calculate total price
      const days = Math.ceil(
        (approvedBooking.endDate.getTime() -
          approvedBooking.startDate.getTime()) /
          (1000 * 60 * 60 * 24)
      );

      return c.json({
        message: "Booking approved successfully",
        data: {
          ...approvedBooking,
          totalDays: days,
          totalPrice: days * approvedBooking.car.pricePerDay,
        },
      });
    } catch (error: unknown) {
      console.error("Failed to approve booking:", error);
      return c.json({ message: "Failed to approve booking" }, 500);
    }
  };
}

export default new AdminController();
