import { apiRequest, authApiRequest } from "@/lib/api/client";
import type {
  CompanyListQuery,
  CompanyListResponse,
  CompanyRecord,
  CreateCompanyPayload,
  UpdateCompanyPayload,
} from "./company.types";

const buildCompanyQuery = (query: CompanyListQuery = {}) => {
  const params = new URLSearchParams();

  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  if (query.search?.trim()) params.set("search", query.search.trim());
  if (query.category && query.category !== "ALL")
    params.set("category", query.category);
  if (query.status && query.status !== "ALL")
    params.set("status", query.status);
  if (query.isMainCompany && query.isMainCompany !== "ALL") {
    params.set("isMainCompany", query.isMainCompany);
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
};

export const getPublishedCompanies = async (
  query: CompanyListQuery = { limit: 100 },
  init?: RequestInit,
) => {
  return apiRequest<CompanyListResponse>(
    `/companies${buildCompanyQuery(query)}`,
    {
      ...init,
      cache: "no-store",
    },
  );
};

export const COMPANY_DATA_UPDATED_EVENT = "company-data-updated";

export const notifyCompanyDataUpdated = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(COMPANY_DATA_UPDATED_EVENT));
  }
};

export const getPublishedCompanyBySlug = async (slug: string) => {
  return apiRequest<{ company: CompanyRecord }>(`/companies/${slug}`);
};

export const getAdminCompanies = async (
  query: CompanyListQuery = { limit: 100 },
) => {
  return authApiRequest<CompanyListResponse>(
    `/companies/admin${buildCompanyQuery(query)}`,
  );
};

export const createCompany = async (payload: CreateCompanyPayload) => {
  return authApiRequest<{ company: CompanyRecord }>("/companies", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const updateCompany = async (
  id: string,
  payload: UpdateCompanyPayload,
) => {
  return authApiRequest<{ company: CompanyRecord }>(`/companies/admin/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
};

export const deleteCompany = async (id: string) => {
  return authApiRequest(`/companies/admin/${id}`, {
    method: "DELETE",
  });
};
