import type { NextFunction, Request, Response } from "express"
import httpStatus from "http-status"
import { AuthService } from "../modules/auth/auth.service"
import AppError from "../utility/AppError"

type AuthenticatedRequest = Request & {
    user?: {
        userId: string
        email: string
        role: string
    }
}

const auth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const authorization = req.headers.authorization

        if (!authorization?.startsWith("Bearer ")) {
            throw new AppError(httpStatus.UNAUTHORIZED, "Authorization token is required")
        }

        const token = authorization.split(" ")[1]

        if (!token) {
            throw new AppError(httpStatus.UNAUTHORIZED, "Authorization token is required")
        }

        const user = await AuthService.verifyAccessToken(token)

        if (!user) {
            throw new AppError(httpStatus.UNAUTHORIZED, "Invalid or expired token")
        }

        req.user = user
        next()
    } catch (error) {
        next(error)
    }
}

export const authorizeRoles = (...roles: string[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new AppError(httpStatus.UNAUTHORIZED, "Unauthorized"))
        }

        if (!roles.includes(req.user.role)) {
            return next(new AppError(httpStatus.FORBIDDEN, "Forbidden"))
        }

        return next()
    }
}

export default auth
