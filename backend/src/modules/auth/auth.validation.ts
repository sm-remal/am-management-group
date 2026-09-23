import { z } from "zod";

const emailSchema = z.string().trim().email().transform((value) => value.toLowerCase());
const passwordSchema = z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

export const registerSchema = z.object({
    name: z.string().trim().min(1, "Name is required").max(120),
    email: emailSchema,
    password: passwordSchema,
    phone: z.string().trim().min(1).max(20).optional(),
});

export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
    email: emailSchema,
});

export const resetPasswordSchema = z.object({
    token: z.string().trim().min(1),
    password: passwordSchema,
});

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1),
    newPassword: passwordSchema,
    confirmNewPassword: passwordSchema,
}).refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New password and confirm password do not match",
    path: ["confirmNewPassword"],
});

export const refreshTokenSchema = z.object({
    refreshToken: z.string().trim().min(1, "Refresh token is required"),
});

export const googleAuthSchema = z.object({
    credential: z.string().trim().min(1, "Google credential is required"),
});