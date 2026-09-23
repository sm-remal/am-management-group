-- RenameIndex
ALTER INDEX "applications_jobId_fkey" RENAME TO "idx_applications_jobId";

-- RenameIndex
ALTER INDEX "applications_preferredCompanyId_fkey" RENAME TO "idx_applications_preferredCompanyId";

-- RenameIndex
ALTER INDEX "gallery_companyId_fkey" RENAME TO "idx_gallery_companyId";

-- RenameIndex
ALTER INDEX "news_authorId_fkey" RENAME TO "idx_news_authorId";

-- RenameIndex
ALTER INDEX "project_images_projectId_fkey" RENAME TO "idx_project_images_projectId";

-- RenameIndex
ALTER INDEX "projects_companyId_fkey" RENAME TO "idx_projects_companyId";

-- RenameIndex
ALTER INDEX "social_links_companyId_fkey" RENAME TO "idx_social_links_companyId";

-- RenameIndex
ALTER INDEX "team_members_companyId_fkey" RENAME TO "idx_team_members_companyId";
