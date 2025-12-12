import { Hono } from "hono";

import CarController from "../controllers/car.controller";
import authMiddleware from "../middlewares/auth.middleware";

const carRoutes = new Hono();
carRoutes.use("/*", authMiddleware);
carRoutes.get("/", CarController.getAllCars);
carRoutes.get("/:id", CarController.getCarById);
carRoutes.put("/:id", CarController.updateCardetails);
carRoutes.delete("/:id", CarController.deleteCar);
export default carRoutes;
