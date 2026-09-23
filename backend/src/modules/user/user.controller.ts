import type { Request, Response } from "express"
import httpStatus from "http-status"
import AppError from "../../utility/AppError"
import asyncHandler from "../../utility/asyncHandler"
import sendResponse from "../../utility/sendResponse"
import { UserService } from "./user.service"

type AuthenticatedRequest = Request & {
    user?: {
        userId: string
        email: string
        role: string
    }
}

const getParamId = (req: Request) => {
    const id = req.params.id

    if (!id || Array.isArray(id)) {
        throw new AppError(httpStatus.BAD_REQUEST, "User id is required")
    }

    return id
}

const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    const result = await UserService.getAllUsers(req.query)

    sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Users fetched successfully",
        data: result,
    })
})

const getUserById = asyncHandler(async (req: Request, res: Response) => {
    const result = await UserService.getUserById(getParamId(req))

    sendResponse(res, httpStatus.OK, {
        success: true,
        message: "User fetched successfully",
        data: { user: result },
    })
})

const createUser = asyncHandler(async (req: Request, res: Response) => {
    const result = await UserService.createUser(req.body)

    sendResponse(res, httpStatus.CREATED, {
        success: true,
        message: "User created successfully",
        data: { user: result },
    })
})

const updateUser = asyncHandler(async (req: Request, res: Response) => {
    const result = await UserService.updateUser(getParamId(req), req.body)

    sendResponse(res, httpStatus.OK, {
        success: true,
        message: "User updated successfully",
        data: { user: result },
    })
})

const updateMyProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user?.userId) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized")
    }

    const result = await UserService.updateMyProfile(req.user.userId, req.body)

    sendResponse(res, httpStatus.OK, {
        success: true,
        message: "Profile updated successfully",
        data: { user: result },
    })
})

const updateUserStatus = asyncHandler(async (req: Request, res: Response) => {
    const result = await UserService.updateUserStatus(getParamId(req), req.body)

    sendResponse(res, httpStatus.OK, {
        success: true,
        message: "User status updated successfully",
        data: { user: result },
    })
})

const deleteUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user?.userId) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized")
    }

    await UserService.deleteUser(getParamId(req), req.user.userId)

    sendResponse(res, httpStatus.OK, {
        success: true,
        message: "User deleted successfully",
    })
})

export const UserController = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    updateMyProfile,
    updateUserStatus,
    deleteUser,
}
