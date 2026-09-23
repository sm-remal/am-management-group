import httpStatus from "http-status"
import { Prisma } from "../../../generated/prisma/client"
import { prisma } from "../../lib/prisma"
import AppError from "../../utility/AppError"
import type { CreateSettingPayload, SettingQuery, UpdateSettingPayload, UpsertSettingsPayload } from "./setting.interface"

const settingSelect = {
    id: true,
    key: true,
    value: true,
    updatedAt: true,
} satisfies Prisma.SettingSelect

const parsePositiveNumber = (value: string | undefined, fallback: number) => {
    const parsed = Number(value)
    return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback
}

const buildSettingWhere = (query: SettingQuery): Prisma.SettingWhereInput => {
    const where: Prisma.SettingWhereInput = {}
    const search = query.search?.trim()

    if (query.key) {
        where.key = query.key
    }

    if (search) {
        where.OR = [
            { key: { contains: search, mode: "insensitive" } },
            { value: { contains: search, mode: "insensitive" } },
        ]
    }

    return where
}

const handleSettingError = (error: unknown, fallbackMessage: string): never => {
    if (error instanceof AppError) {
        throw error
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new AppError(httpStatus.CONFLICT, "Setting already exists with this key")
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        throw new AppError(httpStatus.NOT_FOUND, "Setting not found")
    }

    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, fallbackMessage)
}

const getSettingByIdOrThrow = async (id: string) => {
    const setting = await prisma.setting.findUnique({
        where: { id },
        select: settingSelect,
    })

    if (!setting) {
        throw new AppError(httpStatus.NOT_FOUND, "Setting not found")
    }

    return setting
}

const getAllSettings = async (query: SettingQuery) => {
    try {
        const page = parsePositiveNumber(query.page, 1)
        const limit = parsePositiveNumber(query.limit, 50)
        const skip = (page - 1) * limit
        const where = buildSettingWhere(query)

        const [settings, total] = await Promise.all([
            prisma.setting.findMany({
                where,
                select: settingSelect,
                skip,
                take: limit,
                orderBy: { key: "asc" },
            }),
            prisma.setting.count({ where }),
        ])

        return {
            meta: {
                page,
                limit,
                total,
                totalPage: Math.ceil(total / limit),
            },
            settings,
        }
    } catch (error) {
        handleSettingError(error, "Unable to fetch settings")
    }
}

const getSettingsMap = async () => {
    try {
        const settings = await prisma.setting.findMany({
            select: {
                key: true,
                value: true,
            },
            orderBy: { key: "asc" },
        })

        return settings.reduce<Record<string, string>>((result, setting) => {
            result[setting.key] = setting.value
            return result
        }, {})
    } catch (error) {
        handleSettingError(error, "Unable to fetch settings")
    }
}

const getSettingByKey = async (key: string) => {
    try {
        const setting = await prisma.setting.findUnique({
            where: { key },
            select: settingSelect,
        })

        if (!setting) {
            throw new AppError(httpStatus.NOT_FOUND, "Setting not found")
        }

        return setting
    } catch (error) {
        handleSettingError(error, "Unable to fetch setting")
    }
}

const getSettingById = async (id: string) => {
    try {
        return await getSettingByIdOrThrow(id)
    } catch (error) {
        handleSettingError(error, "Unable to fetch setting")
    }
}

const createSetting = async (payload: CreateSettingPayload) => {
    try {
        return await prisma.setting.create({
            data: payload,
            select: settingSelect,
        })
    } catch (error) {
        handleSettingError(error, "Unable to create setting")
    }
}

const updateSetting = async (id: string, payload: UpdateSettingPayload) => {
    try {
        await getSettingByIdOrThrow(id)

        return await prisma.setting.update({
            where: { id },
            data: payload,
            select: settingSelect,
        })
    } catch (error) {
        handleSettingError(error, "Unable to update setting")
    }
}

const upsertSettings = async (payload: UpsertSettingsPayload) => {
    try {
        return await Promise.all(
            payload.settings.map((setting) =>
                prisma.setting.upsert({
                    where: { key: setting.key },
                    create: setting,
                    update: { value: setting.value },
                    select: settingSelect,
                })
            )
        )
    } catch (error) {
        handleSettingError(error, "Unable to save settings")
    }
}

const deleteSetting = async (id: string) => {
    try {
        await getSettingByIdOrThrow(id)

        await prisma.setting.delete({
            where: { id },
        })

        return null
    } catch (error) {
        handleSettingError(error, "Unable to delete setting")
    }
}

export const SettingService = {
    getAllSettings,
    getSettingsMap,
    getSettingByKey,
    getSettingById,
    createSetting,
    updateSetting,
    upsertSettings,
    deleteSetting,
}
