import type { CompanyRecord } from "@/features/companies/company.types";

export type EmploymentType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP";

export type JobCompanySummary = Pick<CompanyRecord, "id" | "name" | "slug" | "category" | "logo" | "status">;

export type JobRecord = {
  id: string;
  title: string;
  slug: string;
  companyId: string;
  location: string | null;
  employmentType: EmploymentType;
  requirements: string | null;
  description: string | null;
  salaryInfo: string | null;
  deadline: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  company: JobCompanySummary;
  _count?: {
    applications: number;
  };
};

export type JobListResponse = {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
  jobs: JobRecord[];
};

export type JobListQuery = {
  page?: number;
  limit?: number;
  search?: string;
  companyId?: string;
  companySlug?: string;
  employmentType?: EmploymentType | "ALL";
  isPublished?: "true" | "false" | "ALL";
};

export type CreateJobPayload = {
  title: string;
  slug?: string;
  companyId: string;
  location?: string | null;
  employmentType?: EmploymentType;
  requirements?: string | null;
  description?: string | null;
  salaryInfo?: string | null;
  deadline?: string | null;
  isPublished?: boolean;
};

export type UpdateJobPayload = Partial<CreateJobPayload>;
