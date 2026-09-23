export type ApplicationStatus = "PENDING" | "REVIEWED" | "SHORTLISTED" | "REJECTED" | "HIRED";

export type ApplicationJobSummary = {
  id: string;
  title: string;
  slug: string;
  location: string | null;
  employmentType: string;
  isPublished: boolean;
  company: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
  };
};

export type ApplicationCompanySummary = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
};

export type ApplicationRecord = {
  id: string;
  jobId: string;
  fullName: string;
  email: string;
  phone: string;
  preferredCompanyId: string | null;
  cvUrl: string;
  coverMessage: string | null;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
  job: ApplicationJobSummary;
  preferredCompany: ApplicationCompanySummary | null;
};

export type ApplicationListResponse = {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
  applications: ApplicationRecord[];
};

export type ApplicationListQuery = {
  page?: number;
  limit?: number;
  search?: string;
  jobId?: string;
  status?: ApplicationStatus | "ALL";
  preferredCompanyId?: string;
};

export type CreateApplicationPayload = {
  jobId: string;
  fullName: string;
  email: string;
  phone: string;
  preferredCompanyId?: string | null;
  cvUrl: string;
  coverMessage?: string | null;
};

export type UpdateApplicationPayload = Partial<CreateApplicationPayload> & {
  status?: ApplicationStatus;
};

export type UpdateApplicationStatusPayload = {
  status: ApplicationStatus;
};
