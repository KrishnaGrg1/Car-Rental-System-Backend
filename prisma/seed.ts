import { prisma } from "../config/db";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

/**
 * Seed data for Users
 */
const users = [
  {
    name: "Admin User",
    email: "admin@carrental.com",
    password: "admin123",
    phone: "+977-9800000001",
    role: "ADMIN" as const,
  },
  {
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
    phone: "+977-9800000002",
    role: "USER" as const,
  },
  {
    name: "Jane Smith",
    email: "jane@example.com",
    password: "password123",
    phone: "+977-9800000003",
    role: "USER" as const,
  },
];

/**
 * Seed data for Cars
 */
const cars = [
  {
    name: "Corolla",
    brand: "Toyota",
    type: "SEDAN" as const,
    fuelType: "PETROL" as const,
    seats: 5,
    pricePerDay: 50,
    imageUrl: "https://example.com/images/corolla.jpg",
  },
  {
    name: "Civic",
    brand: "Honda",
    type: "SEDAN" as const,
    fuelType: "PETROL" as const,
    seats: 5,
    pricePerDay: 55,
    imageUrl: "https://example.com/images/civic.jpg",
  },
  {
    name: "CR-V",
    brand: "Honda",
    type: "SUV" as const,
    fuelType: "DIESEL" as const,
    seats: 7,
    pricePerDay: 80,
    imageUrl: "https://example.com/images/crv.jpg",
  },
  {
    name: "Fortuner",
    brand: "Toyota",
    type: "SUV" as const,
    fuelType: "DIESEL" as const,
    seats: 7,
    pricePerDay: 100,
    imageUrl: "https://example.com/images/fortuner.jpg",
  },
  {
    name: "Swift",
    brand: "Suzuki",
    type: "HATCHBACK" as const,
    fuelType: "PETROL" as const,
    seats: 5,
    pricePerDay: 35,
    imageUrl: "https://example.com/images/swift.jpg",
  },
  {
    name: "Model 3",
    brand: "Tesla",
    type: "SEDAN" as const,
    fuelType: "ELECTRIC" as const,
    seats: 5,
    pricePerDay: 120,
    imageUrl: "https://example.com/images/model3.jpg",
  },
  {
    name: "Prius",
    brand: "Toyota",
    type: "HATCHBACK" as const,
    fuelType: "HYBRID" as const,
    seats: 5,
    pricePerDay: 60,
    imageUrl: "https://example.com/images/prius.jpg",
  },
  {
    name: "Hiace",
    brand: "Toyota",
    type: "VAN" as const,
    fuelType: "DIESEL" as const,
    seats: 12,
    pricePerDay: 90,
    imageUrl: "https://example.com/images/hiace.jpg",
  },
  {
    name: "Hilux",
    brand: "Toyota",
    type: "TRUCK" as const,
    fuelType: "DIESEL" as const,
    seats: 5,
    pricePerDay: 85,
    imageUrl: "https://example.com/images/hilux.jpg",
  },
  {
    name: "Ranger",
    brand: "Ford",
    type: "TRUCK" as const,
    fuelType: "DIESEL" as const,
    seats: 5,
    pricePerDay: 90,
    imageUrl: "https://example.com/images/ranger.jpg",
  },
];

/**
 * Main seed function
 */
async function main() {
  console.log("🌱 Starting seed...\n");

  // Clear existing data
  console.log("🧹 Clearing existing data...");
  await prisma.booking.deleteMany();
  await prisma.car.deleteMany();
  await prisma.user.deleteMany();

  // Seed Users
  console.log("👤 Creating users...");
  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, SALT_ROUNDS);
    const createdUser = await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: hashedPassword,
        phone: user.phone,
        role: user.role,
      },
    });
    console.log(
      `   ✓ Created user: ${createdUser.email} (${createdUser.role})`,
    );
  }

  // Seed Cars
  console.log("\n🚗 Creating cars...");
  for (const car of cars) {
    const createdCar = await prisma.car.create({
      data: car,
    });
    console.log(`   ✓ Created car: ${createdCar.brand} ${createdCar.name}`);
  }

  console.log("\n✅ Seed completed successfully!");
  console.log(`   - ${users.length} users created`);
  console.log(`   - ${cars.length} cars created`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
