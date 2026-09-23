import type { InquiryStatus } from "../../../generated/prisma/client"

export type ContactQuery = {
    page?: string
    limit?: string
    search?: string
    status?: InquiryStatus
}

export type CreateInquiryPayload = {
    name: string
    email: string
    phone: string
    company?: string | null
    subject: string
    message: string
}

export type UpdateInquiryPayload = Partial<CreateInquiryPayload> & {
    status?: InquiryStatus
}

export type UpdateInquiryStatusPayload = {
    status: InquiryStatus
}
