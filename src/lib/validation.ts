import { z } from "zod";
import { APPLICATION_STATUSES } from "@/types/application";

const nullableDateString = z
  .string()
  .datetime()
  .or(z.literal(""))
  .optional()
  .transform((value) => (value ? new Date(value) : undefined));

export const createApplicationSchema = z.object({
  company: z.string().trim().min(2).max(100),
  role: z.string().trim().min(2).max(120),
  location: z.string().trim().max(120).optional(),
  sourceUrl: z.string().trim().url().optional(),
  notes: z.string().trim().max(5000).optional(),
  status: z.enum(APPLICATION_STATUSES).optional(),
  appliedAt: nullableDateString,
  deadlineAt: nullableDateString,
  followUpAt: nullableDateString
});

export const updateApplicationSchema = createApplicationSchema.partial();
