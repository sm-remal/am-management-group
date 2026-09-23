import type { Request, Response } from "express"
import httpStatus from "http-status"
import AppError from "../../utility/AppError"
import asyncHandler from "../../utility/asyncHandler"
import sendResponse from "../../utility/sendResponse"
import { CompanyService } from "./company.service"

const getParam = (req: Request, key: string) => {
    const value = req.params[key]

    if (!value || Array.isArray(value)) {
        throw new AppError(httpStatus.BAD_REQUEST, `${key} is required`)
    }

    return value
}

const getPublishedCompanies = asyncHandler(async (req: Request, res: Response) => {
    const result = await CompanyService.getPublishedCompanies(req.query)

    sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Companies fetched successfully",
        data: result,
    })
})

const getAdminCompanies = asyncHandler(async (req: Request, res: Response) => {
    const result = await CompanyService.getAdminCompanies(req.query)

    sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Companies fetched successfully",
        data: result,
    })
})

const getCompanyBySlug = asyncHandler(async (req: Request, res: Response) => {
    const result = await CompanyService.getCompanyBySlug(getParam(req, "slug"))

    sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Company fetched successfully",
        data: { company: result },
    })
})

const getAdminCompanyById = asyncHandler(async (req: Request, res: Response) => {
    const result = await CompanyService.getAdminCompanyById(getParam(req, "id"))

    sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Company fetched successfully",
        data: { company: result },
    })
})

const createCompany = asyncHandler(async (req: Request, res: Response) => {
    const result = await CompanyService.createCompany(req.body)

    sendResponse(res, httpStatus.CREATED, {
        success: true,
        message: "Company created successfully",
        data: { company: result },
    })
})

const updateCompany = asyncHandler(async (req: Request, res: Response) => {
    const result = await CompanyService.updateCompany(getParam(req, "id"), req.body)

    sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Company updated successfully",
        data: { company: result },
    })
})

const deleteCompany = asyncHandler(async (req: Request, res: Response) => {
    await CompanyService.deleteCompany(getParam(req, "id"))

    sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Company deleted successfully",
    })
})

export const CompanyController = {
    getPublishedCompanies,
    getAdminCompanies,
    getCompanyBySlug,
    getAdminCompanyById,
    createCompany,
    updateCompany,
    deleteCompany,
}
