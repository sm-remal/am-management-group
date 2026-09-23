import type { Request, Response } from "express"
import httpStatus from "http-status"
import AppError from "../../utility/AppError"
import asyncHandler from "../../utility/asyncHandler"
import sendResponse from "../../utility/sendResponse"
import { ProjectService } from "./project.service"

const getParam = (req: Request, key: string) => {
    const value = req.params[key]

    if (!value || Array.isArray(value)) {
        throw new AppError(httpStatus.BAD_REQUEST, `${key} is required`)
    }

    return value
}

const getPublishedProjects = asyncHandler(async (req: Request, res: Response) => {
    const result = await ProjectService.getPublishedProjects(req.query)

    sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Projects fetched successfully",
        data: result,
    })
})

const getFeaturedProjects = asyncHandler(async (req: Request, res: Response) => {
    const result = await ProjectService.getFeaturedProjects(req.query)

    sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Featured projects fetched successfully",
        data: result,
    })
})

const getAdminProjects = asyncHandler(async (req: Request, res: Response) => {
    const result = await ProjectService.getAdminProjects(req.query)

    sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Projects fetched successfully",
        data: result,
    })
})

const getProjectBySlug = asyncHandler(async (req: Request, res: Response) => {
    const result = await ProjectService.getProjectBySlug(getParam(req, "slug"))

    sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Project fetched successfully",
        data: { project: result },
    })
})

const getAdminProjectById = asyncHandler(async (req: Request, res: Response) => {
    const result = await ProjectService.getAdminProjectById(getParam(req, "id"))

    sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Project fetched successfully",
        data: { project: result },
    })
})

const createProject = asyncHandler(async (req: Request, res: Response) => {
    const result = await ProjectService.createProject(req.body)

    sendResponse(res, httpStatus.CREATED, {
        success: true,
        message: "Project created successfully",
        data: { project: result },
    })
})

const updateProject = asyncHandler(async (req: Request, res: Response) => {
    const result = await ProjectService.updateProject(getParam(req, "id"), req.body)

    sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Project updated successfully",
        data: { project: result },
    })
})

const deleteProject = asyncHandler(async (req: Request, res: Response) => {
    await ProjectService.deleteProject(getParam(req, "id"))

    sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Project deleted successfully",
    })
})

const addProjectImage = asyncHandler(async (req: Request, res: Response) => {
    const result = await ProjectService.addProjectImage(getParam(req, "projectId"), req.body)

    sendResponse(res, httpStatus.CREATED, {
        success: true,
        message: "Project image added successfully",
        data: { image: result },
    })
})

const updateProjectImage = asyncHandler(async (req: Request, res: Response) => {
    const result = await ProjectService.updateProjectImage(getParam(req, "imageId"), req.body)

    sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Project image updated successfully",
        data: { image: result },
    })
})

const deleteProjectImage = asyncHandler(async (req: Request, res: Response) => {
    await ProjectService.deleteProjectImage(getParam(req, "imageId"))

    sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Project image deleted successfully",
    })
})

export const ProjectController = {
    getPublishedProjects,
    getFeaturedProjects,
    getAdminProjects,
    getProjectBySlug,
    getAdminProjectById,
    createProject,
    updateProject,
    deleteProject,
    addProjectImage,
    updateProjectImage,
    deleteProjectImage,
}
