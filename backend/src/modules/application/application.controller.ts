import type { Request, Response } from "express"
import httpStatus from "http-status"
import AppError from "../../utility/AppError"
import asyncHandler from "../../utility/asyncHandler"
import sendResponse from "../../utility/sendResponse"
import { ApplicationService } from "./application.service"

const getParam = (req: Request, key: string) => {
    const value = req.params[key]

    if (!value || Array.isArray(value)) {
        throw new AppError(httpStatus.BAD_REQUEST, `${key} is required`)
    }

    return value
}

const createApplication = asyncHandler(async (req: Request, res: Response) => {
    const result = await ApplicationService.createApplication(req.body)

    sendResponse(res, httpStatus.CREATED, {
        success: true,
        message: "Application submitted successfully",
        data: { application: result },
    })
})

const getAllApplications = asyncHandler(async (req: Request, res: Response) => {
    const result = await ApplicationService.getAllApplications(req.query)

    sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Applications fetched successfully",
        data: result,
    })
})

const getApplicationById = asyncHandler(async (req: Request, res: Response) => {
    const result = await ApplicationService.getApplicationById(getParam(req, "id"))

    sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Application fetched successfully",
        data: { application: result },
    })
})

const updateApplication = asyncHandler(async (req: Request, res: Response) => {
    const result = await ApplicationService.updateApplication(getParam(req, "id"), req.body)

    sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Application updated successfully",
        data: { application: result },
    })
})

const updateApplicationStatus = asyncHandler(async (req: Request, res: Response) => {
    const result = await ApplicationService.updateApplicationStatus(getParam(req, "id"), req.body)

    sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Application status updated successfully",
        data: { application: result },
    })
})

const deleteApplication = asyncHandler(async (req: Request, res: Response) => {
    await ApplicationService.deleteApplication(getParam(req, "id"))

    sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Application deleted successfully",
    })
})

export const ApplicationController = {
    createApplication,
    getAllApplications,
    getApplicationById,
    updateApplication,
    updateApplicationStatus,
    deleteApplication,
}
