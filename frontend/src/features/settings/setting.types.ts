export type SettingRecord = {
  id: string;
  key: string;
  value: string;
  updatedAt: string;
};

export type SettingListMeta = {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
};

export type SettingListResponse = {
  meta: SettingListMeta;
  settings: SettingRecord[];
};

export type SettingListQuery = {
  page?: number;
  limit?: number;
  search?: string;
  key?: string;
};

export type CreateSettingPayload = {
  key: string;
  value: string;
};

export type UpdateSettingPayload = Partial<CreateSettingPayload>;

export type UpsertSettingsPayload = {
  settings: CreateSettingPayload[];
};
