export type InquiryStatus = "NEW" | "IN_PROGRESS" | "RESOLVED" | "ARCHIVED";

export type InquiryRecord = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string | null;
  subject: string;
  message: string;
  status: InquiryStatus;
  createdAt: string;
  updatedAt: string;
};

export type InquiryListResponse = {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
  inquiries: InquiryRecord[];
};

export type InquiryListQuery = {
  page?: number;
  limit?: number;
  search?: string;
  status?: InquiryStatus | "ALL";
};

export type CreateInquiryPayload = {
  name: string;
  email: string;
  phone: string;
  company?: string | null;
  subject: string;
  message: string;
};

export type UpdateInquiryPayload = Partial<CreateInquiryPayload> & {
  status?: InquiryStatus;
};

export type UpdateInquiryStatusPayload = {
  status: InquiryStatus;
};
