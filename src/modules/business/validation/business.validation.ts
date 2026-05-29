import { z } from "zod";
import { DayOfWeek } from "@prisma/client";

export const createBusinessSchema = z.object({
  business_name: z
    .string()
    .min(1, "Business name is required")
    .max(255, "Business name must not exceed 255 characters"),

  category: z
    .string()
    .min(1, "Category is required")
    .max(100, "Category must not exceed 100 characters"),

  description: z
    .string()
    .max(300, "Description must not exceed 300 characters")
    .optional(),

  email: z.email("Invalid email address").optional(),

  phone: z.string().optional(),

  address: z.string().optional(),
});

export type CreateBusinessDTO = z.infer<typeof createBusinessSchema> & {
  logo?: string;
};

export const createBusinessHoursSchema = z.object({
  schedules: z
    .array(
      z.object({
        day: z.enum(DayOfWeek, {
          error: "Day is required",
        }),

        is_closed: z.boolean().default(false),

        open_time: z
          .string()
          .regex(
            /^([01]\d|2[0-3]):([0-5]\d)$/,
            "Open time must be in HH:mm format",
          )
          .default("00:00"),

        close_time: z
          .string()
          .regex(
            /^([01]\d|2[0-3]):([0-5]\d)$/,
            "Close time must be in HH:mm format",
          )
          .default("00:00"),
      }),
    )
    .min(1, "At least one business schedule is required")
    .transform((schedules) =>
      schedules.map((s) => ({
        ...s,
        open_time: s.is_closed ? "00:00" : s.open_time,
        close_time: s.is_closed ? "00:00" : s.close_time,
      })),
    ),
});

export type CreateBusinessHoursDTO = z.infer<typeof createBusinessHoursSchema>;
