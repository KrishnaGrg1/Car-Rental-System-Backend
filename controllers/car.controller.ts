import type { Context } from "hono";
import { prisma } from "../config/db";
import type { CarType, FuelType } from "../generated/prisma/enums";
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from "./user.controller";
import cloudinary from "../config/cloudnary";

class CarController {
  public getAllCars = async (c: Context): Promise<Response> => {
    const { type, brand, fuelType, minPrice, maxPrice, seats } = c.req.query();

    const where: {
      type?: CarType;
      brand?: { contains: string; mode: "insensitive" };
      fuelType?: FuelType;
      pricePerDay?: { gte?: number; lte?: number };
      seats?: number;
    } = {};

    if (type) {
      where.type = type.toUpperCase() as CarType;
    }

    if (brand) {
      where.brand = { contains: brand, mode: "insensitive" };
    }

    if (fuelType) {
      where.fuelType = fuelType.toUpperCase() as FuelType;
    }

    if (minPrice || maxPrice) {
      where.pricePerDay = {};
      if (minPrice) where.pricePerDay.gte = Number(minPrice);
      if (maxPrice) where.pricePerDay.lte = Number(maxPrice);
    }

    if (seats) {
      where.seats = Number(seats);
    }

    const cars = await prisma.car.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return c.json({
      message: "Success",
      count: cars.length,
      data: cars,
    });
  };

  public getCarById = async (c: Context): Promise<Response> => {
    const id = c.req.param("id");

    const car = await prisma.car.findUnique({
      where: { id },
    });

    if (!car) {
      return c.json({ message: "Car not found" }, 404);
    }

    return c.json({ message: "Success", data: car });
  };

  public updateCardetails = async (c: Context): Promise<Response> => {
    const carId = c.req.param("id");

    // Check if car exists
    const existingCar = await prisma.car.findUnique({
      where: { id: carId },
    });

    if (!existingCar) {
      return c.json({ message: "Car not found" }, 404);
    }

    try {
      const formData = await c.req.formData();
      const file = formData.get("image") as File | null;
      const name = formData.get("name") as string | null;
      const brand = formData.get("brand") as string | null;
      const type = formData.get("type") as string | null;
      const fuelType = formData.get("fuelType") as string | null;
      const seats = formData.get("seats") as string | null;
      const pricePerDay = formData.get("pricePerDay") as string | null;

      // Build update data object with only provided fields
      const updateData: {
        name?: string;
        brand?: string;
        type?: CarType;
        fuelType?: FuelType;
        seats?: number;
        pricePerDay?: number;
        imageUrl?: string;
      } = {};

      if (name) updateData.name = name;
      if (brand) updateData.brand = brand;
      if (type) updateData.type = type.toUpperCase() as CarType;
      if (fuelType) updateData.fuelType = fuelType.toUpperCase() as FuelType;
      if (seats) updateData.seats = Number(seats);
      if (pricePerDay) updateData.pricePerDay = Number(pricePerDay);

      // Handle image upload if provided
      if (file && file.size > 0) {
        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
          return c.json(
            { message: "Invalid file type. Allowed: png, jpg, jpeg" },
            400
          );
        }

        if (file.size > MAX_FILE_SIZE) {
          return c.json({ message: "File size must not exceed 5MB" }, 400);
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const result = await new Promise<{
          secure_url: string;
          public_id: string;
        }>((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                folder: "car-rental/cars",
                resource_type: "image",
              },
              (error, result) => {
                if (error) reject(error);
                else
                  resolve(result as { secure_url: string; public_id: string });
              }
            )
            .end(buffer);
        });

        updateData.imageUrl = result.secure_url;
      }

      const updatedCar = await prisma.car.update({
        where: { id: carId },
        data: updateData,
      });

      return c.json(
        {
          message: "Car updated successfully",
          data: updatedCar,
        },
        200
      );
    } catch (error) {
      console.error("Update error:", error);
      return c.json({ message: "Failed to update car" }, 500);
    }
  };
  public deleteCar = async (c: Context): Promise<Response> => {
    const carId = c.req.param("id");
    try {
      await prisma.car.delete({
        where: {
          id: carId,
        },
      });
      return c.json(
        {
          message: "Successfully deleted car",
        },
        200
      );
    } catch (e) {
      console.error(`Delete car error:`, e);
      const message = `Delete car failed`;
      const finallmessage = e instanceof Error ? e : new Error(message);
      return c.json(finallmessage, 500);
    }
  };
}

export default new CarController();
