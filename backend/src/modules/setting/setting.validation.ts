import { z } from "zod"

const settingKeySchema = z
    .string()
    .trim()
    .min(1, "Setting key is required")
    .max(120)
    .regex(/^[A-Za-z0-9_.:-]+$/, "Setting key can only contain letters, numbers, underscore, dot, colon and hyphen")

export const createSettingSchema = z.object({
    key: settingKeySchema,
    value: z.string(),
})

export const updateSettingSchema = z.object({
    key: settingKeySchema.optional(),
    value: z.string().optional(),
}).refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
})

export const upsertSettingsSchema = z.object({
    settings: z.array(createSettingSchema).min(1, "At least one setting is required"),
}).refine((data) => {
    const keys = data.settings.map((setting) => setting.key)
    return new Set(keys).size === keys.length
}, {
    message: "Duplicate setting keys are not allowed",
    path: ["settings"],
})
