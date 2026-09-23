import { apiRequest, authApiRequest } from "@/lib/api/client";
import {
  clearAuthSession,
  saveAuthSession,
  type StoredAuthSession,
} from "./auth-session";

type GoogleAuthPayload = {
  credential: string;
};

type ForgotPasswordPayload = {
  email: string;
};

type ResetPasswordPayload = {
  token: string;
  password: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  phone?: string;
};

type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

export const loginUser = async (payload: LoginPayload) => {
  const result = await apiRequest<StoredAuthSession>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (result.data) {
    saveAuthSession(result.data);
  }

  return result;
};

export const registerUser = async (payload: RegisterPayload) => {
  const result = await apiRequest<StoredAuthSession>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (result.data) {
    saveAuthSession(result.data);
  }

  return result;
};

export const logoutUser = async () => {
  try {
    await authApiRequest("/auth/logout", {
      method: "POST",
    });
  } finally {
    clearAuthSession();
  }
};

export const getCurrentUser = async () => {
  return authApiRequest<{ user: unknown }>("/auth/me");
};

export const changePassword = async (payload: ChangePasswordPayload) => {
  return authApiRequest("/auth/change-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const googleAuth = async (payload: GoogleAuthPayload) => {
  const result = await apiRequest<StoredAuthSession>("/auth/google", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (result.data) {
    saveAuthSession(result.data);
  }

  return result;
};

export const forgotPassword = async (payload: ForgotPasswordPayload) => {
  return apiRequest<void>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const resetPassword = async (payload: ResetPasswordPayload) => {
  return apiRequest("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};
