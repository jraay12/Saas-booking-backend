import { z } from "zod";

export const registerSchema = z.object({
  first_name: z
    .string()
    .min(1, "First name is required"),

  last_name: z
    .string()
    .min(1, "Last name is required"),

  email: z.email("Invalid email address"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),

  phone: z.string().optional(),

  business_name: z
    .string()
    .min(1, "Business name is required"),

  category: z
    .string()
    .min(1, "Category is required"),

  description: z.string().optional(),

  business_email: z.email().optional(),

  business_phone: z.string().optional(),

  address: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),

  password: z.string().min(1, "Password is required"),
});

export type LoginDTO = z.infer<typeof loginSchema>;

export type RegisterDTO =
  z.infer<typeof registerSchema> & {
    avatar?: string;
    logo?: string;
  };