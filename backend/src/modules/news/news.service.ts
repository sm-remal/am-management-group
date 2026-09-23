import httpStatus from "http-status"
import { Prisma } from "../../../generated/prisma/client"
import { prisma } from "../../lib/prisma"
import AppError from "../../utility/AppError"
import type { CreateNewsPayload, NewsQuery, UpdateNewsPayload } from "./news.interface"

const newsSelect = {
    id: true,
    title: true,
    slug: true,
    excerpt: true,
    content: true,
    coverImage: true,
    category: true,
    authorId: true,
    status: true,
    publishedAt: true,
    createdAt: true,
    updatedAt: true,
    author: {
        select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
        },
    },
} satisfies Prisma.NewsSelect

const parsePositiveNumber = (value: string | undefined, fallback: number) => {
    const parsed = Number(value)
    return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback
}

const generateSlug = (value: string) => {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
}

const handleNewsError = (error: unknown, fallbackMessage: string): never => {
    if (error instanceof AppError) {
        throw error
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
            throw new AppError(httpStatus.NOT_FOUND, "News not found")
        }

        if (error.code === "P2002") {
            throw new AppError(httpStatus.CONFLICT, "News slug already exists")
        }
    }

    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, fallbackMessage)
}

const ensureUniqueSlug = async (slug: string, excludeId?: string) => {
    const existing = await prisma.news.findFirst({
        where: {
            slug,
            ...(excludeId ? { id: { not: excludeId } } : {}),
        },
        select: { id: true },
    })

    if (existing) {
        throw new AppError(httpStatus.CONFLICT, "News slug already exists")
    }
}

const ensureAuthorExists = async (authorId: string) => {
    const author = await prisma.user.findUnique({
        where: { id: authorId },
        select: { id: true },
    })

    if (!author) {
        throw new AppError(httpStatus.NOT_FOUND, "Author not found")
    }
}

const getNewsByIdOrThrow = async (id: string) => {
    const news = await prisma.news.findUnique({
        where: { id },
        select: newsSelect,
    })

    if (!news) {
        throw new AppError(httpStatus.NOT_FOUND, "News not found")
    }

    return news
}

const buildNewsWhere = (query: NewsQuery, publishedOnly = false): Prisma.NewsWhereInput => {
    const where: Prisma.NewsWhereInput = {}
    const search = query.search?.trim()

    if (publishedOnly) {
        where.status = "PUBLISHED"
    } else if (query.status) {
        where.status = query.status
    }

    if (query.category?.trim()) {
        where.category = query.category.trim()
    }

    if (query.authorId) {
        where.authorId = query.authorId
    }

    if (search) {
        where.OR = [
            { title: { contains: search, mode: "insensitive" } },
            { slug: { contains: search, mode: "insensitive" } },
            { excerpt: { contains: search, mode: "insensitive" } },
            { content: { contains: search, mode: "insensitive" } },
            { category: { contains: search, mode: "insensitive" } },
        ]
    }

    return where
}

const getAllNews = async (query: NewsQuery, publishedOnly = false) => {
    try {
        const page = parsePositiveNumber(query.page, 1)
        const limit = parsePositiveNumber(query.limit, 10)
        const skip = (page - 1) * limit
        const where = buildNewsWhere(query, publishedOnly)

        const [news, total] = await Promise.all([
            prisma.news.findMany({
                where,
                select: newsSelect,
                skip,
                take: limit,
                orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
            }),
            prisma.news.count({ where }),
        ])

        return {
            meta: {
                page,
                limit,
                total,
                totalPage: Math.ceil(total / limit) || 1,
            },
            news,
        }
    } catch (error) {
        handleNewsError(error, "Unable to fetch news")
    }
}

const getPublishedNews = async (query: NewsQuery) => {
    return getAllNews(query, true)
}

const getAdminNews = async (query: NewsQuery) => {
    return getAllNews(query, false)
}

const getNewsBySlug = async (slug: string) => {
    try {
        const news = await prisma.news.findFirst({
            where: {
                slug,
                status: "PUBLISHED",
            },
            select: newsSelect,
        })

        if (!news) {
            throw new AppError(httpStatus.NOT_FOUND, "News not found")
        }

        return news
    } catch (error) {
        handleNewsError(error, "Unable to fetch news")
    }
}

const getAdminNewsById = async (id: string) => {
    try {
        return await getNewsByIdOrThrow(id)
    } catch (error) {
        handleNewsError(error, "Unable to fetch news")
    }
}

const createNews = async (payload: CreateNewsPayload) => {
    try {
        if (payload.authorId) {
            await ensureAuthorExists(payload.authorId)
        }

        const slug = generateSlug(payload.slug || payload.title)
        await ensureUniqueSlug(slug)

        const status = payload.status ?? "DRAFT"
        const publishedAt =
            status === "PUBLISHED"
                ? payload.publishedAt
                    ? new Date(payload.publishedAt)
                    : new Date()
                : payload.publishedAt
                  ? new Date(payload.publishedAt)
                  : null

        return await prisma.news.create({
            data: {
                title: payload.title,
                slug,
                excerpt: payload.excerpt ?? null,
                content: payload.content,
                coverImage: payload.coverImage ?? null,
                category: payload.category ?? null,
                authorId: payload.authorId ?? null,
                status,
                publishedAt,
            },
            select: newsSelect,
        })
    } catch (error) {
        handleNewsError(error, "Unable to create news")
    }
}

const updateNews = async (id: string, payload: UpdateNewsPayload) => {
    try {
        const existing = await getNewsByIdOrThrow(id)

        if (payload.authorId) {
            await ensureAuthorExists(payload.authorId)
        }

        const data: Prisma.NewsUpdateInput = { ...payload }

        if (payload.slug || payload.title) {
            const slug = generateSlug(payload.slug || payload.title || existing.slug)
            await ensureUniqueSlug(slug, id)
            data.slug = slug
        }

        if (payload.status === "PUBLISHED" && !existing.publishedAt && !payload.publishedAt) {
            data.publishedAt = new Date()
        }

        if (payload.publishedAt !== undefined) {
            data.publishedAt = payload.publishedAt ? new Date(payload.publishedAt) : null
        }

        return await prisma.news.update({
            where: { id },
            data,
            select: newsSelect,
        })
    } catch (error) {
        handleNewsError(error, "Unable to update news")
    }
}

const deleteNews = async (id: string) => {
    try {
        await getNewsByIdOrThrow(id)

        await prisma.news.delete({
            where: { id },
        })

        return null
    } catch (error) {
        handleNewsError(error, "Unable to delete news")
    }
}

export const NewsService = {
    getPublishedNews,
    getAdminNews,
    getNewsBySlug,
    getAdminNewsById,
    createNews,
    updateNews,
    deleteNews,
}
