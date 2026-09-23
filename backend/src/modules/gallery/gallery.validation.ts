import { z } from "zod"

// Absolute URL (Cloudinary etc.) or a site-hosted path such as /images/projects/x.jpg
const urlSchema = z.union([z.string().trim().url(), z.string().trim().regex(/^\/[\w\-./]+$/, "Must be a URL or a /path")])

export const createGalleryImageSchema = z.object({
    title: z.string().trim().max(180).nullable().optional(),
    imageUrl: urlSchema,
    category: z.string().trim().min(1, "Category is required").max(120),
    companyId: z.string().uuid("Company id must be a valid uuid").nullable().optional(),
    displayOrder: z.number().int().min(0).optional(),
    isPublished: z.boolean().optional(),
})

export const updateGalleryImageSchema = createGalleryImageSchema.partial().refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
})
