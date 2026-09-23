import { authApiRequest } from "@/lib/api/client";
import type {
  CreateUserPayload,
  UpdateUserPayload,
  UpdateProfilePayload,
  UserListQuery,
  UserListResponse,
  UserRecord,
} from "./user.types";

const buildUserQuery = (query: UserListQuery) => {
  const params = new URLSearchParams();

  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  if (query.search?.trim()) params.set("search", query.search.trim());
  if (query.role && query.role !== "ALL") params.set("role", query.role);
  if (query.isActive && query.isActive !== "ALL") params.set("isActive", query.isActive);

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
};

export const getUsers = async (query: UserListQuery) => {
  return authApiRequest<UserListResponse>(`/users${buildUserQuery(query)}`);
};

export const createUser = async (payload: CreateUserPayload) => {
  return authApiRequest<{ user: UserRecord }>("/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const updateUser = async (id: string, payload: UpdateUserPayload) => {
  return authApiRequest<{ user: UserRecord }>(`/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
};

export const updateUserStatus = async (id: string, isActive: boolean) => {
  return authApiRequest<{ user: UserRecord }>(`/users/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ isActive }),
  });
};

export const deleteUser = async (id: string) => {
  return authApiRequest(`/users/${id}`, {
    method: "DELETE",
  });
};

export const updateMyProfile = async (payload: UpdateProfilePayload) => {
  return authApiRequest<{ user: UserRecord }>("/users/profile/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
};
