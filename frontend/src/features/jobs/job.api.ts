import { apiRequest, authApiRequest } from "@/lib/api/client";
import type {
  CreateJobPayload,
  JobListQuery,
  JobListResponse,
  JobRecord,
  UpdateJobPayload,
} from "./job.types";

const buildJobQuery = (query: JobListQuery = {}) => {
  const params = new URLSearchParams();

  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  if (query.search?.trim()) params.set("search", query.search.trim());
  if (query.companyId) params.set("companyId", query.companyId);
  if (query.companySlug) params.set("companySlug", query.companySlug);
  if (query.employmentType && query.employmentType !== "ALL") {
    params.set("employmentType", query.employmentType);
  }
  if (query.isPublished && query.isPublished !== "ALL") {
    params.set("isPublished", query.isPublished);
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
};

export const getAdminJobs = async (query: JobListQuery = { limit: 10 }) => {
  return authApiRequest<JobListResponse>(`/jobs/admin${buildJobQuery(query)}`);
};

export const getPublishedJobs = async (query: JobListQuery = { limit: 100 }) => {
  return apiRequest<JobListResponse>(`/jobs${buildJobQuery(query)}`);
};

export const getPublishedJobBySlug = async (slug: string) => {
  return apiRequest<{ job: JobRecord }>(`/jobs/${slug}`);
};

export const getAdminJobById = async (id: string) => {
  return authApiRequest<{ job: JobRecord }>(`/jobs/admin/${id}`);
};

export const createJob = async (payload: CreateJobPayload) => {
  return authApiRequest<{ job: JobRecord }>("/jobs", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const updateJob = async (id: string, payload: UpdateJobPayload) => {
  return authApiRequest<{ job: JobRecord }>(`/jobs/admin/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
};

export const deleteJob = async (id: string) => {
  return authApiRequest(`/jobs/admin/${id}`, {
    method: "DELETE",
  });
};
