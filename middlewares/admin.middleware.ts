import type { MiddlewareHandler } from "hono";
import { prisma } from "../config/db";
import "../types/hono.d";

/**
 * Admin Middleware
 * Checks if authenticated user has ADMIN role
 * Must be used AFTER authMiddleware
 */
const adminMiddleware: MiddlewareHandler = async (c, next) => {
  const userId = c.req.userId;

  if (!userId) {
    return c.json({ message: "Authentication required" }, 401);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      return c.json({ message: "User not found" }, 404);
    }

    if (user.role !== "ADMIN") {
      return c.json({ message: "Admin access required" }, 403);
    }

    await next();
  } catch (error) {
    console.error("Admin middleware error:", error);
    return c.json({ message: "Authorization failed" }, 500);
  }
};

export default adminMiddleware;
