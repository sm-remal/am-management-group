import type { BusinessCategory, CompanyRecord, PublishStatus } from "@/features/companies/company.types";

export type ProjectStatus = "UPCOMING" | "ONGOING" | "COMPLETED";

export type ProjectImageRecord = {
  id: string;
  projectId: string;
  imageUrl: string;
  caption: string | null;
  order: number;
  createdAt: string;
};

export type ProjectRecord = {
  id: string;
  name: string;
  slug: string;
  companyId: string;
  category: BusinessCategory;
  location: string | null;
  clientName: string | null;
  description: string | null;
  scope: string | null;
  highlights: string | null;
  startDate: string | null;
  endDate: string | null;
  status: ProjectStatus;
  featured: boolean;
  coverImage: string | null;
  publishStatus: PublishStatus;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  company: Pick<CompanyRecord, "id" | "name" | "slug" | "category" | "logo" | "status">;
  images: ProjectImageRecord[];
};

export type ProjectListResponse = {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
  projects: ProjectRecord[];
};

export type ProjectListQuery = {
  page?: number;
  limit?: number;
  search?: string;
  companyId?: string;
  category?: BusinessCategory | "ALL";
  status?: ProjectStatus | "ALL";
  publishStatus?: PublishStatus | "ALL";
  featured?: "true" | "false" | "ALL";
};

export type CreateProjectPayload = {
  name: string;
  slug?: string;
  companyId: string;
  category: BusinessCategory;
  location?: string | null;
  clientName?: string | null;
  description?: string | null;
  scope?: string | null;
  highlights?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  status?: ProjectStatus;
  featured?: boolean;
  coverImage?: string | null;
  publishStatus?: PublishStatus;
  displayOrder?: number;
  images?: CreateProjectImagePayload[];
};

export type UpdateProjectPayload = Partial<Omit<CreateProjectPayload, "images">>;

export type CreateProjectImagePayload = {
  imageUrl: string;
  caption?: string | null;
  order?: number;
};

export type UpdateProjectImagePayload = Partial<CreateProjectImagePayload>;
