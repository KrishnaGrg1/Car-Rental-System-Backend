import type { Context } from "hono";
import { prisma } from "../config/db";
import cloudinary from "../config/cloudnary";
import "../types/hono.d";

/**
 * Allowed file types for license upload
 */
export const ALLOWED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "application/pdf",
];
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * User Controller
 * Handles user profile operations
 */
class UserController {
  /**
   * Get current user profile
   * @route GET /user/me
   */
  public getMe = async (c: Context): Promise<Response> => {
    const userId = c.req.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        licenseUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return c.json({ message: "User not found" }, 404);
    }

    return c.json({ message: "Success", data: user }, 200);
  };

  /**
   * Update user profile
   * @route PUT /user/me
   */
  public updateProfile = async (c: Context): Promise<Response> => {
    const userId = c.req.userId;
    const { name, phone, password } = c.req.validatedBody as {
      name?: string;
      phone?: string;
      password?: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return c.json({ message: "User not found" }, 404);
    }

    const updateData: { name?: string; phone?: string; password?: string } = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (password) updateData.password = password;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        licenseUrl: true,
        updatedAt: true,
      },
    });

    return c.json({ message: "Profile updated", data: updatedUser }, 200);
  };

  /**
   * Upload driver license
   * @route POST /user/upload
   */
  public uploadLicense = async (c: Context): Promise<Response> => {
    const userId = c.req.userId;

    try {
      const formData = await c.req.formData();
      const file = formData.get("license") as File | null;

      if (!file) {
        return c.json({ message: "License file is required" }, 400);
      }

      // Validate file type
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return c.json(
          { message: "Invalid file type. Allowed: png, jpg, jpeg, pdf" },
          400
        );
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        return c.json({ message: "File size must not exceed 5MB" }, 400);
      }

      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Determine upload type based on mime type
      const resourceType = file.type === "application/pdf" ? "raw" : "image";

      // Upload to Cloudinary
      const result = await new Promise<{
        secure_url: string;
        public_id: string;
      }>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "car-rental/licenses",
              resource_type: resourceType,
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result as { secure_url: string; public_id: string });
            }
          )
          .end(buffer);
      });

      // Update user with license URL
      await prisma.user.update({
        where: { id: userId },
        data: { licenseUrl: result.secure_url },
      });

      return c.json(
        {
          message: "License uploaded successfully",
          url: result.secure_url,
        },
        200
      );
    } catch (error) {
      console.error("Upload error:", error);
      return c.json({ message: "Failed to upload license" }, 500);
    }
  };
}

export default new UserController();
