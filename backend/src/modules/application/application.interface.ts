import type { ApplicationStatus } from "../../../generated/prisma/client"

export type ApplicationQuery = {
    page?: string
    limit?: string
    search?: string
    jobId?: string
    status?: ApplicationStatus
    preferredCompanyId?: string
}

export type CreateApplicationPayload = {
    jobId: string
    fullName: string
    email: string
    phone: string
    preferredCompanyId?: string | null
    cvUrl: string
    coverMessage?: string | null
}

export type UpdateApplicationPayload = Partial<CreateApplicationPayload> & {
    status?: ApplicationStatus
}

export type UpdateApplicationStatusPayload = {
    status: ApplicationStatus
}
