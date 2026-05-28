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

  price: z.coerce.number().min(0, "Price must be greater than or equal to 0"),

  hour: z.coerce
    .number()
    .int("Hour must be an integer")
    .min(0, "Hour must be greater than or equal to 0"),

  minute: z.coerce
    .number()
    .int("Minute must be an integer")
    .min(0, "Minute must be greater than or equal to 0")
    .max(59, "Minute must not exceed 59"),
  staffIds: z
    .string()
    .transform((val) => JSON.parse(val))
    .pipe(z.array(z.string()))
    .optional(),
});

export const updateServiceSchema = createServiceSchema.partial().extend({
  image_path: z.string().optional(),
});

type CreateServiceBodyDTO = z.infer<typeof createServiceSchema>;

export type CreateServiceDTO = CreateServiceBodyDTO & {
  image_path?: string | null;
  business_id: string;
};

export type UpdateServiceDTO = z.infer<typeof updateServiceSchema>;

export const assignStaffSchema = z.object({
  service_id: z.string().min(1, "Service ID is required"),
  staff_id: z.string().min(1, "Staff ID is required"),
  business_id: z.string().optional(),
});

export type AssignStaffDTO = z.infer<typeof assignStaffSchema>;
