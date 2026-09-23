import { z } from "zod"

const publishStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"])
const nullableStringSchema = z.string().trim().nullable()
// Absolute URL (Cloudinary etc.) or a site-hosted path such as /images/projects/x.jpg
const urlSchema = z.union([z.string().trim().url(), z.string().trim().regex(/^\/[\w\-./]+$/, "Must be a URL or a /path")])

export const newsQuerySchema = z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    category: z.string().trim().optional(),
    status: publishStatusSchema.optional(),
    authorId: z.string().uuid().optional(),
})

export const createNewsSchema = z.object({
    title: z.string().trim().min(1, "News title is required").max(220),
    slug: z.string().trim().min(1).max(240).optional(),
    excerpt: z.string().trim().max(500).nullable().optional(),
    content: z.string().trim().min(1, "News content is required"),
    coverImage: urlSchema.nullable().optional(),
    category: z.string().trim().max(120).nullable().optional(),
    authorId: z.string().uuid().nullable().optional(),
    status: publishStatusSchema.optional(),
    publishedAt: z.coerce.date().nullable().optional(),
})

export const updateNewsSchema = createNewsSchema.partial().refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
})
