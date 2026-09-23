import { apiRequest, authApiRequest } from "@/lib/api/client";
import type {
  CreateServicePayload,
  ServiceListQuery,
  ServiceListResponse,
  ServiceRecord,
  UpdateServicePayload,
} from "./service.types";

const buildServiceQuery = (query: ServiceListQuery = {}) => {
  const params = new URLSearchParams();

  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  if (query.search?.trim()) params.set("search", query.search.trim());
  if (query.companyId) params.set("companyId", query.companyId);
  if (query.companySlug) params.set("companySlug", query.companySlug);
  if (query.category && query.category !== "ALL") params.set("category", query.category);
  if (query.isActive && query.isActive !== "ALL") params.set("isActive", query.isActive);

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
};

export const getAdminServices = async (query: ServiceListQuery = { limit: 10 }) => {
  return authApiRequest<ServiceListResponse>(`/services/admin${buildServiceQuery(query)}`);
};

export const getPublishedServices = async (query: ServiceListQuery = { limit: 100 }) => {
  return apiRequest<ServiceListResponse>(`/services${buildServiceQuery(query)}`);
};

export const getPublishedServiceByCompanyAndSlug = async (companySlug: string, slug: string) => {
  return apiRequest<{ service: ServiceRecord }>(`/services/${companySlug}/${slug}`);
};

export const getAdminServiceById = async (id: string) => {
  return authApiRequest<{ service: ServiceRecord }>(`/services/admin/${id}`);
};

export const createService = async (payload: CreateServicePayload) => {
  return authApiRequest<{ service: ServiceRecord }>("/services", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const updateService = async (id: string, payload: UpdateServicePayload) => {
  return authApiRequest<{ service: ServiceRecord }>(`/services/admin/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
};

export const deleteService = async (id: string) => {
  return authApiRequest(`/services/admin/${id}`, {
    method: "DELETE",
  });
};
