import httpStatus from "http-status"
import { Prisma } from "../../../generated/prisma/client"
import { prisma } from "../../lib/prisma"
import AppError from "../../utility/AppError"
import type {
    ApplicationQuery,
    CreateApplicationPayload,
    UpdateApplicationPayload,
    UpdateApplicationStatusPayload,
} from "./application.interface"

const applicationSelect = {
    id: true,
    jobId: true,
    fullName: true,
    email: true,
    phone: true,
    preferredCompanyId: true,
    cvUrl: true,
    coverMessage: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    job: {
        select: {
            id: true,
            title: true,
            slug: true,
            location: true,
            employmentType: true,
            isPublished: true,
            company: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    logo: true,
                },
            },
        },
    },
    preferredCompany: {
        select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
        },
    },
} satisfies Prisma.ApplicationSelect

const parsePositiveNumber = (value: string | undefined, fallback: number) => {
    const parsed = Number(value)
    return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback
}

const handleApplicationError = (error: unknown, fallbackMessage: string): never => {
    if (error instanceof AppError) {
        throw error
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        throw new AppError(httpStatus.NOT_FOUND, "Application not found")
    }

    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, fallbackMessage)
}

const ensureJobIsOpen = async (jobId: string) => {
    const job = await prisma.job.findUnique({
        where: { id: jobId },
        select: {
            id: true,
            isPublished: true,
            deadline: true,
            company: {
                select: {
                    status: true,
                },
            },
        },
    })

    if (!job) {
        throw new AppError(httpStatus.NOT_FOUND, "Job not found")
    }

    if (!job.isPublished || job.company.status !== "PUBLISHED") {
        throw new AppError(httpStatus.BAD_REQUEST, "This job is not open for applications")
    }

    if (job.deadline && new Date(job.deadline) < new Date()) {
        throw new AppError(httpStatus.BAD_REQUEST, "Application deadline has passed")
    }

    return job
}

const ensureCompanyExists = async (companyId: string) => {
    const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: { id: true },
    })

    if (!company) {
        throw new AppError(httpStatus.NOT_FOUND, "Preferred company not found")
    }
}

const getApplicationByIdOrThrow = async (id: string) => {
    const application = await prisma.application.findUnique({
        where: { id },
        select: applicationSelect,
    })

    if (!application) {
        throw new AppError(httpStatus.NOT_FOUND, "Application not found")
    }

    return application
}

const buildApplicationWhere = (query: ApplicationQuery): Prisma.ApplicationWhereInput => {
    const where: Prisma.ApplicationWhereInput = {}
    const search = query.search?.trim()

    if (query.jobId) {
        where.jobId = query.jobId
    }

    if (query.status) {
        where.status = query.status
    }

    if (query.preferredCompanyId) {
        where.preferredCompanyId = query.preferredCompanyId
    }

    if (search) {
        where.OR = [
            { fullName: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
            { coverMessage: { contains: search, mode: "insensitive" } },
            { job: { is: { title: { contains: search, mode: "insensitive" } } } },
        ]
    }

    return where
}

const createApplication = async (payload: CreateApplicationPayload) => {
    try {
        await ensureJobIsOpen(payload.jobId)

        if (payload.preferredCompanyId) {
            await ensureCompanyExists(payload.preferredCompanyId)
        }

        return await prisma.application.create({
            data: {
                jobId: payload.jobId,
                fullName: payload.fullName,
                email: payload.email,
                phone: payload.phone,
                preferredCompanyId: payload.preferredCompanyId ?? null,
                cvUrl: payload.cvUrl,
                coverMessage: payload.coverMessage ?? null,
            },
            select: applicationSelect,
        })
    } catch (error) {
        handleApplicationError(error, "Unable to submit application")
    }
}

const getAllApplications = async (query: ApplicationQuery) => {
    try {
        const page = parsePositiveNumber(query.page, 1)
        const limit = parsePositiveNumber(query.limit, 10)
        const skip = (page - 1) * limit
        const where = buildApplicationWhere(query)

        const [applications, total] = await Promise.all([
            prisma.application.findMany({
                where,
                select: applicationSelect,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
            }),
            prisma.application.count({ where }),
        ])

        return {
            meta: {
                page,
                limit,
                total,
                totalPage: Math.ceil(total / limit) || 1,
            },
            applications,
        }
    } catch (error) {
        handleApplicationError(error, "Unable to fetch applications")
    }
}

const getApplicationById = async (id: string) => {
    try {
        return await getApplicationByIdOrThrow(id)
    } catch (error) {
        handleApplicationError(error, "Unable to fetch application")
    }
}

const updateApplication = async (id: string, payload: UpdateApplicationPayload) => {
    try {
        await getApplicationByIdOrThrow(id)

        if (payload.jobId) {
            await ensureJobIsOpen(payload.jobId)
        }

        if (payload.preferredCompanyId) {
            await ensureCompanyExists(payload.preferredCompanyId)
        }

        return await prisma.application.update({
            where: { id },
            data: payload,
            select: applicationSelect,
        })
    } catch (error) {
        handleApplicationError(error, "Unable to update application")
    }
}

const updateApplicationStatus = async (id: string, payload: UpdateApplicationStatusPayload) => {
    try {
        await getApplicationByIdOrThrow(id)

        return await prisma.application.update({
            where: { id },
            data: { status: payload.status },
            select: applicationSelect,
        })
    } catch (error) {
        handleApplicationError(error, "Unable to update application status")
    }
}

const deleteApplication = async (id: string) => {
    try {
        await getApplicationByIdOrThrow(id)

        await prisma.application.delete({
            where: { id },
        })

        return null
    } catch (error) {
        handleApplicationError(error, "Unable to delete application")
    }
}

export const ApplicationService = {
    createApplication,
    getAllApplications,
    getApplicationById,
    updateApplication,
    updateApplicationStatus,
    deleteApplication,
}
