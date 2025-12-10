# 🚗 Car Rental API

A RESTful API for car rental management built with [Hono](https://hono.dev/), [Prisma](https://www.prisma.io/), and [Bun](https://bun.sh/).

## 📋 Table of Contents

- [Features](#-features)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
  - [Auth Routes](#1️⃣-auth-routes)
  - [User Routes](#2️⃣-user-routes)
  - [Car Routes](#3️⃣-car-routes)
  - [Booking Routes](#4️⃣-booking-routes)
  - [Admin Routes](#5️⃣-admin-routes)
  - [File Upload](#6️⃣-file-upload--static-files)

---

## ✨ Features

- 🔐 JWT-based authentication
- 👤 User registration & profile management
- 🚙 Car listing with filters (type, brand, fuel)
- 📅 Booking management system
- 👑 Admin dashboard for managing users & bookings
- 📁 File upload support for driver licenses

---

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) v1.2.23 or higher
- PostgreSQL database (or any Prisma-supported database)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd carRental

# Install dependencies
bun install

# Set up your database
bun prisma migrate dev

# Start the development server
bun dev
```

---

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/carrental"
JWT_SECRET="your-super-secret-jwt-key"
BCRYPT_SALT_ROUNDS=10
PORT=3000
```

---

## 📖 API Documentation

Base URL: `/api/v1`

### 1️⃣ Auth Routes

| Method | Endpoint         | Request Body                                                                 | Description            |
| ------ | ---------------- | ---------------------------------------------------------------------------- | ---------------------- |
| POST   | `/auth/register` | `{ "name": "John", "email": "john@example.com", "password": "123456" }`      | Register a new user    |
| POST   | `/auth/login`    | `{ "email": "john@example.com", "password": "123456" }`                      | Login and get JWT token |

---

### 2️⃣ User Routes

> 🔒 **Requires Authorization:** `Bearer <token>`

| Method | Endpoint       | Request Body                                    | Description                     |
| ------ | -------------- | ----------------------------------------------- | ------------------------------- |
| GET    | `/user/me`     | None                                            | Get logged-in user profile      |
| PUT    | `/user/me`     | `{ "name": "John New", "phone": "9876543210" }` | Update logged-in user profile   |
| POST   | `/user/upload` | `FormData { license: File }`                    | Upload driver license (optional)|

---

### 3️⃣ Car Routes

| Method | Endpoint    | Request Body                                                                                      | Description                          |
| ------ | ----------- | ------------------------------------------------------------------------------------------------- | ------------------------------------ |
| GET    | `/cars`     | Query params: `?type=SUV&brand=Toyota`                                                            | Get all cars, filter by type/brand   |
| GET    | `/cars/:id` | None                                                                                              | Get car details by ID                |
| POST   | `/cars`     | `{ "name": "Corolla", "brand": "Toyota", "type": "Sedan", "pricePerDay": 50, "seats": 5 }`       | Create a new car *(admin only)*      |
| PUT    | `/cars/:id` | `{ "pricePerDay": 60 }`                                                                           | Update car details *(admin only)*    |
| DELETE | `/cars/:id` | None                                                                                              | Delete a car *(admin only)*          |

---

### 4️⃣ Booking Routes

> 🔒 **Requires Authorization:** `Bearer <token>`

| Method | Endpoint              | Request Body                                                                                       | Description              |
| ------ | --------------------- | -------------------------------------------------------------------------------------------------- | ------------------------ |
| POST   | `/booking/create`     | `{ "carId": "car_id_here", "startDate": "2025-12-12T10:00:00", "endDate": "2025-12-15T10:00:00" }` | Create a new booking     |
| GET    | `/booking/:id`        | None                                                                                               | Get booking details by ID|
| PUT    | `/booking/:id/cancel` | None                                                                                               | Cancel a booking         |

---

### 5️⃣ Admin Routes

> 🔒 **Requires Authorization:** `Bearer <token>` + **Admin role**

| Method | Endpoint                    | Request Body | Description                        |
| ------ | --------------------------- | ------------ | ---------------------------------- |
| GET    | `/admin/users`              | None         | List all users                     |
| GET    | `/admin/bookings`           | None         | List all bookings                  |
| PUT    | `/admin/bookings/:id/approve` | None       | Approve a booking (mark confirmed) |

---

### 6️⃣ File Upload / Static Files

| Method | Endpoint             | Description                               |
| ------ | -------------------- | ----------------------------------------- |
| GET    | `/uploads/:filename` | Serve uploaded files (license, car images)|

---

## 📁 Project Structure

```
carRental/
├── config/           # Database and environment configuration
├── controllers/      # Route handlers
├── middlewares/      # Auth & validation middlewares
├── prisma/           # Prisma schema and migrations
├── routes/           # API route definitions
├── types/            # TypeScript type declarations
├── validations/      # Zod validation schemas
└── index.ts          # Application entry point
```

---

## 🛠️ Tech Stack

- **Runtime:** [Bun](https://bun.sh/)
- **Framework:** [Hono](https://hono.dev/)
- **ORM:** [Prisma](https://www.prisma.io/)
- **Validation:** [Zod](https://zod.dev/)
- **Authentication:** JWT (jsonwebtoken)

---

## 📝 License

This project is licensed under the MIT License.
