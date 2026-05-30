// src/validators/get-available-slots.validator.ts

import z from "zod";

export const getAvailabilitySchema = z.object({
  service_id: z.cuid(),

  staff_id: z.cuid(),

  date: z.iso.datetime(),
});

/**
 * Match Prisma enum PaymentMethod
 */
export const PaymentMethodEnum = z.enum(["CASH", "BANK"]);
export type PaymentMethod = z.infer<typeof PaymentMethodEnum>;

/**
 * Base Booking Schema (shared shape)
 */
export const BookingSchema = z.object({
  id: z.string().cuid(),
  service_id: z.string().cuid(),
  staff_id: z.string().cuid(),

  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),

  email_address: z.string().email("Invalid email address"),
  phone_number: z.string().min(6, "Phone number is required"),

  aditional_notes: z.string().optional(),

  payment_method: PaymentMethodEnum,

  booking_date: z.coerce.date(),

  start_time: z.string().min(1, "Start time is required"),

  created_at: z.coerce.date(),
});

export const CreateBookingDtoSchema = BookingSchema.omit({
  id: true,
  created_at: true,
});

export type CreateBookingDto = z.infer<typeof CreateBookingDtoSchema>;
