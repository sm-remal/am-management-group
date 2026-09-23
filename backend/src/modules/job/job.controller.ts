import type { Request, Response } from "express"
import httpStatus from "http-status"
import AppError from "../../utility/AppError"
import asyncHandler from "../../utility/asyncHandler"
import sendResponse from "../../utility/sendResponse"
import { JobService } from "./job.service"

const getParam = (req: Request, key: string) => {
    const value = req.params[key]

    if (!value || Array.isArray(value)) {
        throw new AppError(httpStatus.BAD_REQUEST, `${key} is required`)
    }

    return value
}

const getPublishedJobs = asyncHandler(async (req: Request, res: Response) => {
    const result = await JobService.getPublishedJobs(req.query)

    sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Jobs fetched successfully",
        data: result,
    })
})

const getAdminJobs = asyncHandler(async (req: Request, res: Response) => {
    const result = await JobService.getAdminJobs(req.query)

    sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Jobs fetched successfully",
        data: result,
    })
})

const getJobBySlug = asyncHandler(async (req: Request, res: Response) => {
    const result = await JobService.getJobBySlug(getParam(req, "slug"))

    sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Job fetched successfully",
        data: { job: result },
    })
})

const getAdminJobById = asyncHandler(async (req: Request, res: Response) => {
    const result = await JobService.getAdminJobById(getParam(req, "id"))

    sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Job fetched successfully",
        data: { job: result },
    })
})

const createJob = asyncHandler(async (req: Request, res: Response) => {
    const result = await JobService.createJob(req.body)

    sendResponse(res, httpStatus.CREATED, {
        success: true,
        message: "Job created successfully",
        data: { job: result },
    })
})

const updateJob = asyncHandler(async (req: Request, res: Response) => {
    const result = await JobService.updateJob(getParam(req, "id"), req.body)

    sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Job updated successfully",
        data: { job: result },
    })
})

const deleteJob = asyncHandler(async (req: Request, res: Response) => {
    await JobService.deleteJob(getParam(req, "id"))

    sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Job deleted successfully",
    })
})

export const JobController = {
    getPublishedJobs,
    getAdminJobs,
    getJobBySlug,
    getAdminJobById,
    createJob,
    updateJob,
    deleteJob,
}
