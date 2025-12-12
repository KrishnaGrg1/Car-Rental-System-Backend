import { Hono } from "hono";
import authController from "../controllers/auth.controller";
import validate from "../middlewares/validation.middleware";
import authValidation from "../validations/auth.validation";
import authMiddleware from "../middlewares/auth.middleware";

const authRoutes = new Hono();

authRoutes.post(
  "/register",
  validate(authValidation.register),
  authController.registerUser,
);
authRoutes.post(
  "/login",
  validate(authValidation.login),
  authController.loginUser,
);
authRoutes.get("/me", authMiddleware, authController.getMe);
authRoutes.post("/logout", authController.logout);

export default authRoutes;
