import { randomUUID } from "node:crypto";
import { prisma } from "../../lib/prisma";
import { Prisma } from "../../../generated/prisma/client";
import type {
  AuthTokens,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  GoogleAuthPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
} from "./auth.interface";
import httpStatus from "http-status";
import bcrypt from "bcrypt";
import AppError from "../../utility/AppError";
import sendEmail from "../../utility/sendEmail";
import jwt, { type SignOptions } from "jsonwebtoken";
import config from "../../config";
import { passwordResetEmailTemplate } from "../../utility/emailTemplates";

type TokenPayload = {
  userId: string;
  email: string;
  role: string;
};

type ResetTokenPayload = {
  userId: string;
  purpose: "password-reset";
};

type GoogleTokenInfo = {
  aud?: string;
  email?: string;
  email_verified?: string | boolean;
  name?: string;
  picture?: string;
};

const userSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  avatar: true,
  role: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

const hashPassword = async (password: string) => {
  return bcrypt.hash(password, 10);
};

const getJwtSecret = (secret: string | undefined, name: string) => {
  if (!secret) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `${name} is not configured`,
    );
  }

  return secret;
};

const signToken = (payload: object, secret: string, expiresIn: string) => {
  return jwt.sign(payload, secret, { expiresIn } as SignOptions);
};

const createTokens = (user: TokenPayload): AuthTokens => {
  const accessSecret = getJwtSecret(
    config.jwt_access_secrete,
    "JWT access secret",
  );
  const refreshSecret = getJwtSecret(
    config.jwt_refresh_secrete,
    "JWT refresh secret",
  );

  return {
    accessToken: signToken(
      user,
      accessSecret,
      config.jwt_access_expires_in || "1d",
    ),
    refreshToken: signToken(
      user,
      refreshSecret,
      config.jwt_refresh_expires_in || "7d",
    ),
  };
};

const verifyJwtToken = <T extends object>(token: string, secret: string): T => {
  try {
    const decoded = jwt.verify(token, secret);

    if (!decoded || typeof decoded === "string") {
      throw new AppError(httpStatus.UNAUTHORIZED, "Invalid token");
    }

    return decoded as T;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid or expired token");
  }
};

