import { z } from "zod";

export const createStaffSchema = z.object({
  first_name: z.string().min(1, "First name is required"),

  last_name: z.string().min(1, "Last name is required"),

  email: z.string().email("Invalid email format"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password is too long"),

  phone: z.string().optional(),

  avatar: z.string().optional(),

  business_id: z.string().optional(),
});

export type CreateStaffDTO = z.infer<typeof createStaffSchema>;