import type { BusinessCategory, CompanyRecord } from "@/features/companies/company.types";

export type ServiceCompanySummary = Pick<
  CompanyRecord,
  "id" | "name" | "slug" | "category" | "logo" | "status"
>;

export type ServiceRecord = {
  id: string;
  companyId: string;
  title: string;
  slug: string;
  description: string | null;
  icon: string | null;
  image: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  company: ServiceCompanySummary;
};

export type ServiceListResponse = {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
  services: ServiceRecord[];
};

export type ServiceListQuery = {
  page?: number;
  limit?: number;
  search?: string;
  companyId?: string;
  companySlug?: string;
  category?: BusinessCategory | "ALL";
  isActive?: "true" | "false" | "ALL";
};

export type CreateServicePayload = {
  companyId: string;
  title: string;
  slug?: string;
  description?: string | null;
  icon?: string | null;
  image?: string | null;
  displayOrder?: number;
  isActive?: boolean;
};

export type UpdateServicePayload = Partial<CreateServicePayload>;
