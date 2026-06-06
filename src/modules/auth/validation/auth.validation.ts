import { z } from "zod";

export const registerSchema = z.object({
  first_name: z.string().min(1, "First name is required"),

  last_name: z.string().min(1, "Last name is required"),

  email: z.string().email("Invalid email address"),

  password: z.string().min(8, "Password must be at least 8 characters"),

  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),

  password: z.string().min(1, "Password is required"),
});

export type LoginDTO = z.infer<typeof loginSchema>;

export type RegisterDTO = z.infer<typeof registerSchema> & {
  avatar?: string;
};
