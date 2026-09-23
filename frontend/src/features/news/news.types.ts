export type PublishStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type NewsAuthor = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
};

export type NewsRecord = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  category: string | null;
  authorId: string | null;
  status: PublishStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author: NewsAuthor | null;
};

export type NewsListResponse = {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
  news: NewsRecord[];
};

export type NewsListQuery = {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: PublishStatus | "ALL";
};

export type CreateNewsPayload = {
  title: string;
  slug?: string;
  excerpt?: string | null;
  content: string;
  coverImage?: string | null;
  category?: string | null;
  authorId?: string | null;
  status?: PublishStatus;
  publishedAt?: string | null;
};

export type UpdateNewsPayload = Partial<CreateNewsPayload>;
