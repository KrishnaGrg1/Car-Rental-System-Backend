import { z } from "zod";

/**
 * Phone number regex patterns for common formats
 */
const phoneRegex =
  /^(\+?\d{1,3}[-.\s]?)?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/;

const UserValidation = {
  updateProfile: {
    body: z.object({
      name: z.string().min(2).max(150).trim().optional(),
      phone: z
        .string()
        .regex(phoneRegex, "Invalid phone number format")
        .min(7, "Phone number must be at least 7 digits")
        .max(20, "Phone number must not exceed 20 characters")
        .optional(),
      password: z.string().min(8).max(50).optional(),
    }),
  },
};

export default UserValidation;
