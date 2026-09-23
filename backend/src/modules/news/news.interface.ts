import type { PublishStatus } from "../../../generated/prisma/client"

export type NewsQuery = {
    page?: string
    limit?: string
    search?: string
    category?: string
    status?: PublishStatus
    authorId?: string
}

export type CreateNewsPayload = {
    title: string
    slug?: string
    excerpt?: string | null
    content: string
    coverImage?: string | null
    category?: string | null
    authorId?: string | null
    status?: PublishStatus
    publishedAt?: Date | string | null
}

export type UpdateNewsPayload = Partial<CreateNewsPayload>
