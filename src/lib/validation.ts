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

const documentTypes = ["RESUME", "COVER_LETTER"] as const;

export const createApplicationDocumentSchema = z.object({
  applicationId: z.string().cuid(),
  type: z.enum(documentTypes),
  title: z.string().trim().min(1).max(200),
  content: z.string().min(1).max(100_000)
});

export const updateApplicationDocumentSchema = z.object({
  type: z.enum(documentTypes).optional(),
  title: z.string().trim().min(1).max(200).optional(),
  content: z.string().max(100_000).optional(),
  attachmentUrl: z.string().nullable().optional(),
  attachmentOriginalName: z.string().nullable().optional(),
  attachmentMime: z.string().nullable().optional()
});

export const createStarStorySchema = z.object({
  applicationId: z.string().cuid().optional().nullable(),
  title: z.string().trim().min(1).max(200),
  situation: z.string().max(20_000),
  task: z.string().max(20_000),
  action: z.string().max(20_000),
  result: z.string().max(20_000)
});

export const updateStarStorySchema = createStarStorySchema.partial();

export const createInterviewQuestionSchema = z.object({
  applicationId: z.string().cuid().optional().nullable(),
  question: z.string().trim().min(1).max(5000),
  answer: z.string().max(20_000).optional().nullable(),
  category: z.string().trim().max(120).optional().nullable()
});

export const updateInterviewQuestionSchema = createInterviewQuestionSchema.partial();

export const createMockInterviewSchema = z.object({
  applicationId: z.string().cuid(),
  occurredAt: z
    .string()
    .optional()
    .transform((v) => (v && v.length > 0 ? new Date(v) : undefined)),
  notes: z.string().min(1).max(50_000),
  rating: z.number().int().min(1).max(5).optional().nullable()
});

export const updateMockInterviewSchema = z.object({
  occurredAt: z
    .string()
    .optional()
    .transform((v) => (v && v.length > 0 ? new Date(v) : undefined)),
  notes: z.string().min(1).max(50_000).optional(),
  rating: z.number().int().min(1).max(5).optional().nullable()
});

export const createCompanySchema = z.object({
  name: z.string().trim().min(1).max(200),
  website: z.string().trim().url().optional().nullable(),
  industry: z.string().trim().max(120).optional().nullable(),
  salaryMin: z.number().int().nonnegative().optional().nullable(),
  salaryMax: z.number().int().nonnegative().optional().nullable(),
  currency: z.string().trim().max(8).optional().nullable(),
  notes: z.string().max(20_000).optional().nullable()
});

export const updateCompanySchema = createCompanySchema.partial();

export const createCompanyContactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  role: z.string().trim().max(120).optional().nullable(),
  email: z.string().trim().email().optional().nullable(),
  linkedin: z.string().trim().url().optional().nullable(),
  isReferral: z.boolean().optional(),
  notes: z.string().max(5000).optional().nullable()
});

export const updateCompanyContactSchema = createCompanyContactSchema.partial();
