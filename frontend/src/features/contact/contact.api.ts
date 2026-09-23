import { apiRequest, authApiRequest } from "@/lib/api/client";
import type {
  CreateInquiryPayload,
  InquiryListQuery,
  InquiryListResponse,
  InquiryRecord,
  UpdateInquiryPayload,
  UpdateInquiryStatusPayload,
} from "./contact.types";

const buildInquiryQuery = (query: InquiryListQuery = {}) => {
  const params = new URLSearchParams();

  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  if (query.search?.trim()) params.set("search", query.search.trim());
  if (query.status && query.status !== "ALL") params.set("status", query.status);

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
};

export const createInquiry = async (payload: CreateInquiryPayload) => {
  return apiRequest<{ inquiry: InquiryRecord }>("/contact", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const getAdminInquiries = async (query: InquiryListQuery = { limit: 10 }) => {
  return authApiRequest<InquiryListResponse>(`/contact/admin${buildInquiryQuery(query)}`);
};

export const getAdminInquiryById = async (id: string) => {
  return authApiRequest<{ inquiry: InquiryRecord }>(`/contact/admin/${id}`);
};

export const updateInquiry = async (id: string, payload: UpdateInquiryPayload) => {
  return authApiRequest<{ inquiry: InquiryRecord }>(`/contact/admin/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
};

export const updateInquiryStatus = async (id: string, payload: UpdateInquiryStatusPayload) => {
  return authApiRequest<{ inquiry: InquiryRecord }>(`/contact/admin/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
};

export const deleteInquiry = async (id: string) => {
  return authApiRequest(`/contact/admin/${id}`, {
    method: "DELETE",
  });
};
