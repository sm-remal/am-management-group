import httpStatus from "http-status"
import { Prisma } from "../../../generated/prisma/client"
import { prisma } from "../../lib/prisma"
import AppError from "../../utility/AppError"
import type { CompanyQuery, CreateCompanyPayload, UpdateCompanyPayload } from "./company.interface"

const companySelect = {
    id: true,
    name: true,
    slug: true,
    category: true,
    isMainCompany: true,
    shortDescription: true,
    description: true,
    logo: true,
    coverImage: true,
    registrationNumber: true,
    establishedDate: true,
    address: true,
    phone: true,
    email: true,
    businessHours: true,
    seoTitle: true,
    seoDescription: true,
    displayOrder: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    _count: {
        select: {
            services: true,
            projects: true,
            jobs: true,
            teamMembers: true,
            galleryImages: true,
            socialLinks: true,
        },
    },
} satisfies Prisma.CompanySelect

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

const ensureUniqueSlug = async (slug: string, ignoreId?: string) => {
    const existingCompany = await prisma.company.findUnique({
        where: { slug },
        select: { id: true },
    })

    if (existingCompany && existingCompany.id !== ignoreId) {
        throw new AppError(httpStatus.CONFLICT, "Company slug already exists")
    }
}

const buildCompanyWhere = (query: CompanyQuery, publishedOnly = false): Prisma.CompanyWhereInput => {
    const where: Prisma.CompanyWhereInput = {}
    const search = query.search?.trim()
    const isMainCompany = parseBoolean(query.isMainCompany)

    if (publishedOnly) {
        where.status = "PUBLISHED"
    } else if (query.status) {
        where.status = query.status
    }

    if (query.category) {
        where.category = query.category
    }

    if (isMainCompany !== undefined) {
        where.isMainCompany = isMainCompany
    }

    if (search) {
        where.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { slug: { contains: search, mode: "insensitive" } },
            { shortDescription: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
        ]
    }

    return where
}

const handleCompanyServiceError = (error: unknown, fallbackMessage: string): never => {
    if (error instanceof AppError) {
        throw error
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new AppError(httpStatus.CONFLICT, "Company already exists with this unique value")
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        throw new AppError(httpStatus.NOT_FOUND, "Company not found")
    }

    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, fallbackMessage)
}

const getCompanyByIdOrThrow = async (id: string) => {
    const company = await prisma.company.findUnique({
        where: { id },
        select: companySelect,
    })

    if (!company) {
        throw new AppError(httpStatus.NOT_FOUND, "Company not found")
    }

    return company
}

const getAllCompanies = async (query: CompanyQuery, publishedOnly = false) => {
    try {
        const page = parsePositiveNumber(query.page, 1)
        const limit = parsePositiveNumber(query.limit, 10)
        const skip = (page - 1) * limit
        const where = buildCompanyWhere(query, publishedOnly)

        const [companies, total] = await Promise.all([
            prisma.company.findMany({
                where,
                select: companySelect,
                skip,
                take: limit,
                orderBy: [
                    { isMainCompany: "desc" },
                    { displayOrder: "asc" },
                    { createdAt: "desc" },
                ],
            }),
            prisma.company.count({ where }),
        ])

        return {
            meta: {
                page,
                limit,
                total,
                totalPage: Math.ceil(total / limit),
            },
            companies,
        }
    } catch (error) {
        handleCompanyServiceError(error, "Unable to fetch companies")
    }
}

const getPublishedCompanies = async (query: CompanyQuery) => {
    return getAllCompanies(query, true)
}

const getAdminCompanies = async (query: CompanyQuery) => {
    return getAllCompanies(query)
}

const getCompanyBySlug = async (slug: string) => {
    try {
        const company = await prisma.company.findFirst({
            where: {
                slug,
                status: "PUBLISHED",
            },
            select: companySelect,
        })

        if (!company) {
            throw new AppError(httpStatus.NOT_FOUND, "Company not found")
        }

        return company
    } catch (error) {
        handleCompanyServiceError(error, "Unable to fetch company")
    }
}

const getAdminCompanyById = async (id: string) => {
    try {
        return await getCompanyByIdOrThrow(id)
    } catch (error) {
        handleCompanyServiceError(error, "Unable to fetch company")
    }
}

const createCompany = async (payload: CreateCompanyPayload) => {
    try {
        const slug = generateSlug(payload.slug || payload.name)
        await ensureUniqueSlug(slug)

        if (payload.isMainCompany) {
            await prisma.company.updateMany({
                where: { isMainCompany: true },
                data: { isMainCompany: false },
            })
        }

        return await prisma.company.create({
                data: {
                    ...payload,
                    slug,
                    shortDescription: payload.shortDescription ?? null,
                    description: payload.description ?? null,
                    logo: payload.logo ?? null,
                    coverImage: payload.coverImage ?? null,
                    registrationNumber: payload.registrationNumber ?? null,
                    establishedDate: payload.establishedDate ?? null,
                    address: payload.address ?? null,
                    phone: payload.phone ?? null,
                    email: payload.email ?? null,
                    businessHours: payload.businessHours ?? null,
                    seoTitle: payload.seoTitle ?? null,
                    seoDescription: payload.seoDescription ?? null,
                    displayOrder: payload.displayOrder ?? 0,
                    status: payload.status ?? "DRAFT",
                },
                select: companySelect,
            })
    } catch (error) {
        handleCompanyServiceError(error, "Unable to create company")
    }
}

const updateCompany = async (id: string, payload: UpdateCompanyPayload) => {
    try {
        await getCompanyByIdOrThrow(id)

        const data: UpdateCompanyPayload = { ...payload }

        if (payload.slug || payload.name) {
            data.slug = generateSlug(payload.slug || payload.name || "")
            await ensureUniqueSlug(data.slug, id)
        }

        if (data.isMainCompany) {
            await prisma.company.updateMany({
                    where: {
                        isMainCompany: true,
                        id: { not: id },
                    },
                    data: { isMainCompany: false },
                })
        }

        return await prisma.company.update({
                where: { id },
                data,
                select: companySelect,
            })
    } catch (error) {
        handleCompanyServiceError(error, "Unable to update company")
    }
}

const deleteCompany = async (id: string) => {
    try {
        await getCompanyByIdOrThrow(id)

        await prisma.company.delete({
            where: { id },
        })

        return null
    } catch (error) {
        handleCompanyServiceError(error, "Unable to delete company")
    }
}

export const CompanyService = {
    getPublishedCompanies,
    getAdminCompanies,
    getCompanyBySlug,
    getAdminCompanyById,
    createCompany,
    updateCompany,
    deleteCompany,
}
