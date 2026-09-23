import { authApiRequest } from "@/lib/api/client";
import type {
  CreateSettingPayload,
  SettingListQuery,
  SettingListResponse,
  SettingRecord,
  UpdateSettingPayload,
  UpsertSettingsPayload,
} from "./setting.types";

const buildSettingQuery = (query: SettingListQuery) => {
  const params = new URLSearchParams();

  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  if (query.search?.trim()) params.set("search", query.search.trim());
  if (query.key?.trim()) params.set("key", query.key.trim());

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
};

export const getSettings = async (query: SettingListQuery) => {
  return authApiRequest<SettingListResponse>(`/settings/admin${buildSettingQuery(query)}`);
};

export const createSetting = async (payload: CreateSettingPayload) => {
  return authApiRequest<{ setting: SettingRecord }>("/settings", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const updateSetting = async (id: string, payload: UpdateSettingPayload) => {
  return authApiRequest<{ setting: SettingRecord }>(`/settings/admin/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
};

export const upsertSettings = async (payload: UpsertSettingsPayload) => {
  return authApiRequest<{ settings: SettingRecord[] }>("/settings/admin/bulk", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
};

export const deleteSetting = async (id: string) => {
  return authApiRequest(`/settings/admin/${id}`, {
    method: "DELETE",
  });
};
