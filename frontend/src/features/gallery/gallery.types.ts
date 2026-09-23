import type { CompanyRecord } from "@/features/companies/company.types";

export type GalleryCompanySummary = Pick<
  CompanyRecord,
  "id" | "name" | "slug" | "category" | "logo" | "status"
>;

export type GalleryImageRecord = {
  id: string;
  title: string | null;
  imageUrl: string;
  category: string;
  companyId: string | null;
  displayOrder: number;
  isPublished: boolean;
  createdAt: string;
  company: GalleryCompanySummary | null;
};

export type GalleryListResponse = {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
  galleryImages: GalleryImageRecord[];
};

export type GalleryListQuery = {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  companyId?: string;
  companySlug?: string;
  isPublished?: "true" | "false" | "ALL";
};

export type CreateGalleryImagePayload = {
  title?: string | null;
  imageUrl: string;
  category: string;
  companyId?: string | null;
  displayOrder?: number;
  isPublished?: boolean;
};

export type UpdateGalleryImagePayload = Partial<CreateGalleryImagePayload>;
