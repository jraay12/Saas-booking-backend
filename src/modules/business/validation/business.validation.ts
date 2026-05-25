import { z } from "zod";

export const createBusinessSchema = z.object({
  business_name: z
    .string()
    .min(1, "Business name is required")
    .max(
      255,
      "Business name must not exceed 255 characters",
    ),

  category: z
    .string()
    .min(1, "Category is required")
    .max(
      100,
      "Category must not exceed 100 characters",
    ),

  description: z
    .string()
    .max(
      300,
      "Description must not exceed 300 characters",
    )
    .optional(),

  email: z
    .email("Invalid email address")
    .optional(),

  phone: z.string().optional(),

  address: z.string().optional(),

  slug: z
  .string()
  .min(3)
  .max(100)
  .regex(
    /^[a-z0-9-]+$/,
    "Slug must be lowercase and hyphenated"
  )
});

export type CreateBusinessDTO =
  z.infer<typeof createBusinessSchema> & {
    logo?: string;
  };