import { z } from "zod";

const BookingValidation = {
  createBooking: {
    body: z
      .object({
        carId: z.string().uuid("Invalid car ID format"),
        startDate: z
          .string()
          .datetime({
            message: "Invalid start date format. Use ISO 8601 format",
          })
          .transform((val) => new Date(val)),
        endDate: z
          .string()
          .datetime({ message: "Invalid end date format. Use ISO 8601 format" })
          .transform((val) => new Date(val)),
      })
      .refine((data) => data.startDate >= new Date(), {
        message: "Start date cannot be in the past",
        path: ["startDate"],
      })
      .refine((data) => data.endDate > data.startDate, {
        message: "End date must be after start date",
        path: ["endDate"],
      }),
  },
};

export default BookingValidation;
