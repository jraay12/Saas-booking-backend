// validations/service.validation.ts

import { z } from "zod";

export const createServiceSchema = z.object({
  service_name: z
    .string()
    .min(1, "Service name is required")
    .max(100, "Service name must not exceed 100 characters"),

  category: z
    .string()
    .min(1, "Category is required")
    .max(100, "Category must not exceed 100 characters"),

  description: z
    .string()
    .max(255, "Description must not exceed 255 characters")
    .optional(),

  price: z
    .number("Price must be a number")
    .min(0, "Price must be greater than or equal to 0"),

  hour: z
    .number("Hour must be a number")
    .int("Hour must be an integer")
    .min(0, "Hour must be greater than or equal to 0"),

  minute: z
    .number("Minute must be a number")
    .int("Minute must be an integer")
    .min(0, "Minute must be greater than or equal to 0")
    .max(59, "Minute must not exceed 59"),

  image_path: z
    .string()
    .min(1, "Image path is required"),
});

export const updateServiceSchema = createServiceSchema.partial();

export type CreateServiceDTO = z.infer<typeof createServiceSchema>;
export type UpdateServiceDTO = z.infer<typeof updateServiceSchema>;