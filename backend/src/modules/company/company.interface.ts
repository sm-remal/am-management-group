import type { BusinessCategory, PublishStatus } from "../../../generated/prisma/client"

export type CompanyQuery = {
    page?: string
    limit?: string
    search?: string
    category?: BusinessCategory
    status?: PublishStatus
    isMainCompany?: string
}

export type CreateCompanyPayload = {
    name: string
    slug?: string
    category: BusinessCategory
    isMainCompany?: boolean
    shortDescription?: string | null
    description?: string | null
    logo?: string | null
    coverImage?: string | null
    registrationNumber?: string | null
    establishedDate?: Date | null
    address?: string | null
    phone?: string | null
    email?: string | null
    businessHours?: string | null
    seoTitle?: string | null
    seoDescription?: string | null
    displayOrder?: number
    status?: PublishStatus
}

export type UpdateCompanyPayload = Partial<CreateCompanyPayload>
