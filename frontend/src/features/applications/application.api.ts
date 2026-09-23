import { apiRequest, authApiRequest } from "@/lib/api/client";
import type {
  ApplicationListQuery,
  ApplicationListResponse,
  ApplicationRecord,
  CreateApplicationPayload,
  UpdateApplicationPayload,
  UpdateApplicationStatusPayload,
} from "./application.types";

const buildApplicationQuery = (query: ApplicationListQuery = {}) => {
  const params = new URLSearchParams();

  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  if (query.search?.trim()) params.set("search", query.search.trim());
  if (query.jobId) params.set("jobId", query.jobId);
  if (query.status && query.status !== "ALL") params.set("status", query.status);
  if (query.preferredCompanyId) params.set("preferredCompanyId", query.preferredCompanyId);

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
};

export const createApplication = async (payload: CreateApplicationPayload) => {
  return apiRequest<{ application: ApplicationRecord }>("/applications", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const getAdminApplications = async (query: ApplicationListQuery = { limit: 10 }) => {
  return authApiRequest<ApplicationListResponse>(`/applications/admin${buildApplicationQuery(query)}`);
};

export const getAdminApplicationById = async (id: string) => {
  return authApiRequest<{ application: ApplicationRecord }>(`/applications/admin/${id}`);
};

export const updateApplication = async (id: string, payload: UpdateApplicationPayload) => {
  return authApiRequest<{ application: ApplicationRecord }>(`/applications/admin/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
};

export const updateApplicationStatus = async (id: string, payload: UpdateApplicationStatusPayload) => {
  return authApiRequest<{ application: ApplicationRecord }>(`/applications/admin/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
};

export const deleteApplication = async (id: string) => {
  return authApiRequest(`/applications/admin/${id}`, {
    method: "DELETE",
  });
};
