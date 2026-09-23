import { apiRequest, authApiRequest } from "@/lib/api/client";
import type {
  CreateProjectPayload,
  ProjectListQuery,
  ProjectListResponse,
  ProjectRecord,
  CreateProjectImagePayload,
  ProjectImageRecord,
  UpdateProjectImagePayload,
  UpdateProjectPayload,
} from "./project.types";

const buildProjectQuery = (query: ProjectListQuery) => {
  const params = new URLSearchParams();

  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  if (query.search?.trim()) params.set("search", query.search.trim());
  if (query.companyId) params.set("companyId", query.companyId);
  if (query.category && query.category !== "ALL") params.set("category", query.category);
  if (query.status && query.status !== "ALL") params.set("status", query.status);
  if (query.publishStatus && query.publishStatus !== "ALL") params.set("publishStatus", query.publishStatus);
  if (query.featured && query.featured !== "ALL") params.set("featured", query.featured);

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
};

export const getAdminProjects = async (query: ProjectListQuery) => {
  return authApiRequest<ProjectListResponse>(`/projects/admin${buildProjectQuery(query)}`);
};

export const getPublishedProjects = async (query: ProjectListQuery = { limit: 100 }) => {
  return apiRequest<ProjectListResponse>(`/projects${buildProjectQuery(query)}`);
};

export const getPublishedProjectBySlug = async (slug: string) => {
  return apiRequest<{ project: ProjectRecord }>(`/projects/${slug}`);
};

export const createProject = async (payload: CreateProjectPayload) => {
  return authApiRequest<{ project: ProjectRecord }>("/projects", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const updateProject = async (id: string, payload: UpdateProjectPayload) => {
  return authApiRequest<{ project: ProjectRecord }>(`/projects/admin/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
};

export const deleteProject = async (id: string) => {
  return authApiRequest(`/projects/admin/${id}`, {
    method: "DELETE",
  });
};

export const addProjectImage = async (projectId: string, payload: CreateProjectImagePayload) => {
  return authApiRequest<{ image: ProjectImageRecord }>(`/projects/admin/${projectId}/images`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const updateProjectImage = async (imageId: string, payload: UpdateProjectImagePayload) => {
  return authApiRequest<{ image: ProjectImageRecord }>(`/projects/admin/images/${imageId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
};

export const deleteProjectImage = async (imageId: string) => {
  return authApiRequest(`/projects/admin/images/${imageId}`, {
    method: "DELETE",
  });
};
