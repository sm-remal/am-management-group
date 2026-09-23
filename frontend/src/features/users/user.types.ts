export type UserRole = "ADMIN" | "USER";

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  role: UserRole;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UserListMeta = {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
};

export type UserListResponse = {
  meta: UserListMeta;
  users: UserRecord[];
};

export type UserListQuery = {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole | "ALL";
  isActive?: "true" | "false" | "ALL";
};

export type CreateUserPayload = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  avatar?: string;
  role?: UserRole;
  isActive?: boolean;
};

export type UpdateUserPayload = {
  name?: string;
  email?: string;
  phone?: string | null;
  avatar?: string | null;
  role?: UserRole;
  isActive?: boolean;
};

export type UpdateProfilePayload = {
  name?: string;
  phone?: string | null;
  avatar?: string | null;
};
