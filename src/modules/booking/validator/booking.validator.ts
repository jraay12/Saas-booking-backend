// src/validators/get-available-slots.validator.ts

import z from "zod";

export const getAvailabilitySchema = z.object({
  service_id: z.cuid(),

  staff_id: z.cuid(),

  date: z.iso.datetime(),
});