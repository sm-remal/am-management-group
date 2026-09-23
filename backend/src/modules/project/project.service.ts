import httpStatus from "http-status"
import { Prisma } from "../../../generated/prisma/client"
import { prisma } from "../../lib/prisma"
import AppError from "../../utility/AppError"
import type {
    CreateProjectImagePayload,
    CreateProjectPayload,
    ProjectQuery,
    UpdateProjectImagePayload,
    UpdateProjectPayload,
} from "./project.interface"

const projectImageSelect = {
    id: true,
    projectId: true,
    imageUrl: true,
    caption: true,
    order: true,
    createdAt: true,
} satisfies Prisma.ProjectImageSelect

const projectSelect = {
    id: true,
    name: true,
    slug: true,
    companyId: true,
    category: true,
    location: true,
    clientName: true,
    description: true,
    scope: true,
    highlights: true,
    startDate: true,
    endDate: true,
    status: true,
    featured: true,
    coverImage: true,
    publishStatus: true,
    displayOrder: true,
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
    images: {
        select: projectImageSelect,
        orderBy: [
            { order: "asc" },
            { createdAt: "asc" },
        ],
    },
} satisfies Prisma.ProjectSelect

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

const buildProjectWhere = (query: ProjectQuery, publishedOnly = false): Prisma.ProjectWhereInput => {
    const where: Prisma.ProjectWhereInput = {}
    const companyWhere: Prisma.CompanyWhereInput = {}
    const search = query.search?.trim()
    const featured = parseBoolean(query.featured)

    if (publishedOnly) {
        where.publishStatus = "PUBLISHED"
        companyWhere.status = "PUBLISHED"
    } else if (query.publishStatus) {
        where.publishStatus = query.publishStatus
    }

    if (query.companyId) {
        where.companyId = query.companyId
    }

    if (query.companySlug) {
        companyWhere.slug = query.companySlug
    }

    if (query.category) {
        where.category = query.category
    }

    if (query.status) {
        where.status = query.status
    }

    if (featured !== undefined) {
        where.featured = featured
    }

    if (search) {
        where.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { slug: { contains: search, mode: "insensitive" } },
            { location: { contains: search, mode: "insensitive" } },
            { clientName: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { scope: { contains: search, mode: "insensitive" } },
            { highlights: { contains: search, mode: "insensitive" } },
            { company: { is: { name: { contains: search, mode: "insensitive" } } } },
        ]
    }

    if (Object.keys(companyWhere).length > 0) {
        where.company = { is: companyWhere }
    }

    return where
}

