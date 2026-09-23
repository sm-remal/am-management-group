export type BusinessCategory =
  | "MANAGEMENT_INVESTMENT"
  | "CLEANING_SERVICES"
  | "ENGINEERING_MACHINERY"
  | "PLANTATION_AGRICULTURE"
  | "RETAIL_TRADING"
  | "TRAVEL_TOURISM";

export type PublishStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type CompanyCounts = {
  services: number;
  projects: number;
  jobs: number;
  teamMembers: number;
  galleryImages: number;
  socialLinks: number;
};

export type CompanyRecord = {
  id: string;
  name: string;
  slug: string;
  category: BusinessCategory;
  isMainCompany: boolean;
  shortDescription: string | null;
  description: string | null;
  logo: string | null;
  coverImage: string | null;
  registrationNumber: string | null;
  establishedDate: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  businessHours: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  displayOrder: number;
  status: PublishStatus;
  createdAt: string;
  updatedAt: string;
  _count?: CompanyCounts;
};

export type CompanyListResponse = {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
  companies: CompanyRecord[];
};

export type CompanyListQuery = {
  page?: number;
  limit?: number;
  search?: string;
  category?: BusinessCategory | "ALL";
  status?: PublishStatus | "ALL";
  isMainCompany?: "true" | "false" | "ALL";
};

export type CreateCompanyPayload = {
  name: string;
  slug?: string;
  category: BusinessCategory;
  isMainCompany?: boolean;
  shortDescription?: string | null;
  description?: string | null;
  logo?: string | null;
  coverImage?: string | null;
  registrationNumber?: string | null;
  establishedDate?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  businessHours?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  displayOrder?: number;
  status?: PublishStatus;
};

export type UpdateCompanyPayload = Partial<CreateCompanyPayload>;
