import { z } from "zod"

const businessCategorySchema = z.enum([
    "MANAGEMENT_INVESTMENT",
    "CLEANING_SERVICES",
    "ENGINEERING_MACHINERY",
    "PLANTATION_AGRICULTURE",
    "RETAIL_TRADING",
    "TRAVEL_TOURISM",
])

const projectStatusSchema = z.enum(["UPCOMING", "ONGOING", "COMPLETED"])
const publishStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"])
const nullableStringSchema = z.string().trim().nullable()
// Absolute URL (Cloudinary etc.) or a site-hosted path such as /images/projects/x.jpg
const urlSchema = z.union([z.string().trim().url(), z.string().trim().regex(/^\/[\w\-./]+$/, "Must be a URL or a /path")])
const optionalDateSchema = z.coerce.date().nullable().optional()

const projectImageSchema = z.object({
    imageUrl: urlSchema,
    caption: z.string().trim().max(180).nullable().optional(),
    order: z.number().int().min(0).optional(),
})

const projectBaseSchema = z.object({
    name: z.string().trim().min(1, "Project name is required").max(180),
    slug: z.string().trim().min(1).max(220).optional(),
    companyId: z.string().uuid("Company id must be a valid uuid"),
    category: businessCategorySchema,
    location: z.string().trim().max(180).nullable().optional(),
    clientName: z.string().trim().max(180).nullable().optional(),
    description: nullableStringSchema.optional(),
    scope: nullableStringSchema.optional(),
    highlights: nullableStringSchema.optional(),
    startDate: optionalDateSchema,
    endDate: optionalDateSchema,
    status: projectStatusSchema.optional(),
    featured: z.boolean().optional(),
    coverImage: urlSchema.nullable().optional(),
    publishStatus: publishStatusSchema.optional(),
    displayOrder: z.number().int().min(0).optional(),
    images: z.array(projectImageSchema).optional(),
})

export const createProjectSchema = projectBaseSchema.refine((data) => !data.startDate || !data.endDate || data.endDate >= data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
})

export const updateProjectSchema = projectBaseSchema
    .omit({ images: true })
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field is required",
    })
    .refine((data) => !data.startDate || !data.endDate || data.endDate >= data.startDate, {
        message: "End date must be after start date",
        path: ["endDate"],
    })

export const createProjectImageSchema = projectImageSchema

export const updateProjectImageSchema = projectImageSchema.partial().refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
})
