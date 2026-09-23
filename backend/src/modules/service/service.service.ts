import httpStatus from "http-status"
import { Prisma } from "../../../generated/prisma/client"
import { prisma } from "../../lib/prisma"
import AppError from "../../utility/AppError"
import type { CreateServicePayload, ServiceQuery, UpdateServicePayload } from "./service.interface"

const serviceSelect = {
    id: true,
    companyId: true,
    title: true,
    slug: true,
    description: true,
    icon: true,
    image: true,
    displayOrder: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,
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
} satisfies Prisma.ServiceSelect

const parsePositiveNumber = (value: string | undefined, fallback: number) => {
    const parsed = Number(value)
    return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback
}

const parseBoolean = (value: string | undefined) => {
    if (value === "true") return true
    if (value === "false") return false
    return undefined
}

const generateSlug = (value: string) => {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
}

const buildServiceWhere = (query: ServiceQuery, activeOnly = false): Prisma.ServiceWhereInput => {
    const where: Prisma.ServiceWhereInput = {}
    const companyWhere: Prisma.CompanyWhereInput = {}
    const search = query.search?.trim()
    const isActive = parseBoolean(query.isActive)

    if (activeOnly) {
        where.isActive = true
        companyWhere.status = "PUBLISHED"
    } else if (isActive !== undefined) {
        where.isActive = isActive
    }

    if (query.companyId) {
        where.companyId = query.companyId
    }

    if (query.companySlug) {
        companyWhere.slug = query.companySlug
    }

    if (query.category) {
        companyWhere.category = query.category
    }

    if (search) {
        where.OR = [
            { title: { contains: search, mode: "insensitive" } },
            { slug: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { company: { is: { name: { contains: search, mode: "insensitive" } } } },
        ]
    }

    if (Object.keys(companyWhere).length > 0) {
        where.company = { is: companyWhere }
    }

    return where
}

const handleServiceError = (error: unknown, fallbackMessage: string): never => {
    if (error instanceof AppError) {
        throw error
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new AppError(httpStatus.CONFLICT, "Service slug already exists for this company")
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        throw new AppError(httpStatus.NOT_FOUND, "Service not found")
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

const ensureUniqueSlug = async (companyId: string, slug: string, ignoreId?: string) => {
    const existingService = await prisma.service.findFirst({
        where: {
            companyId,
            slug,
        },
        select: { id: true },
    })

    if (existingService && existingService.id !== ignoreId) {
        throw new AppError(httpStatus.CONFLICT, "Service slug already exists for this company")
    }
}

const getServiceByIdOrThrow = async (id: string) => {
    const service = await prisma.service.findUnique({
        where: { id },
        select: serviceSelect,
    })

    if (!service) {
        throw new AppError(httpStatus.NOT_FOUND, "Service not found")
    }

    return service
}

const getAllServices = async (query: ServiceQuery, activeOnly = false) => {
    try {
        const page = parsePositiveNumber(query.page, 1)
        const limit = parsePositiveNumber(query.limit, 10)
        const skip = (page - 1) * limit
        const where = buildServiceWhere(query, activeOnly)

        const [services, total] = await Promise.all([
            prisma.service.findMany({
                where,
                select: serviceSelect,
                skip,
                take: limit,
                orderBy: [
                    { displayOrder: "asc" },
                    { createdAt: "desc" },
                ],
            }),
            prisma.service.count({ where }),
        ])

        return {
            meta: {
                page,
                limit,
                total,
                totalPage: Math.ceil(total / limit),
            },
            services,
        }
    } catch (error) {
        handleServiceError(error, "Unable to fetch services")
    }
}

const getPublishedServices = async (query: ServiceQuery) => {
    return getAllServices(query, true)
}

const getAdminServices = async (query: ServiceQuery) => {
    return getAllServices(query)
}

const getServiceByCompanyAndSlug = async (companySlug: string, slug: string) => {
    try {
        const service = await prisma.service.findFirst({
            where: {
                slug,
                isActive: true,
                company: {
                    is: {
                        slug: companySlug,
                        status: "PUBLISHED",
                    },
                },
            },
            select: serviceSelect,
        })

        if (!service) {
            throw new AppError(httpStatus.NOT_FOUND, "Service not found")
        }

        return service
    } catch (error) {
        handleServiceError(error, "Unable to fetch service")
    }
}

const getAdminServiceById = async (id: string) => {
    try {
        return await getServiceByIdOrThrow(id)
    } catch (error) {
        handleServiceError(error, "Unable to fetch service")
    }
}

const createService = async (payload: CreateServicePayload) => {
    try {
        await ensureCompanyExists(payload.companyId)

        const slug = generateSlug(payload.slug || payload.title)
        await ensureUniqueSlug(payload.companyId, slug)

        return await prisma.service.create({
            data: {
                companyId: payload.companyId,
                title: payload.title,
                slug,
                description: payload.description ?? null,
                icon: payload.icon ?? null,
                image: payload.image ?? null,
                displayOrder: payload.displayOrder ?? 0,
                isActive: payload.isActive ?? true,
            },
            select: serviceSelect,
        })
    } catch (error) {
        handleServiceError(error, "Unable to create service")
    }
}

const updateService = async (id: string, payload: UpdateServicePayload) => {
    try {
        const existingService = await getServiceByIdOrThrow(id)
        const companyId = payload.companyId ?? existingService.companyId

        if (payload.companyId) {
            await ensureCompanyExists(payload.companyId)
        }

        const data: UpdateServicePayload = { ...payload }

        if (payload.slug || payload.title || payload.companyId) {
            data.slug = generateSlug(payload.slug || payload.title || existingService.slug)
            await ensureUniqueSlug(companyId, data.slug, id)
        }

        return await prisma.service.update({
            where: { id },
            data,
            select: serviceSelect,
        })
    } catch (error) {
        handleServiceError(error, "Unable to update service")
    }
}

const deleteService = async (id: string) => {
    try {
        await getServiceByIdOrThrow(id)

        await prisma.service.delete({
            where: { id },
        })

        return null
    } catch (error) {
        handleServiceError(error, "Unable to delete service")
    }
}

export const ServiceService = {
    getPublishedServices,
    getAdminServices,
    getServiceByCompanyAndSlug,
    getAdminServiceById,
    createService,
    updateService,
    deleteService,
}
