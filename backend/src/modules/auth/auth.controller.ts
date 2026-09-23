import type { Request, Response } from "express";
import httpStatus from "http-status";
import { AuthService } from "./auth.service";
import sendResponse from "../../utility/sendResponse";
import asyncHandler from "../../utility/asyncHandler";
import AppError from "../../utility/AppError";

type AuthenticatedRequest = Request & {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
};

const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await AuthService.registerUser(req.body);
  sendResponse(res, httpStatus.CREATED, {
    success: true,
    message: "User registered successfully",
    data: result,
  });
});

const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await AuthService.loginUser(req.body);
  sendResponse(res, httpStatus.OK, {
    success: true,
    message: "User logged in successfully",
    data: result,
  });
});

const googleAuth = asyncHandler(async (req: Request, res: Response) => {
  const result = await AuthService.googleAuth(req.body);
  sendResponse(res, httpStatus.OK, {
    success: true,
    message: "Google authentication successful",
    data: result,
  });
});
const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  await AuthService.forgotPassword(req.body);
  sendResponse(res, httpStatus.OK, {
    success: true,
    message: "If the email exists, reset instructions have been sent.",
  });
});

const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  await AuthService.resetPassword(req.body);
  sendResponse(res, httpStatus.OK, {
    success: true,
    message: "Password reset successfully",
  });
});

const changePassword = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user?.userId) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
    }

    await AuthService.changePassword(req.user.userId, req.body);
    sendResponse(res, httpStatus.OK, {
      success: true,
      message: "Password changed successfully",
    });
  },
);

const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const token = req.body.refreshToken;

  if (!token || typeof token !== "string") {
    throw new AppError(httpStatus.BAD_REQUEST, "Refresh token is required");
  }

  const result = await AuthService.refreshToken(token);
  sendResponse(res, httpStatus.OK, {
    success: true,
    message: "Token refreshed successfully",
    data: result,
  });
});

const me = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user?.userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  const result = await AuthService.getCurrentUser(req.user.userId);
  sendResponse(res, httpStatus.OK, {
    success: true,
    message: "Current user fetched successfully",
    data: { user: result },
  });
});

const logout = asyncHandler(async (req: Request, res: Response) => {
  await AuthService.logout();
  sendResponse(res, httpStatus.OK, {
    success: true,
    message: "User logged out successfully",
  });
});

export const AuthController = {
  register,
  login,
  googleAuth,
  forgotPassword,
  resetPassword,
  changePassword,
  refreshToken,
  me,
  logout,
};
