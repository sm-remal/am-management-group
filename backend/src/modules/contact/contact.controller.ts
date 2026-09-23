import type { Request, Response } from "express"
import httpStatus from "http-status"
import AppError from "../../utility/AppError"
import asyncHandler from "../../utility/asyncHandler"
import sendResponse from "../../utility/sendResponse"
import { ContactService } from "./contact.service"

const getParam = (req: Request, key: string) => {
    const value = req.params[key]

    if (!value || Array.isArray(value)) {
        throw new AppError(httpStatus.BAD_REQUEST, `${key} is required`)
    }

    return value
}

const createInquiry = asyncHandler(async (req: Request, res: Response) => {
    const result = await ContactService.createInquiry(req.body)

    sendResponse(res, httpStatus.CREATED, {
        success: true,
        message: "Inquiry submitted successfully",
        data: { inquiry: result },
    })
})

const getAllInquiries = asyncHandler(async (req: Request, res: Response) => {
    const result = await ContactService.getAllInquiries(req.query)

    sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Inquiries fetched successfully",
        data: result,
    })
})

const getInquiryById = asyncHandler(async (req: Request, res: Response) => {
    const result = await ContactService.getInquiryById(getParam(req, "id"))

    sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Inquiry fetched successfully",
        data: { inquiry: result },
    })
})

const updateInquiry = asyncHandler(async (req: Request, res: Response) => {
    const result = await ContactService.updateInquiry(getParam(req, "id"), req.body)

    sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Inquiry updated successfully",
        data: { inquiry: result },
    })
})

const updateInquiryStatus = asyncHandler(async (req: Request, res: Response) => {
    const result = await ContactService.updateInquiryStatus(getParam(req, "id"), req.body)

    sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Inquiry status updated successfully",
        data: { inquiry: result },
    })
})

const deleteInquiry = asyncHandler(async (req: Request, res: Response) => {
    await ContactService.deleteInquiry(getParam(req, "id"))

    sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Inquiry deleted successfully",
    })
})

export const ContactController = {
    createInquiry,
    getAllInquiries,
    getInquiryById,
    updateInquiry,
    updateInquiryStatus,
    deleteInquiry,
}
