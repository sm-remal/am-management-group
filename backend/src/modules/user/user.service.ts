import bcrypt from "bcrypt"
import httpStatus from "http-status"
import { Prisma } from "../../../generated/prisma/client"
import { prisma } from "../../lib/prisma"
import AppError from "../../utility/AppError"
import type {
    CreateUserPayload,
    UpdateProfilePayload,
    UpdateUserPayload,
    UpdateUserStatusPayload,
    UserQuery,
} from "./user.interface"

const userSelect = {
    id: true,
    name: true,
    email: true,
    phone: true,
    avatar: true,
    role: true,
    isActive: true,
    lastLoginAt: true,
    createdAt: true,
    updatedAt: true,
} satisfies Prisma.UserSelect

const hashPassword = async (password: string) => {
    return bcrypt.hash(password, 10)
}

const parsePositiveNumber = (value: string | undefined, fallback: number) => {
    const parsed = Number(value)
    return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback
}

const parseBoolean = (value: string | undefined) => {
    if (value === "true") return true
    if (value === "false") return false
    return undefined
}

const buildUserWhere = (query: UserQuery): Prisma.UserWhereInput => {
    const where: Prisma.UserWhereInput = {}
    const search = query.search?.trim()
    const isActive = parseBoolean(query.isActive)

    if (search) {
        where.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
        ]
    }

    if (query.role) {
        where.role = query.role
    }

    if (isActive !== undefined) {
        where.isActive = isActive
    }

    return where
}

const handleUserServiceError = (error: unknown, fallbackMessage: string): never => {
    if (error instanceof AppError) {
        throw error
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new AppError(httpStatus.CONFLICT, "An account already exists with this email address")
    }

    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, fallbackMessage)
}

const ensureUserExists = async (id: string) => {
    const user = await prisma.user.findUnique({
        where: { id },
        select: userSelect,
    })

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found")
    }

    return user
}

const ensureNotLastActiveAdmin = async (id: string, payload: Pick<UpdateUserPayload, "role" | "isActive">) => {
    const user = await prisma.user.findUnique({
        where: { id },
        select: { id: true, role: true, isActive: true },
    })

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found")
    }

    const willLoseAdminAccess =
        user.role === "ADMIN" &&
        user.isActive &&
        (payload.role === "USER" || payload.isActive === false)

    if (!willLoseAdminAccess) {
        return
    }

    const activeAdminCount = await prisma.user.count({
        where: {
            role: "ADMIN",
            isActive: true,
        },
    })

    if (activeAdminCount <= 1) {
        throw new AppError(httpStatus.BAD_REQUEST, "At least one active admin user is required")
    }
}

const getAllUsers = async (query: UserQuery) => {
    try {
        const page = parsePositiveNumber(query.page, 1)
        const limit = parsePositiveNumber(query.limit, 10)
        const skip = (page - 1) * limit
        const where = buildUserWhere(query)

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: userSelect,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
            }),
            prisma.user.count({ where }),
        ])

        return {
            meta: {
                page,
                limit,
                total,
                totalPage: Math.ceil(total / limit),
            },
            users,
        }
    } catch (error) {
        handleUserServiceError(error, "Unable to fetch users")
    }
}

const getUserById = async (id: string) => {
    try {
        return await ensureUserExists(id)
    } catch (error) {
        handleUserServiceError(error, "Unable to fetch user")
    }
}

const createUser = async (payload: CreateUserPayload) => {
    try {
        const hashedPassword = await hashPassword(payload.password)

        return await prisma.user.create({
            data: {
                name: payload.name,
                email: payload.email,
                password: hashedPassword,
                phone: payload.phone ?? null,
                avatar: payload.avatar ?? null,
                role: payload.role ?? "USER",
                isActive: payload.isActive ?? true,
            },
            select: userSelect,
        })
    } catch (error) {
        handleUserServiceError(error, "Unable to create user")
    }
}

const updateUser = async (id: string, payload: UpdateUserPayload) => {
    try {
        await ensureNotLastActiveAdmin(id, payload)

        return await prisma.user.update({
            where: { id },
            data: payload,
            select: userSelect,
        })
    } catch (error) {
        handleUserServiceError(error, "Unable to update user")
    }
}

const updateMyProfile = async (id: string, payload: UpdateProfilePayload) => {
    try {
        await ensureUserExists(id)

        return await prisma.user.update({
            where: { id },
            data: payload,
            select: userSelect,
        })
    } catch (error) {
        handleUserServiceError(error, "Unable to update profile")
    }
}

const updateUserStatus = async (id: string, payload: UpdateUserStatusPayload) => {
    try {
        await ensureNotLastActiveAdmin(id, { isActive: payload.isActive })

        return await prisma.user.update({
            where: { id },
            data: { isActive: payload.isActive },
            select: userSelect,
        })
    } catch (error) {
        handleUserServiceError(error, "Unable to update user status")
    }
}

const deleteUser = async (id: string, currentUserId: string) => {
    try {
        if (id === currentUserId) {
            throw new AppError(httpStatus.BAD_REQUEST, "You cannot delete your own account")
        }

        await ensureNotLastActiveAdmin(id, { isActive: false })

        await prisma.user.delete({
            where: { id },
        })

        return null
    } catch (error) {
        handleUserServiceError(error, "Unable to delete user")
    }
}

export const UserService = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    updateMyProfile,
    updateUserStatus,
    deleteUser,
}
