import type { Request, Response } from "express"
import httpStatus from "http-status"
import AppError from "../../utility/AppError"
import asyncHandler from "../../utility/asyncHandler"
import sendResponse from "../../utility/sendResponse"
import { SettingService } from "./setting.service"

const getParam = (req: Request, key: string) => {
    const value = req.params[key]

    if (!value || Array.isArray(value)) {
        throw new AppError(httpStatus.BAD_REQUEST, `${key} is required`)
    }

    return value
}

const getAllSettings = asyncHandler(async (req: Request, res: Response) => {
    const result = await SettingService.getAllSettings(req.query)

    sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Settings fetched successfully",
        data: result,
    })
})

const getSettingsMap = asyncHandler(async (req: Request, res: Response) => {
    const result = await SettingService.getSettingsMap()

    sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Settings fetched successfully",
        data: { settings: result },
    })
})

const getSettingByKey = asyncHandler(async (req: Request, res: Response) => {
    const result = await SettingService.getSettingByKey(getParam(req, "key"))

    sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Setting fetched successfully",
        data: { setting: result },
    })
})

const getSettingById = asyncHandler(async (req: Request, res: Response) => {
    const result = await SettingService.getSettingById(getParam(req, "id"))

    sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Setting fetched successfully",
        data: { setting: result },
    })
})

const createSetting = asyncHandler(async (req: Request, res: Response) => {
    const result = await SettingService.createSetting(req.body)

    sendResponse(res, httpStatus.CREATED, {
        success: true,
        message: "Setting created successfully",
        data: { setting: result },
    })
})

const updateSetting = asyncHandler(async (req: Request, res: Response) => {
    const result = await SettingService.updateSetting(getParam(req, "id"), req.body)

    sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Setting updated successfully",
        data: { setting: result },
    })
})

const upsertSettings = asyncHandler(async (req: Request, res: Response) => {
    const result = await SettingService.upsertSettings(req.body)

    sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Settings saved successfully",
        data: { settings: result },
    })
})

const deleteSetting = asyncHandler(async (req: Request, res: Response) => {
    await SettingService.deleteSetting(getParam(req, "id"))

    sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Setting deleted successfully",
    })
})

export const SettingController = {
    getAllSettings,
    getSettingsMap,
    getSettingByKey,
    getSettingById,
    createSetting,
    updateSetting,
    upsertSettings,
    deleteSetting,
}
