import type { Request, Response } from "express"
import httpStatus from "http-status"
import asyncHandler from "../../utility/asyncHandler"
import sendResponse from "../../utility/sendResponse"
import { DashboardService } from "./dashboard.service"

const getDashboardOverview = asyncHandler(async (req: Request, res: Response) => {
    const result = await DashboardService.getDashboardOverview(req.query)

    sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Dashboard overview fetched successfully",
        data: result,
    })
})

export const DashboardController = {
    getDashboardOverview,
}
