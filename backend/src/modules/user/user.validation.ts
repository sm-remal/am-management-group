import { z } from "zod"

const emailSchema = z.string().trim().email().transform((value) => value.toLowerCase())
const roleSchema = z.enum(["ADMIN", "USER"])
const passwordSchema = z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")

export const createUserSchema = z.object({
    name: z.string().trim().min(1, "Name is required").max(120),
    email: emailSchema,
    password: passwordSchema,
    phone: z.string().trim().min(1).max(20).optional(),
    avatar: z.string().trim().url().optional(),
    role: roleSchema.optional(),
    isActive: z.boolean().optional(),
})

export const updateUserSchema = z.object({
    name: z.string().trim().min(1).max(120).optional(),
    email: emailSchema.optional(),
    phone: z.string().trim().min(1).max(20).nullable().optional(),
    avatar: z.string().trim().url().nullable().optional(),
    role: roleSchema.optional(),
    isActive: z.boolean().optional(),
}).refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
})

export const updateProfileSchema = z.object({
    name: z.string().trim().min(1).max(120).optional(),
    phone: z.string().trim().min(1).max(20).nullable().optional(),
    avatar: z.string().trim().url().nullable().optional(),
}).refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
})

export const updateUserStatusSchema = z.object({
    isActive: z.boolean(),
})
