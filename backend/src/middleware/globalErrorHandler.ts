import type { ErrorRequestHandler } from "express";
import httpStatus from "http-status";

const hasStatusCode = (error: unknown): error is Error & { statusCode: number } => {
    return error instanceof Error && "statusCode" in error && typeof error.statusCode === "number";
};

const globalErrorHandler: ErrorRequestHandler = (error, req, res, next) => {

    console.error(`[GlobalErrorHandler] ${req.method} ${req.originalUrl}:`, error)

    const statusCode = hasStatusCode(error)
        ? error.statusCode
        : httpStatus.INTERNAL_SERVER_ERROR;
    const message = error instanceof Error ? error.message : "Something went wrong";

    return res.status(statusCode).json({
        success: false,
        message,
    });
};

export default globalErrorHandler;
