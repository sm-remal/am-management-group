import httpStatus from "http-status"
import { Prisma } from "../../../generated/prisma/client"
import { prisma } from "../../lib/prisma"
import AppError from "../../utility/AppError"
import type {
    ContactQuery,
    CreateInquiryPayload,
    UpdateInquiryPayload,
    UpdateInquiryStatusPayload,
} from "./contact.interface"

const inquirySelect = {
    id: true,
    name: true,
    email: true,
    phone: true,
    company: true,
    subject: true,
    message: true,
    status: true,
    createdAt: true,
    updatedAt: true,
} satisfies Prisma.InquirySelect

const parsePositiveNumber = (value: string | undefined, fallback: number) => {
    const parsed = Number(value)
    return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback
}

const buildInquiryWhere = (query: ContactQuery): Prisma.InquiryWhereInput => {
    const where: Prisma.InquiryWhereInput = {}
    const search = query.search?.trim()

    if (query.status) {
        where.status = query.status
    }

    if (search) {
        where.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
            { company: { contains: search, mode: "insensitive" } },
            { subject: { contains: search, mode: "insensitive" } },
            { message: { contains: search, mode: "insensitive" } },
        ]
    }

    return where
}

const handleContactError = (error: unknown, fallbackMessage: string): never => {
    if (error instanceof AppError) {
        throw error
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        throw new AppError(httpStatus.NOT_FOUND, "Inquiry not found")
    }

    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, fallbackMessage)
}

const getInquiryByIdOrThrow = async (id: string) => {
    const inquiry = await prisma.inquiry.findUnique({
        where: { id },
        select: inquirySelect,
    })

    if (!inquiry) {
        throw new AppError(httpStatus.NOT_FOUND, "Inquiry not found")
    }

    return inquiry
}

const createInquiry = async (payload: CreateInquiryPayload) => {
    try {
        return await prisma.inquiry.create({
            data: {
                name: payload.name,
                email: payload.email,
                phone: payload.phone,
                company: payload.company ?? null,
                subject: payload.subject,
                message: payload.message,
            },
            select: inquirySelect,
        })
    } catch (error) {
        handleContactError(error, "Unable to submit inquiry")
    }
}

const getAllInquiries = async (query: ContactQuery) => {
    try {
        const page = parsePositiveNumber(query.page, 1)
        const limit = parsePositiveNumber(query.limit, 10)
        const skip = (page - 1) * limit
        const where = buildInquiryWhere(query)

        const [inquiries, total] = await Promise.all([
            prisma.inquiry.findMany({
                where,
                select: inquirySelect,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
            }),
            prisma.inquiry.count({ where }),
        ])

        return {
            meta: {
                page,
                limit,
                total,
                totalPage: Math.ceil(total / limit),
            },
            inquiries,
        }
    } catch (error) {
        handleContactError(error, "Unable to fetch inquiries")
    }
}

const getInquiryById = async (id: string) => {
    try {
        return await getInquiryByIdOrThrow(id)
    } catch (error) {
        handleContactError(error, "Unable to fetch inquiry")
    }
}

const updateInquiry = async (id: string, payload: UpdateInquiryPayload) => {
    try {
        await getInquiryByIdOrThrow(id)

        return await prisma.inquiry.update({
            where: { id },
            data: payload,
            select: inquirySelect,
        })
    } catch (error) {
        handleContactError(error, "Unable to update inquiry")
    }
}

const updateInquiryStatus = async (id: string, payload: UpdateInquiryStatusPayload) => {
    try {
        await getInquiryByIdOrThrow(id)

        return await prisma.inquiry.update({
            where: { id },
            data: { status: payload.status },
            select: inquirySelect,
        })
    } catch (error) {
        handleContactError(error, "Unable to update inquiry status")
    }
}

const deleteInquiry = async (id: string) => {
    try {
        await getInquiryByIdOrThrow(id)

        await prisma.inquiry.delete({
            where: { id },
        })

        return null
    } catch (error) {
        handleContactError(error, "Unable to delete inquiry")
    }
}

export const ContactService = {
    createInquiry,
    getAllInquiries,
    getInquiryById,
    updateInquiry,
    updateInquiryStatus,
    deleteInquiry,
}
