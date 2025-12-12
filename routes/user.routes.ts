import { Hono } from "hono";

import UserController from "../controllers/user.controller";
import authMiddleware from "../middlewares/auth.middleware";
import validate from "../middlewares/validation.middleware";
import UserValidation from "../validations/user.validation";

const userRoutes = new Hono();

userRoutes.use("/*", authMiddleware);

userRoutes.get("/me", UserController.getMe);
userRoutes.put(
  "/me",
  validate(UserValidation.updateProfile),
  UserController.updateProfile
);
userRoutes.post("/upload", UserController.uploadLicense);

export default userRoutes;
