import type { Request, Response } from "express"
import httpStatus from "http-status"
import AppError from "../../utility/AppError"
import asyncHandler from "../../utility/asyncHandler"
import sendResponse from "../../utility/sendResponse"
import { ServiceService } from "./service.service"

const getParam = (req: Request, key: string) => {
    const value = req.params[key]

    if (!value || Array.isArray(value)) {
        throw new AppError(httpStatus.BAD_REQUEST, `${key} is required`)
    }

    return value
}

const getPublishedServices = asyncHandler(async (req: Request, res: Response) => {
    const result = await ServiceService.getPublishedServices(req.query)

    sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Services fetched successfully",
        data: result,
    })
})

const getAdminServices = asyncHandler(async (req: Request, res: Response) => {
    const result = await ServiceService.getAdminServices(req.query)

    sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Services fetched successfully",
        data: result,
    })
})

const getServiceByCompanyAndSlug = asyncHandler(async (req: Request, res: Response) => {
    const result = await ServiceService.getServiceByCompanyAndSlug(
        getParam(req, "companySlug"),
        getParam(req, "slug")
    )

    sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Service fetched successfully",
        data: { service: result },
    })
})

const getAdminServiceById = asyncHandler(async (req: Request, res: Response) => {
    const result = await ServiceService.getAdminServiceById(getParam(req, "id"))

    sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Service fetched successfully",
        data: { service: result },
    })
})

const createService = asyncHandler(async (req: Request, res: Response) => {
    const result = await ServiceService.createService(req.body)

    sendResponse(res, httpStatus.CREATED, {
        success: true,
        message: "Service created successfully",
        data: { service: result },
    })
})

const updateService = asyncHandler(async (req: Request, res: Response) => {
    const result = await ServiceService.updateService(getParam(req, "id"), req.body)

    sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Service updated successfully",
        data: { service: result },
    })
})

const deleteService = asyncHandler(async (req: Request, res: Response) => {
    await ServiceService.deleteService(getParam(req, "id"))

    sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Service deleted successfully",
    })
})

export const ServiceController = {
    getPublishedServices,
    getAdminServices,
    getServiceByCompanyAndSlug,
    getAdminServiceById,
    createService,
    updateService,
    deleteService,
}
