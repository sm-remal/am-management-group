import { z } from "zod"

const applicationStatusSchema = z.enum(["PENDING", "REVIEWED", "SHORTLISTED", "REJECTED", "HIRED"])
const emailSchema = z
    .string()
    .trim()
    .email()
    .transform((value) => value.toLowerCase())
const urlSchema = z.string().trim().url()

export const applicationQuerySchema = z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    jobId: z.string().uuid().optional(),
    status: applicationStatusSchema.optional(),
    preferredCompanyId: z.string().uuid().optional(),
})

export const createApplicationSchema = z.object({
    jobId: z.string().uuid("Job id must be a valid uuid"),
    fullName: z.string().trim().min(1, "Full name is required").max(120),
    email: emailSchema,
    phone: z.string().trim().min(1, "Phone is required").max(30),
    preferredCompanyId: z.string().uuid().nullable().optional(),
    cvUrl: urlSchema,
    coverMessage: z.string().trim().nullable().optional(),
})

export const updateApplicationSchema = z
    .object({
        fullName: z.string().trim().min(1).max(120).optional(),
        email: emailSchema.optional(),
        phone: z.string().trim().min(1).max(30).optional(),
        preferredCompanyId: z.string().uuid().nullable().optional(),
        cvUrl: urlSchema.optional(),
        coverMessage: z.string().trim().nullable().optional(),
        status: applicationStatusSchema.optional(),
        jobId: z.string().uuid().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field is required",
    })

export const updateApplicationStatusSchema = z.object({
    status: applicationStatusSchema,
})