const verifyGoogleCredential = async (credential: string) => {
  const googleClientId = getJwtSecret(
    config.google_client_id,
    "Google client id",
  );
  const response = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`,
  );

  if (!response.ok) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid Google credential");
  }

  const profile = (await response.json()) as GoogleTokenInfo;
  const isEmailVerified =
    profile.email_verified === true || profile.email_verified === "true";

  if (profile.aud !== googleClientId || !profile.email || !isEmailVerified) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid Google account");
  }

  return {
    email: profile.email.toLowerCase(),
    name: profile.name?.trim() || profile.email.split("@")[0],
    avatar: profile.picture || null,
  };
};

const getActiveUserById = async (userId: string, includePassword = false) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: includePassword ? { ...userSelect, password: true } : userSelect,
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (!user.isActive) {
    throw new AppError(httpStatus.FORBIDDEN, "User account is not active");
  }

  return user;
};

const handleAuthServiceError = (
  error: unknown,
  fallbackMessage: string,
): never => {
  if (error instanceof AppError) {
    throw error;
  }

  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    throw new AppError(
      httpStatus.CONFLICT,
      "An account already exists with this email address",
    );
  }

  throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, fallbackMessage);
};

const registerUser = async (payload: RegisterPayload) => {
  try {
    const { name, email, phone } = payload;
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      throw new AppError(
        httpStatus.CONFLICT,
        "User already exists with this email",
      );
    }

    const hashedPassword = await hashPassword(payload.password);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone ?? null,
      },
      select: userSelect,
    });

    return {
      user,
      ...createTokens({
        userId: user.id,
        email: user.email,
        role: user.role,
      }),
    };
  } catch (error) {
    handleAuthServiceError(
      error,
      "Unable to register user. Please try again later",
    );
  }
};

const loginUser = async (payload: LoginPayload) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (!user) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Invalid email or password");
    }

    if (user.isActive === false) {
      throw new AppError(httpStatus.FORBIDDEN, "User account is not active");
    }

    const isPasswordValid = await bcrypt.compare(
      payload.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Invalid email or password");
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
      select: userSelect,
    });

    return {
      user: updatedUser,
      ...createTokens({
        userId: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
      }),
    };
  } catch (error) {
    handleAuthServiceError(error, "Unable to login. Please try again later");
  }
};

const googleAuth = async (payload: GoogleAuthPayload) => {
  try {
    const profile = await verifyGoogleCredential(payload.credential);
    const existingUser = await prisma.user.findUnique({
      where: { email: profile.email },
      select: userSelect,
    });

    const user = existingUser
      ? await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            lastLoginAt: new Date(),
            avatar: existingUser.avatar ?? profile.avatar,
          },
          select: userSelect,
        })
      : await prisma.user.create({
          data: {
            name: profile.name || "User",
            email: profile.email,
            password: await hashPassword(`google:${randomUUID()}`),
            avatar: profile.avatar,
            role: "USER",
            isActive: true,
            lastLoginAt: new Date(),
          },
          select: userSelect,
        });

    if (!user.isActive) {
      throw new AppError(httpStatus.FORBIDDEN, "User account is not active");
    }

    return {
      user,
      ...createTokens({
        userId: user.id,
        email: user.email,
        role: user.role,
      }),
    };
  } catch (error) {
    handleAuthServiceError(error, "Unable to continue with Google");
  }
};

const getCurrentUser = async (userId: string) => {
  try {
    return await getActiveUserById(userId);
  } catch (error) {
    handleAuthServiceError(error, "Unable to fetch current user");
  }
};

const forgotPassword = async (payload: ForgotPasswordPayload) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: payload.email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      return { resetToken: null, resetLink: null };
    }

    const refreshSecret = getJwtSecret(
      config.jwt_refresh_secrete,
      "JWT refresh secret",
    );

    const resetToken = signToken(
      { userId: user.id, purpose: "password-reset" },
      `${refreshSecret}:${user.password}`,
      "15m",
    );

    const resetLink = config.app_url
      ? `${config.app_url.replace(/\/$/, "")}/reset-password?token=${resetToken}`
      : undefined;

    if (!resetLink) {
      throw new Error("APP_URL is not configured");
    }

    const companyName = config.company_name || "AM Management Group";

    const emailTemplate = passwordResetEmailTemplate({
      companyName,
      resetLink,
      expiresIn: "15 minutes",
      ...(user.name ? { recipientName: user.name } : {}),
      ...(config.support_email ? { supportEmail: config.support_email } : {}),
      ...(config.app_url ? { websiteUrl: config.app_url } : {}),
    });

    await sendEmail({
      to: user.email,
      subject: "Reset Your Password",
      senderName: companyName,
      text: emailTemplate.text,
      html: emailTemplate.html,
      attachments: emailTemplate.attachments,
    });

    return { resetToken: null, resetLink: null };
  } catch (error) {
    handleAuthServiceError(error, "Unable to process forgot password request");
  }
};

const resetPassword = async (payload: ResetPasswordPayload) => {
  try {
    const decoded = jwt.decode(payload.token);

    if (
      !decoded ||
      typeof decoded === "string" ||
      typeof decoded.userId !== "string"
    ) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "Invalid or expired reset token",
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, password: true, isActive: true },
    });

    if (!user || !user.isActive) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "Invalid or expired reset token",
      );
    }

    const refreshSecret = getJwtSecret(
      config.jwt_refresh_secrete,
      "JWT refresh secret",
    );
    const verified = verifyJwtToken<ResetTokenPayload>(
      payload.token,
      `${refreshSecret}:${user.password}`,
    );

    if (verified.purpose !== "password-reset" || verified.userId !== user.id) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "Invalid or expired reset token",
      );
    }

    const hashedPassword = await hashPassword(payload.password);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return null;
  } catch (error) {
    handleAuthServiceError(error, "Unable to reset password");
  }
};

const changePassword = async (
  userId: string,
  payload: ChangePasswordPayload,
) => {
  try {
    if (payload.newPassword !== payload.confirmNewPassword) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "New password and confirm password do not match",
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        password: true,
        isActive: true,
      },
    });

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    if (!user.isActive) {
      throw new AppError(httpStatus.FORBIDDEN, "User account is not active");
    }

    const isPasswordValid = await bcrypt.compare(
      payload.currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "Current password is incorrect",
      );
    }

    const hashedPassword = await hashPassword(payload.newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return null;
  } catch (error) {
    handleAuthServiceError(error, "Unable to change password");
  }
};

const refreshToken = async (token: string) => {
  try {
    const refreshSecret = getJwtSecret(
      config.jwt_refresh_secrete,
      "JWT refresh secret",
    );
    const decoded = verifyJwtToken<TokenPayload>(token, refreshSecret);
    const user = await getActiveUserById(decoded.userId);

    return createTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    handleAuthServiceError(error, "Unable to refresh token");
  }
};

const logout = async () => {
  try {
    return null;
  } catch (error) {
    handleAuthServiceError(error, "Unable to logout");
  }
};

const verifyAccessToken = async (token: string) => {
  try {
    const accessSecret = getJwtSecret(
      config.jwt_access_secrete,
      "JWT access secret",
    );
    const decoded = verifyJwtToken<TokenPayload>(token, accessSecret);
    await getActiveUserById(decoded.userId);
    return decoded;
  } catch (error) {
    handleAuthServiceError(error, "Unable to verify access token");
  }
};

export const AuthService = {
  registerUser,
  loginUser,
  googleAuth,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  changePassword,
  refreshToken,
  logout,
  verifyAccessToken,
};
