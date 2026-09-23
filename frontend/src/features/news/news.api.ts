import { apiRequest, authApiRequest } from "@/lib/api/client";
import type {
  CreateNewsPayload,
  NewsListQuery,
  NewsListResponse,
  NewsRecord,
  UpdateNewsPayload,
} from "./news.types";

const buildNewsQuery = (query: NewsListQuery = {}) => {
  const params = new URLSearchParams();

  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  if (query.search?.trim()) params.set("search", query.search.trim());
  if (query.category?.trim()) params.set("category", query.category.trim());
  if (query.status && query.status !== "ALL") params.set("status", query.status);

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
};

export const getAdminNews = async (query: NewsListQuery = { limit: 10 }) => {
  return authApiRequest<NewsListResponse>(`/news/admin${buildNewsQuery(query)}`);
};

export const getPublishedNews = async (query: NewsListQuery = { limit: 100 }) => {
  return apiRequest<NewsListResponse>(`/news${buildNewsQuery(query)}`);
};

export const getPublishedNewsBySlug = async (slug: string) => {
  return apiRequest<{ news: NewsRecord }>(`/news/${slug}`);
};

export const getAdminNewsById = async (id: string) => {
  return authApiRequest<{ news: NewsRecord }>(`/news/admin/${id}`);
};

export const createNews = async (payload: CreateNewsPayload) => {
  return authApiRequest<{ news: NewsRecord }>("/news", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const updateNews = async (id: string, payload: UpdateNewsPayload) => {
  return authApiRequest<{ news: NewsRecord }>(`/news/admin/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
};

export const deleteNews = async (id: string) => {
  return authApiRequest(`/news/admin/${id}`, {
    method: "DELETE",
  });
};
