import type { BusinessCategory } from "../../../generated/prisma/client"

export type ServiceQuery = {
    page?: string
    limit?: string
    search?: string
    companyId?: string
    companySlug?: string
    category?: BusinessCategory
    isActive?: string
}

export type CreateServicePayload = {
    companyId: string
    title: string
    slug?: string
    description?: string | null
    icon?: string | null
    image?: string | null
    displayOrder?: number
    isActive?: boolean
}

export type UpdateServicePayload = Partial<CreateServicePayload>
