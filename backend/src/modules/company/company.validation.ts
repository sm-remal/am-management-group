import { z } from "zod"

const businessCategorySchema = z.enum([
    "MANAGEMENT_INVESTMENT",
    "CLEANING_SERVICES",
    "ENGINEERING_MACHINERY",
    "PLANTATION_AGRICULTURE",
    "RETAIL_TRADING",
    "TRAVEL_TOURISM",
])

const publishStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"])
// Absolute URL (Cloudinary etc.) or a site-hosted path such as /images/projects/x.jpg
const urlSchema = z.union([z.string().trim().url(), z.string().trim().regex(/^\/[\w\-./]+$/, "Must be a URL or a /path")])
const nullableStringSchema = z.string().trim().nullable()
const optionalDateSchema = z.coerce.date().nullable().optional()

export const createCompanySchema = z.object({
    name: z.string().trim().min(1, "Company name is required").max(180),
    slug: z.string().trim().min(1).max(220).optional(),
    category: businessCategorySchema,
    isMainCompany: z.boolean().optional(),
    shortDescription: z.string().trim().max(500).nullable().optional(),
    description: nullableStringSchema.optional(),
    logo: urlSchema.nullable().optional(),
    coverImage: urlSchema.nullable().optional(),
    registrationNumber: z.string().trim().max(120).nullable().optional(),
    establishedDate: optionalDateSchema,
    address: nullableStringSchema.optional(),
    phone: z.string().trim().max(30).nullable().optional(),
    email: z.string().trim().email().nullable().optional(),
    businessHours: nullableStringSchema.optional(),
    seoTitle: z.string().trim().max(180).nullable().optional(),
    seoDescription: nullableStringSchema.optional(),
    displayOrder: z.number().int().min(0).optional(),
    status: publishStatusSchema.optional(),
})

export const updateCompanySchema = createCompanySchema.partial().refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
})
