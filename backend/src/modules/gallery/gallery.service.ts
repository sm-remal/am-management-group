import httpStatus from "http-status"
import { Prisma } from "../../../generated/prisma/client"
import { prisma } from "../../lib/prisma"
import AppError from "../../utility/AppError"
import type { CreateGalleryImagePayload, GalleryQuery, UpdateGalleryImagePayload } from "./gallery.interface"

const galleryImageSelect = {
    id: true,
    title: true,
    imageUrl: true,
    category: true,
    companyId: true,
    displayOrder: true,
    isPublished: true,
    createdAt: true,
    company: {
        select: {
            id: true,
            name: true,
            slug: true,
            category: true,
            logo: true,
            status: true,
        },
    },
} satisfies Prisma.GalleryImageSelect

const parsePositiveNumber = (value: string | undefined, fallback: number) => {
    const parsed = Number(value)
    return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback
}

const parseBoolean = (value: string | undefined) => {
    if (value === "true") return true
    if (value === "false") return false
    return undefined
}

const buildGalleryWhere = (query: GalleryQuery, publishedOnly = false): Prisma.GalleryImageWhereInput => {
    const where: Prisma.GalleryImageWhereInput = {}
    const companyWhere: Prisma.CompanyWhereInput = {}
    const search = query.search?.trim()
    const isPublished = parseBoolean(query.isPublished)

    if (publishedOnly) {
        where.isPublished = true
        where.OR = [
            { companyId: null },
            { company: { is: { status: "PUBLISHED" } } },
        ]
    } else if (isPublished !== undefined) {
        where.isPublished = isPublished
    }

    if (query.category) {
        where.category = query.category
    }

    if (query.companyId) {
        where.companyId = query.companyId
    }

    if (query.companySlug) {
        companyWhere.slug = query.companySlug
    }

    if (search) {
        const searchFilter: Prisma.GalleryImageWhereInput[] = [
            { title: { contains: search, mode: "insensitive" } },
            { category: { contains: search, mode: "insensitive" } },
            { company: { is: { name: { contains: search, mode: "insensitive" } } } },
        ]

        where.AND = [...(Array.isArray(where.AND) ? where.AND : []), { OR: searchFilter }]
    }

    if (Object.keys(companyWhere).length > 0) {
        where.company = { is: companyWhere }
    }

    return where
}

const handleGalleryError = (error: unknown, fallbackMessage: string): never => {
    if (error instanceof AppError) {
        throw error
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        throw new AppError(httpStatus.NOT_FOUND, "Gallery image not found")
    }

    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, fallbackMessage)
}

const ensureCompanyExists = async (companyId: string) => {
    const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: { id: true },
    })

    if (!company) {
        throw new AppError(httpStatus.NOT_FOUND, "Company not found")
    }
}

const getGalleryImageByIdOrThrow = async (id: string) => {
    const galleryImage = await prisma.galleryImage.findUnique({
        where: { id },
        select: galleryImageSelect,
    })

    if (!galleryImage) {
        throw new AppError(httpStatus.NOT_FOUND, "Gallery image not found")
    }

    return galleryImage
}

const getAllGalleryImages = async (query: GalleryQuery, publishedOnly = false) => {
    try {
        const page = parsePositiveNumber(query.page, 1)
        const limit = parsePositiveNumber(query.limit, 10)
        const skip = (page - 1) * limit
        const where = buildGalleryWhere(query, publishedOnly)

        const [galleryImages, total] = await Promise.all([
            prisma.galleryImage.findMany({
                where,
                select: galleryImageSelect,
                skip,
                take: limit,
                orderBy: [
                    { displayOrder: "asc" },
                    { createdAt: "desc" },
                ],
            }),
            prisma.galleryImage.count({ where }),
        ])

        return {
            meta: {
                page,
                limit,
                total,
                totalPage: Math.ceil(total / limit),
            },
            galleryImages,
        }
    } catch (error) {
        handleGalleryError(error, "Unable to fetch gallery images")
    }
}

const getPublishedGalleryImages = async (query: GalleryQuery) => {
    return getAllGalleryImages(query, true)
}

const getAdminGalleryImages = async (query: GalleryQuery) => {
    return getAllGalleryImages(query)
}

const getPublishedGalleryImageById = async (id: string) => {
    try {
        const galleryImage = await prisma.galleryImage.findFirst({
            where: {
                id,
                isPublished: true,
                OR: [
                    { companyId: null },
                    { company: { is: { status: "PUBLISHED" } } },
                ],
            },
            select: galleryImageSelect,
        })

        if (!galleryImage) {
            throw new AppError(httpStatus.NOT_FOUND, "Gallery image not found")
        }

        return galleryImage
    } catch (error) {
        handleGalleryError(error, "Unable to fetch gallery image")
    }
}

const getAdminGalleryImageById = async (id: string) => {
    try {
        return await getGalleryImageByIdOrThrow(id)
    } catch (error) {
        handleGalleryError(error, "Unable to fetch gallery image")
    }
}

const createGalleryImage = async (payload: CreateGalleryImagePayload) => {
    try {
        if (payload.companyId) {
            await ensureCompanyExists(payload.companyId)
        }

        return await prisma.galleryImage.create({
            data: {
                title: payload.title ?? null,
                imageUrl: payload.imageUrl,
                category: payload.category,
                companyId: payload.companyId ?? null,
                displayOrder: payload.displayOrder ?? 0,
                isPublished: payload.isPublished ?? true,
            },
            select: galleryImageSelect,
        })
    } catch (error) {
        handleGalleryError(error, "Unable to create gallery image")
    }
}

const updateGalleryImage = async (id: string, payload: UpdateGalleryImagePayload) => {
    try {
        await getGalleryImageByIdOrThrow(id)

        if (payload.companyId) {
            await ensureCompanyExists(payload.companyId)
        }

        return await prisma.galleryImage.update({
            where: { id },
            data: payload,
            select: galleryImageSelect,
        })
    } catch (error) {
        handleGalleryError(error, "Unable to update gallery image")
    }
}

const deleteGalleryImage = async (id: string) => {
    try {
        await getGalleryImageByIdOrThrow(id)

        await prisma.galleryImage.delete({
            where: { id },
        })

        return null
    } catch (error) {
        handleGalleryError(error, "Unable to delete gallery image")
    }
}

export const GalleryService = {
    getPublishedGalleryImages,
    getAdminGalleryImages,
    getPublishedGalleryImageById,
    getAdminGalleryImageById,
    createGalleryImage,
    updateGalleryImage,
    deleteGalleryImage,
}
