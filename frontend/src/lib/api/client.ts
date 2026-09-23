import { env } from "@/config/env";
import { clearAuthSession, getStoredAccessToken } from "@/features/auth/auth-session";

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
};

const apiUrl = (path: string) => `${env.apiBaseUrl}${path}`;

const parseApiResponse = async <T>(response: Response) => {
  const result = (await response.json().catch(() => ({
    success: false,
    message: "Invalid server response",
  }))) as ApiResponse<T>;

  if (response.status === 401) {
    clearAuthSession();
  }

  if (!response.ok) {
    const fieldError = result.errors
      ? Object.values(result.errors).flat().filter(Boolean)[0]
      : null;

    throw new Error(fieldError || result.message || "Request failed");
  }

  return result;
};

export const apiRequest = async <T>(path: string, init?: RequestInit) => {
  let response: Response;

  try {
    response = await fetch(apiUrl(path), {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });
  } catch {
    throw new Error(
      `Cannot connect to API server at ${env.apiBaseUrl}. Please make sure the backend is running and CORS is enabled.`
    );
  }

  return parseApiResponse<T>(response);
};

export const authApiRequest = async <T>(path: string, init?: RequestInit) => {
  const token = getStoredAccessToken();

  if (!token) {
    clearAuthSession();
    throw new Error("Session expired. Please login again.");
  }

  return apiRequest<T>(path, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  });
};
