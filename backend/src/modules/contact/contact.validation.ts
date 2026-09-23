import { z } from "zod"

const inquiryStatusSchema = z.enum(["NEW", "IN_PROGRESS", "RESOLVED", "ARCHIVED"])
const emailSchema = z.string().trim().email().transform((value) => value.toLowerCase())

export const createInquirySchema = z.object({
    name: z.string().trim().min(1, "Name is required").max(120),
    email: emailSchema,
    phone: z.string().trim().min(1, "Phone is required").max(30),
    company: z.string().trim().max(180).nullable().optional(),
    subject: z.string().trim().min(1, "Subject is required").max(180),
    message: z.string().trim().min(1, "Message is required"),
})

export const updateInquirySchema = z.object({
    name: z.string().trim().min(1).max(120).optional(),
    email: emailSchema.optional(),
    phone: z.string().trim().min(1).max(30).optional(),
    company: z.string().trim().max(180).nullable().optional(),
    subject: z.string().trim().min(1).max(180).optional(),
    message: z.string().trim().min(1).optional(),
    status: inquiryStatusSchema.optional(),
}).refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
})

export const updateInquiryStatusSchema = z.object({
    status: inquiryStatusSchema,
})
