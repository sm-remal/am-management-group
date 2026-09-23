import httpStatus from "http-status"
import { prisma } from "../../lib/prisma"
import AppError from "../../utility/AppError"
import type { DashboardQuery } from "./dashboard.interface"

const parsePositiveNumber = (value: string | undefined, fallback: number) => {
    const parsed = Number(value)
    return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback
}

const handleDashboardError = (error: unknown, fallbackMessage: string): never => {
    if (error instanceof AppError) {
        throw error
    }

    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, fallbackMessage)
}

const getDashboardOverview = async (query: DashboardQuery) => {
    try {
        const recentLimit = parsePositiveNumber(query.recentLimit, 5)

        const [
            totalUsers,
            activeUsers,
            adminUsers,
            totalCompanies,
            publishedCompanies,
            draftCompanies,
            archivedCompanies,
            totalServices,
            activeServices,
            totalProjects,
            publishedProjects,
            featuredProjects,
            ongoingProjects,
            completedProjects,
            totalGalleryImages,
            publishedGalleryImages,
            totalNews,
            publishedNews,
            totalJobs,
            openJobs,
            totalApplications,
            newApplications,
            totalInquiries,
            newInquiries,
            totalTeamMembers,
            activeTeamMembers,
            totalSocialLinks,
            totalSettings,
            latestInquiries,
            latestApplications,
            latestProjects,
            latestNews,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { isActive: true } }),
            prisma.user.count({ where: { role: "ADMIN" } }),
            prisma.company.count(),
            prisma.company.count({ where: { status: "PUBLISHED" } }),
            prisma.company.count({ where: { status: "DRAFT" } }),
            prisma.company.count({ where: { status: "ARCHIVED" } }),
            prisma.service.count(),
            prisma.service.count({ where: { isActive: true } }),
            prisma.project.count(),
            prisma.project.count({ where: { publishStatus: "PUBLISHED" } }),
            prisma.project.count({ where: { featured: true } }),
            prisma.project.count({ where: { status: "ONGOING" } }),
            prisma.project.count({ where: { status: "COMPLETED" } }),
            prisma.galleryImage.count(),
            prisma.galleryImage.count({ where: { isPublished: true } }),
            prisma.news.count(),
            prisma.news.count({ where: { status: "PUBLISHED" } }),
            prisma.job.count(),
            prisma.job.count({ where: { isPublished: true } }),
            prisma.application.count(),
            prisma.application.count({ where: { status: "PENDING" } }),
            prisma.inquiry.count(),
            prisma.inquiry.count({ where: { status: "NEW" } }),
            prisma.teamMember.count(),
            prisma.teamMember.count({ where: { isActive: true } }),
            prisma.socialLink.count(),
            prisma.setting.count(),
            prisma.inquiry.findMany({
                take: recentLimit,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    company: true,
                    subject: true,
                    status: true,
                    createdAt: true,
                },
            }),
            prisma.application.findMany({
                take: recentLimit,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    phone: true,
                    status: true,
                    createdAt: true,
                    job: {
                        select: {
                            id: true,
                            title: true,
                            slug: true,
                            company: {
                                select: {
                                    id: true,
                                    name: true,
                                    slug: true,
                                },
                            },
                        },
                    },
                    preferredCompany: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        },
                    },
                },
            }),
            prisma.project.findMany({
                take: recentLimit,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    status: true,
                    publishStatus: true,
                    featured: true,
                    createdAt: true,
                    company: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        },
                    },
                },
            }),
            prisma.news.findMany({
                take: recentLimit,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    status: true,
                    publishedAt: true,
                    createdAt: true,
                    author: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            }),
        ])

        return {
            stats: {
                users: {
                    total: totalUsers,
                    active: activeUsers,
                    admin: adminUsers,
                },
                companies: {
                    total: totalCompanies,
                    published: publishedCompanies,
                    draft: draftCompanies,
                    archived: archivedCompanies,
                },
                services: {
                    total: totalServices,
                    active: activeServices,
                },
                projects: {
                    total: totalProjects,
                    published: publishedProjects,
                    featured: featuredProjects,
                    ongoing: ongoingProjects,
                    completed: completedProjects,
                },
                gallery: {
                    total: totalGalleryImages,
                    published: publishedGalleryImages,
                },
                news: {
                    total: totalNews,
                    published: publishedNews,
                },
                careers: {
                    jobs: totalJobs,
                    openJobs,
                    applications: totalApplications,
                    newApplications,
                },
                inquiries: {
                    total: totalInquiries,
                    new: newInquiries,
                },
                team: {
                    total: totalTeamMembers,
                    active: activeTeamMembers,
                },
                socialLinks: {
                    total: totalSocialLinks,
                },
                settings: {
                    total: totalSettings,
                },
            },
            recentActivity: {
                inquiries: latestInquiries,
                applications: latestApplications,
                projects: latestProjects,
                news: latestNews,
            },
        }
    } catch (error) {
        handleDashboardError(error, "Unable to fetch dashboard overview")
    }
}

export const DashboardService = {
    getDashboardOverview,
}
