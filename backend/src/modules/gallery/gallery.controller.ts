import type { Request, Response } from "express"
import httpStatus from "http-status"
import AppError from "../../utility/AppError"
import asyncHandler from "../../utility/asyncHandler"
import sendResponse from "../../utility/sendResponse"
import { GalleryService } from "./gallery.service"

const getParam = (req: Request, key: string) => {
    const value = req.params[key]

    if (!value || Array.isArray(value)) {
        throw new AppError(httpStatus.BAD_REQUEST, `${key} is required`)
    }

    return value
}

const getPublishedGalleryImages = asyncHandler(async (req: Request, res: Response) => {
    const result = await GalleryService.getPublishedGalleryImages(req.query)

    sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Gallery images fetched successfully",
        data: result,
    })
})

const getAdminGalleryImages = asyncHandler(async (req: Request, res: Response) => {
    const result = await GalleryService.getAdminGalleryImages(req.query)

    sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Gallery images fetched successfully",
        data: result,
    })
})

const getPublishedGalleryImageById = asyncHandler(async (req: Request, res: Response) => {
    const result = await GalleryService.getPublishedGalleryImageById(getParam(req, "id"))

    sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Gallery image fetched successfully",
        data: { galleryImage: result },
    })
})

const getAdminGalleryImageById = asyncHandler(async (req: Request, res: Response) => {
    const result = await GalleryService.getAdminGalleryImageById(getParam(req, "id"))

    sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Gallery image fetched successfully",
        data: { galleryImage: result },
    })
})

const createGalleryImage = asyncHandler(async (req: Request, res: Response) => {
    const result = await GalleryService.createGalleryImage(req.body)

    sendResponse(res, httpStatus.CREATED, {
        success: true,
        message: "Gallery image created successfully",
        data: { galleryImage: result },
    })
})

const updateGalleryImage = asyncHandler(async (req: Request, res: Response) => {
    const result = await GalleryService.updateGalleryImage(getParam(req, "id"), req.body)

    sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Gallery image updated successfully",
        data: { galleryImage: result },
    })
})

const deleteGalleryImage = asyncHandler(async (req: Request, res: Response) => {
    await GalleryService.deleteGalleryImage(getParam(req, "id"))

    sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Gallery image deleted successfully",
    })
})

export const GalleryController = {
    getPublishedGalleryImages,
    getAdminGalleryImages,
    getPublishedGalleryImageById,
    getAdminGalleryImageById,
    createGalleryImage,
    updateGalleryImage,
    deleteGalleryImage,
}
