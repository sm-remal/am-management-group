import { z } from "zod"

const businessCategorySchema = z.enum([
    "MANAGEMENT_INVESTMENT",
    "CLEANING_SERVICES",
    "ENGINEERING_MACHINERY",
    "PLANTATION_AGRICULTURE",
    "RETAIL_TRADING",
    "TRAVEL_TOURISM",
])

const nullableStringSchema = z.string().trim().nullable()
// Absolute URL (Cloudinary etc.) or a site-hosted path such as /images/projects/x.jpg
const urlSchema = z.union([z.string().trim().url(), z.string().trim().regex(/^\/[\w\-./]+$/, "Must be a URL or a /path")])

export const serviceQuerySchema = z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    companyId: z.string().uuid().optional(),
    companySlug: z.string().trim().min(1).optional(),
    category: businessCategorySchema.optional(),
    isActive: z.enum(["true", "false"]).optional(),
})

export const createServiceSchema = z.object({
    companyId: z.string().uuid("Company id must be a valid uuid"),
    title: z.string().trim().min(1, "Service title is required").max(180),
    slug: z.string().trim().min(1).max(220).optional(),
    description: nullableStringSchema.optional(),
    icon: z.string().trim().max(120).nullable().optional(),
    image: urlSchema.nullable().optional(),
    displayOrder: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
})

export const updateServiceSchema = createServiceSchema.partial().refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
})
