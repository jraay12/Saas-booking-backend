import { z } from "zod";

export const createUserSchema = z.object({
  first_name: z
    .string()
    .min(1, "First name is required")
    .max(100, "First name must not exceed 100 characters"),

  last_name: z
    .string()
    .min(1, "Last name is required")
    .max(100, "Last name must not exceed 100 characters"),

  email: z
    .email("Invalid email address")
    .max(255, "Email must not exceed 255 characters"),

  password: z.string().min(8, "Password must be at least 8 characters"),

  phone: z.string().optional(),
});

export type CreateUserDTO = z.infer<typeof createUserSchema> & {
  avatar?: string;
};

export const createOAuthUserSchema = createUserSchema.omit({
  password: true,
});

export type CreateOAuthUserDTO = z.infer<typeof createOAuthUserSchema> & {
  avatar?: string;
};
