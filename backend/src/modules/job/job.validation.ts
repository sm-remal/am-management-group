import { z } from "zod"

const employmentTypeSchema = z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"])
const nullableStringSchema = z.string().trim().nullable()

export const jobQuerySchema = z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    companyId: z.string().uuid().optional(),
    companySlug: z.string().trim().min(1).optional(),
    employmentType: employmentTypeSchema.optional(),
    isPublished: z.enum(["true", "false"]).optional(),
})

export const createJobSchema = z.object({
    title: z.string().trim().min(1, "Job title is required").max(180),
    slug: z.string().trim().min(1).max(220).optional(),
    companyId: z.string().uuid("Company id must be a valid uuid"),
    location: z.string().trim().max(180).nullable().optional(),
    employmentType: employmentTypeSchema.optional(),
    requirements: nullableStringSchema.optional(),
    description: nullableStringSchema.optional(),
    salaryInfo: z.string().trim().max(180).nullable().optional(),
    deadline: z.coerce.date().nullable().optional(),
    isPublished: z.boolean().optional(),
})

export const updateJobSchema = createJobSchema.partial().refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
})
