import { z } from "zod";

export const createMembershipSchema = z.object({
  user_id: z.cuid("Invalid user id"),

  business_id: z.cuid("Invalid business id"),

  role: z.enum([
    "OWNER",
    "ADMIN",
    "STAFF",
  ]),
});

export type CreateMembershipDTO =
  z.infer<typeof createMembershipSchema>;