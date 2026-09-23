import type { Role } from "../../../generated/prisma/client"

export type UserQuery = {
    page?: string
    limit?: string
    search?: string
    role?: Role
    isActive?: string
}

export type CreateUserPayload = {
    name: string
    email: string
    password: string
    phone?: string
    avatar?: string
    role?: Role
    isActive?: boolean
}

export type UpdateUserPayload = {
    name?: string
    email?: string
    phone?: string | null
    avatar?: string | null
    role?: Role
    isActive?: boolean
}

export type UpdateProfilePayload = {
    name?: string
    phone?: string | null
    avatar?: string | null
}

export type UpdateUserStatusPayload = {
    isActive: boolean
}
