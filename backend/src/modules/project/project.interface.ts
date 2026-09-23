import type { BusinessCategory, ProjectStatus, PublishStatus } from "../../../generated/prisma/client"

export type ProjectQuery = {
    page?: string
    limit?: string
    search?: string
    companyId?: string
    companySlug?: string
    category?: BusinessCategory
    status?: ProjectStatus
    publishStatus?: PublishStatus
    featured?: string
}

export type CreateProjectImagePayload = {
    imageUrl: string
    caption?: string | null
    order?: number
}

export type CreateProjectPayload = {
    name: string
    slug?: string
    companyId: string
    category: BusinessCategory
    location?: string | null
    clientName?: string | null
    description?: string | null
    scope?: string | null
    highlights?: string | null
    startDate?: Date | null
    endDate?: Date | null
    status?: ProjectStatus
    featured?: boolean
    coverImage?: string | null
    publishStatus?: PublishStatus
    displayOrder?: number
    images?: CreateProjectImagePayload[]
}

export type UpdateProjectPayload = Partial<Omit<CreateProjectPayload, "images">>

export type UpdateProjectImagePayload = {
    imageUrl?: string
    caption?: string | null
    order?: number
}
