import type { EmploymentType } from "../../../generated/prisma/client"

export type JobQuery = {
    page?: string
    limit?: string
    search?: string
    companyId?: string
    companySlug?: string
    employmentType?: EmploymentType
    isPublished?: string
}

export type CreateJobPayload = {
    title: string
    slug?: string
    companyId: string
    location?: string | null
    employmentType?: EmploymentType
    requirements?: string | null
    description?: string | null
    salaryInfo?: string | null
    deadline?: Date | string | null
    isPublished?: boolean
}

export type UpdateJobPayload = Partial<CreateJobPayload>
