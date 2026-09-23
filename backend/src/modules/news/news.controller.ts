import type { Request, Response } from "express"
import httpStatus from "http-status"
import AppError from "../../utility/AppError"
import asyncHandler from "../../utility/asyncHandler"
import sendResponse from "../../utility/sendResponse"
import { NewsService } from "./news.service"

type AuthenticatedRequest = Request & {
    user?: {
        userId: string
        email: string
        role: string
    }
}

const getParam = (req: Request, key: string) => {
    const value = req.params[key]

    if (!value || Array.isArray(value)) {
        throw new AppError(httpStatus.BAD_REQUEST, `${key} is required`)
    }

    return value
}

const getPublishedNews = asyncHandler(async (req: Request, res: Response) => {
    const result = await NewsService.getPublishedNews(req.query)

    sendResponse(res, httpStatus.OK, {
        success: true,
        message: "News fetched successfully",
        data: result,
    })
})

const getAdminNews = asyncHandler(async (req: Request, res: Response) => {
    const result = await NewsService.getAdminNews(req.query)

    sendResponse(res, httpStatus.OK, {
        success: true,
        message: "News fetched successfully",
        data: result,
    })
})

const getNewsBySlug = asyncHandler(async (req: Request, res: Response) => {
    const result = await NewsService.getNewsBySlug(getParam(req, "slug"))

    sendResponse(res, httpStatus.OK, {
        success: true,
        message: "News fetched successfully",
        data: { news: result },
    })
})

const getAdminNewsById = asyncHandler(async (req: Request, res: Response) => {
    const result = await NewsService.getAdminNewsById(getParam(req, "id"))

    sendResponse(res, httpStatus.OK, {
        success: true,
        message: "News fetched successfully",
        data: { news: result },
    })
})

const createNews = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const payload = {
        ...req.body,
        authorId: req.body.authorId ?? req.user?.userId ?? null,
    }

    const result = await NewsService.createNews(payload)

    sendResponse(res, httpStatus.CREATED, {
        success: true,
        message: "News created successfully",
        data: { news: result },
    })
})

const updateNews = asyncHandler(async (req: Request, res: Response) => {
    const result = await NewsService.updateNews(getParam(req, "id"), req.body)

    sendResponse(res, httpStatus.OK, {
        success: true,
        message: "News updated successfully",
        data: { news: result },
    })
})

const deleteNews = asyncHandler(async (req: Request, res: Response) => {
    await NewsService.deleteNews(getParam(req, "id"))

    sendResponse(res, httpStatus.OK, {
        success: true,
        message: "News deleted successfully",
    })
})

export const NewsController = {
    getPublishedNews,
    getAdminNews,
    getNewsBySlug,
    getAdminNewsById,
    createNews,
    updateNews,
    deleteNews,
}
