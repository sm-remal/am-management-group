import { apiRequest, authApiRequest } from "@/lib/api/client";
import type {
  CreateGalleryImagePayload,
  GalleryImageRecord,
  GalleryListQuery,
  GalleryListResponse,
  UpdateGalleryImagePayload,
} from "./gallery.types";

const buildGalleryQuery = (query: GalleryListQuery = {}) => {
  const params = new URLSearchParams();

  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  if (query.search?.trim()) params.set("search", query.search.trim());
  if (query.category?.trim()) params.set("category", query.category.trim());
  if (query.companyId) params.set("companyId", query.companyId);
  if (query.companySlug) params.set("companySlug", query.companySlug);
  if (query.isPublished && query.isPublished !== "ALL") {
    params.set("isPublished", query.isPublished);
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
};

export const getAdminGalleryImages = async (query: GalleryListQuery = { limit: 10 }) => {
  return authApiRequest<GalleryListResponse>(`/gallery/admin${buildGalleryQuery(query)}`);
};

export const getPublishedGalleryImages = async (query: GalleryListQuery = { limit: 100 }) => {
  return apiRequest<GalleryListResponse>(`/gallery${buildGalleryQuery(query)}`);
};

export const getPublishedGalleryImageById = async (id: string) => {
  return apiRequest<{ galleryImage: GalleryImageRecord }>(`/gallery/${id}`);
};

export const getAdminGalleryImageById = async (id: string) => {
  return authApiRequest<{ galleryImage: GalleryImageRecord }>(`/gallery/admin/${id}`);
};

export const createGalleryImage = async (payload: CreateGalleryImagePayload) => {
  return authApiRequest<{ galleryImage: GalleryImageRecord }>("/gallery", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const updateGalleryImage = async (id: string, payload: UpdateGalleryImagePayload) => {
  return authApiRequest<{ galleryImage: GalleryImageRecord }>(`/gallery/admin/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
};

export const deleteGalleryImage = async (id: string) => {
  return authApiRequest(`/gallery/admin/${id}`, {
    method: "DELETE",
  });
};
