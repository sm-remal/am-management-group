export type SettingQuery = {
    page?: string
    limit?: string
    search?: string
    key?: string
}

export type CreateSettingPayload = {
    key: string
    value: string
}

export type UpdateSettingPayload = Partial<CreateSettingPayload>

export type UpsertSettingsPayload = {
    settings: CreateSettingPayload[]
}
