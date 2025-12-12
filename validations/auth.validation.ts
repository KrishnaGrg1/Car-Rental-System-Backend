import { z } from "zod";

const AuthValidation = {
  register: {
    body: z.object({
      name: z.string().min(2).max(150).trim(),
      email: z.string().email().trim().toLowerCase(),
      password: z.string().min(8).max(50),
    }),
  },

  login: {
    body: z.object({
      email: z.string().email().trim().toLowerCase(),
      password: z.string().min(8).max(50),
    }),
  },
};

export default AuthValidation;
