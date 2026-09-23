export type GalleryQuery = {
    page?: string
    limit?: string
    search?: string
    category?: string
    companyId?: string
    companySlug?: string
    isPublished?: string
}

export type CreateGalleryImagePayload = {
    title?: string | null
    imageUrl: string
    category: string
    companyId?: string | null
    displayOrder?: number
    isPublished?: boolean
}

export type UpdateGalleryImagePayload = Partial<CreateGalleryImagePayload>
