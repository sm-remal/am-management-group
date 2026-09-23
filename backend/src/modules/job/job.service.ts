import httpStatus from "http-status"
import { Prisma } from "../../../generated/prisma/client"
import { prisma } from "../../lib/prisma"
import AppError from "../../utility/AppError"
import type { CreateJobPayload, JobQuery, UpdateJobPayload } from "./job.interface"

const jobSelect = {
    id: true,
    title: true,
    slug: true,
    companyId: true,
    location: true,
    employmentType: true,
    requirements: true,
    description: true,
    salaryInfo: true,
    deadline: true,
    isPublished: true,
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
    _count: {
        select: {
            applications: true,
        },
    },
} satisfies Prisma.JobSelect

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

const handleJobError = (error: unknown, fallbackMessage: string): never => {
    if (error instanceof AppError) {
        throw error
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
            throw new AppError(httpStatus.NOT_FOUND, "Job not found")
        }

        if (error.code === "P2002") {
            throw new AppError(httpStatus.CONFLICT, "Job slug already exists")
        }
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

const ensureUniqueSlug = async (slug: string, excludeId?: string) => {
    const existing = await prisma.job.findFirst({
        where: {
            slug,
            ...(excludeId ? { id: { not: excludeId } } : {}),
        },
        select: { id: true },
    })

    if (existing) {
        throw new AppError(httpStatus.CONFLICT, "Job slug already exists")
    }
}

const getJobByIdOrThrow = async (id: string) => {
    const job = await prisma.job.findUnique({
        where: { id },
        select: jobSelect,
    })

    if (!job) {
        throw new AppError(httpStatus.NOT_FOUND, "Job not found")
    }

    return job
}

const buildJobWhere = (query: JobQuery, publishedOnly = false): Prisma.JobWhereInput => {
    const where: Prisma.JobWhereInput = {}
    const companyWhere: Prisma.CompanyWhereInput = {}
    const search = query.search?.trim()
    const isPublished = parseBoolean(query.isPublished)

    if (publishedOnly) {
        where.isPublished = true
        companyWhere.status = "PUBLISHED"
    } else if (isPublished !== undefined) {
        where.isPublished = isPublished
    }

    if (query.companyId) {
        where.companyId = query.companyId
    }

    if (query.companySlug) {
        companyWhere.slug = query.companySlug
    }

    if (query.employmentType) {
        where.employmentType = query.employmentType
    }

    if (search) {
        where.OR = [
            { title: { contains: search, mode: "insensitive" } },
            { slug: { contains: search, mode: "insensitive" } },
            { location: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { requirements: { contains: search, mode: "insensitive" } },
            { company: { is: { name: { contains: search, mode: "insensitive" } } } },
        ]
    }

    if (Object.keys(companyWhere).length > 0) {
        where.company = { is: companyWhere }
    }

    return where
}

const getAllJobs = async (query: JobQuery, publishedOnly = false) => {
    try {
        const page = parsePositiveNumber(query.page, 1)
        const limit = parsePositiveNumber(query.limit, 10)
        const skip = (page - 1) * limit
        const where = buildJobWhere(query, publishedOnly)

        const [jobs, total] = await Promise.all([
            prisma.job.findMany({
                where,
                select: jobSelect,
                skip,
                take: limit,
                orderBy: [{ createdAt: "desc" }],
            }),
            prisma.job.count({ where }),
        ])

        return {
            meta: {
                page,
                limit,
                total,
                totalPage: Math.ceil(total / limit) || 1,
            },
            jobs,
        }
    } catch (error) {
        handleJobError(error, "Unable to fetch jobs")
    }
}

const getPublishedJobs = async (query: JobQuery) => {
    return getAllJobs(query, true)
}

const getAdminJobs = async (query: JobQuery) => {
    return getAllJobs(query, false)
}

const getJobBySlug = async (slug: string) => {
    try {
        const job = await prisma.job.findFirst({
            where: {
                slug,
                isPublished: true,
                company: {
                    is: {
                        status: "PUBLISHED",
                    },
                },
            },
            select: jobSelect,
        })

        if (!job) {
            throw new AppError(httpStatus.NOT_FOUND, "Job not found")
        }

        return job
    } catch (error) {
        handleJobError(error, "Unable to fetch job")
    }
}

const getAdminJobById = async (id: string) => {
    try {
        return await getJobByIdOrThrow(id)
    } catch (error) {
        handleJobError(error, "Unable to fetch job")
    }
}

const createJob = async (payload: CreateJobPayload) => {
    try {
        await ensureCompanyExists(payload.companyId)

        const slug = generateSlug(payload.slug || payload.title)
        await ensureUniqueSlug(slug)

        return await prisma.job.create({
            data: {
                title: payload.title,
                slug,
                companyId: payload.companyId,
                location: payload.location ?? null,
                employmentType: payload.employmentType ?? "FULL_TIME",
                requirements: payload.requirements ?? null,
                description: payload.description ?? null,
                salaryInfo: payload.salaryInfo ?? null,
                deadline: payload.deadline ? new Date(payload.deadline) : null,
                isPublished: payload.isPublished ?? false,
            },
            select: jobSelect,
        })
    } catch (error) {
        handleJobError(error, "Unable to create job")
    }
}

const updateJob = async (id: string, payload: UpdateJobPayload) => {
    try {
        const existing = await getJobByIdOrThrow(id)

        if (payload.companyId) {
            await ensureCompanyExists(payload.companyId)
        }

        const data: Prisma.JobUpdateInput = { ...payload }

        if (payload.slug || payload.title) {
            const slug = generateSlug(payload.slug || payload.title || existing.slug)
            await ensureUniqueSlug(slug, id)
            data.slug = slug
        }

        if (payload.deadline !== undefined) {
            data.deadline = payload.deadline ? new Date(payload.deadline) : null
        }

        if (payload.companyId) {
            data.company = { connect: { id: payload.companyId } }
            delete (data as { companyId?: string }).companyId
        }

        return await prisma.job.update({
            where: { id },
            data,
            select: jobSelect,
        })
    } catch (error) {
        handleJobError(error, "Unable to update job")
    }
}

const deleteJob = async (id: string) => {
    try {
        await getJobByIdOrThrow(id)

        await prisma.job.delete({
            where: { id },
        })

        return null
    } catch (error) {
        handleJobError(error, "Unable to delete job")
    }
}

export const JobService = {
    getPublishedJobs,
    getAdminJobs,
    getJobBySlug,
    getAdminJobById,
    createJob,
    updateJob,
    deleteJob,
}