const handleProjectError = (error: unknown, fallbackMessage: string): never => {
    if (error instanceof AppError) {
        throw error
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new AppError(httpStatus.CONFLICT, "Project already exists with this unique value")
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        throw new AppError(httpStatus.NOT_FOUND, "Project not found")
    }

    // throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, fallbackMessage)
    console.error(`[ProjectService] ${fallbackMessage}:`, error) 
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

const ensureUniqueSlug = async (slug: string, ignoreId?: string) => {
    const existingProject = await prisma.project.findUnique({
        where: { slug },
        select: { id: true },
    })

    if (existingProject && existingProject.id !== ignoreId) {
        throw new AppError(httpStatus.CONFLICT, "Project slug already exists")
    }
}

const getProjectByIdOrThrow = async (id: string) => {
    const project = await prisma.project.findUnique({
        where: { id },
        select: projectSelect,
    })

    if (!project) {
        throw new AppError(httpStatus.NOT_FOUND, "Project not found")
    }

    return project
}

const ensureProjectImageExists = async (id: string) => {
    const image = await prisma.projectImage.findUnique({
        where: { id },
        select: projectImageSelect,
    })

    if (!image) {
        throw new AppError(httpStatus.NOT_FOUND, "Project image not found")
    }

    return image
}

const getAllProjects = async (query: ProjectQuery, publishedOnly = false) => {
    try {
        const page = parsePositiveNumber(query.page, 1)
        const limit = parsePositiveNumber(query.limit, 10)
        const skip = (page - 1) * limit
        const where = buildProjectWhere(query, publishedOnly)

        const [projects, total] = await Promise.all([
            prisma.project.findMany({
                where,
                select: projectSelect,
                skip,
                take: limit,
                orderBy: [
                    { featured: "desc" },
                    { displayOrder: "asc" },
                    { createdAt: "desc" },
                ],
            }),
            prisma.project.count({ where }),
        ])

        return {
            meta: {
                page,
                limit,
                total,
                totalPage: Math.ceil(total / limit),
            },
            projects,
        }
    } catch (error) {
        handleProjectError(error, "Unable to fetch projects")
    }
}

const getPublishedProjects = async (query: ProjectQuery) => {
    return getAllProjects(query, true)
}

const getFeaturedProjects = async (query: ProjectQuery) => {
    return getAllProjects({ ...query, featured: "true" }, true)
}

const getAdminProjects = async (query: ProjectQuery) => {
    return getAllProjects(query)
}

const getProjectBySlug = async (slug: string) => {
    try {
        const project = await prisma.project.findFirst({
            where: {
                slug,
                publishStatus: "PUBLISHED",
                company: {
                    is: {
                        status: "PUBLISHED",
                    },
                },
            },
            select: projectSelect,
        })

        if (!project) {
            throw new AppError(httpStatus.NOT_FOUND, "Project not found")
        }

        return project
    } catch (error) {
        handleProjectError(error, "Unable to fetch project")
    }
}

const getAdminProjectById = async (id: string) => {
    try {
        return await getProjectByIdOrThrow(id)
    } catch (error) {
        handleProjectError(error, "Unable to fetch project")
    }
}

const createProject = async (payload: CreateProjectPayload) => {
    try {
        await ensureCompanyExists(payload.companyId)

        const slug = generateSlug(payload.slug || payload.name)
        await ensureUniqueSlug(slug)
        const data: Prisma.ProjectCreateInput = {
            name: payload.name,
            slug,
            company: {
                connect: { id: payload.companyId },
            },
            category: payload.category,
            location: payload.location ?? null,
            clientName: payload.clientName ?? null,
            description: payload.description ?? null,
            scope: payload.scope ?? null,
            highlights: payload.highlights ?? null,
            startDate: payload.startDate ?? null,
            endDate: payload.endDate ?? null,
            status: payload.status ?? "UPCOMING",
            featured: payload.featured ?? false,
            coverImage: payload.coverImage ?? null,
            publishStatus: payload.publishStatus ?? "DRAFT",
            displayOrder: payload.displayOrder ?? 0,
        }

        if (payload.images?.length) {
            data.images = {
                create: payload.images.map((image, index) => ({
                    imageUrl: image.imageUrl,
                    caption: image.caption ?? null,
                    order: image.order ?? index,
                })),
            }
        }

        return await prisma.project.create({
            data,
            select: projectSelect,
        })
    } catch (error) {
        handleProjectError(error, "Unable to create project")
    }
}

const updateProject = async (id: string, payload: UpdateProjectPayload) => {
    try {
        await getProjectByIdOrThrow(id)

        if (payload.companyId) {
            await ensureCompanyExists(payload.companyId)
        }

        const data: UpdateProjectPayload = { ...payload }

        if (payload.slug || payload.name) {
            data.slug = generateSlug(payload.slug || payload.name || "")
            await ensureUniqueSlug(data.slug, id)
        }

        return await prisma.project.update({
            where: { id },
            data,
            select: projectSelect,
        })
    } catch (error) {
        handleProjectError(error, "Unable to update project")
    }
}

const deleteProject = async (id: string) => {
    try {
        await getProjectByIdOrThrow(id)

        await prisma.project.delete({
            where: { id },
        })

        return null
    } catch (error) {
        handleProjectError(error, "Unable to delete project")
    }
}

const addProjectImage = async (projectId: string, payload: CreateProjectImagePayload) => {
    try {
        await getProjectByIdOrThrow(projectId)

        return await prisma.projectImage.create({
            data: {
                projectId,
                imageUrl: payload.imageUrl,
                caption: payload.caption ?? null,
                order: payload.order ?? 0,
            },
            select: projectImageSelect,
        })
    } catch (error) {
        handleProjectError(error, "Unable to add project image")
    }
}

const updateProjectImage = async (id: string, payload: UpdateProjectImagePayload) => {
    try {
        await ensureProjectImageExists(id)

        return await prisma.projectImage.update({
            where: { id },
            data: payload,
            select: projectImageSelect,
        })
    } catch (error) {
        handleProjectError(error, "Unable to update project image")
    }
}

const deleteProjectImage = async (id: string) => {
    try {
        await ensureProjectImageExists(id)

        await prisma.projectImage.delete({
            where: { id },
        })

        return null
    } catch (error) {
        handleProjectError(error, "Unable to delete project image")
    }
}

export const ProjectService = {
    getPublishedProjects,
    getFeaturedProjects,
    getAdminProjects,
    getProjectBySlug,
    getAdminProjectById,
    createProject,
    updateProject,
    deleteProject,
    addProjectImage,
    updateProjectImage,
    deleteProjectImage,
}
