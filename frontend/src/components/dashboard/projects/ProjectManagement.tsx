"use client";

import Link from "next/link";
import {
  AlertCircle,
  BriefcaseBusiness,
  CheckCircle2,
  FolderKanban,
  ImagePlus,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Star,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { BsFillSendFill } from "react-icons/bs";
import { FaEdit, FaPauseCircle, FaTrashAlt } from "react-icons/fa";
import { HiDocumentCheck } from "react-icons/hi2";
import { IoEyeSharp, IoSettingsSharp } from "react-icons/io5";
import { MdCheckBox } from "react-icons/md";
import Pagination from "@/components/common/Pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SafeProjectImage from "@/components/ProjectsPage/SafeProjectImage";
import { getAdminCompanies } from "@/features/companies/company.api";
import type {
  BusinessCategory,
  CompanyRecord,
  PublishStatus,
} from "@/features/companies/company.types";
import { isLikelyDirectImageUrl } from "@/features/projects/project-display";
import {
  addProjectImage,
  createProject,
  deleteProjectImage,
  deleteProject,
  getAdminProjects,
  updateProjectImage,
  updateProject,
} from "@/features/projects/project.api";
import type {
  CreateProjectPayload,
  ProjectRecord,
  ProjectStatus,
  UpdateProjectPayload,
} from "@/features/projects/project.types";
import { cn } from "@/lib/utils";

type ProjectFormState = {
  id: string | null;
  name: string;
  slug: string;
  companyId: string;
  category: BusinessCategory;
  location: string;
  clientName: string;
  description: string;
  scope: string;
  highlights: string;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  publishStatus: PublishStatus;
  featured: boolean;
  coverImage: string;
  displayOrder: string;
  galleryImages: ProjectGalleryImageFormState[];
};

type ProjectGalleryImageFormState = {
  id: string | null;
  imageUrl: string;
  caption: string;
  order: string;
  isDeleted: boolean;
};

type ProjectListMeta = {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
};

const businessCategories: Array<{ value: BusinessCategory; label: string }> = [
  { value: "MANAGEMENT_INVESTMENT", label: "Management & Investment" },
  { value: "CLEANING_SERVICES", label: "Cleaning Services" },
  { value: "ENGINEERING_MACHINERY", label: "Engineering & Machinery" },
  { value: "PLANTATION_AGRICULTURE", label: "Plantation & Agriculture" },
  { value: "RETAIL_TRADING", label: "Retail & Trading" },
  { value: "TRAVEL_TOURISM", label: "Travel & Tourism" },
];

const projectStatuses: Array<{ value: ProjectStatus; label: string }> = [
  { value: "UPCOMING", label: "Upcoming" },
  { value: "ONGOING", label: "Ongoing" },
  { value: "COMPLETED", label: "Completed" },
];

const publishStatuses: Array<{ value: PublishStatus; label: string }> = [
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
  { value: "ARCHIVED", label: "Archived" },
];

const initialFormState: ProjectFormState = {
  id: null,
  name: "",
  slug: "",
  companyId: "",
  category: "MANAGEMENT_INVESTMENT",
  location: "",
  clientName: "",
  description: "",
  scope: "",
  highlights: "",
  startDate: "",
  endDate: "",
  status: "UPCOMING",
  publishStatus: "DRAFT",
  featured: false,
  coverImage: "",
  displayOrder: "0",
  galleryImages: [],
};

const selectClassName =
  "h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const nullableText = (value: string) => value.trim() || null;
const optionalText = (value: string) => value.trim() || undefined;

const formatDate = (value: string | null) => {
  if (!value) return "Not set";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
};

const toDateInputValue = (value: string | null) => {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
};

const getCategoryLabel = (value: BusinessCategory) => {
  return (
    businessCategories.find((category) => category.value === value)?.label ??
    value
  );
};

const ProjectManagement = () => {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [companies, setCompanies] = useState<CompanyRecord[]>([]);
  const [meta, setMeta] = useState<ProjectListMeta | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<BusinessCategory | "ALL">("ALL");
  const [status, setStatus] = useState<ProjectStatus | "ALL">("ALL");
  const [publishStatus, setPublishStatus] = useState<PublishStatus | "ALL">(
    "ALL",
  );
  const [featured, setFeatured] = useState<"true" | "false" | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [formState, setFormState] =
    useState<ProjectFormState>(initialFormState);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionProjectId, setActionProjectId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isEditing = Boolean(formState.id);

  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [projectResult, companyResult] = await Promise.all([
        getAdminProjects({
          page,
          limit: 10,
          search,
          category,
          status,
          publishStatus,
          featured,
        }),
        getAdminCompanies(),
      ]);

      setProjects(projectResult.data?.projects ?? []);
      setMeta(projectResult.data?.meta ?? null);
      setCompanies(companyResult.data?.companies ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load projects");
    } finally {
      setIsLoading(false);
    }
  }, [category, featured, page, publishStatus, search, status]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadProjects();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadProjects]);

  const totals = useMemo(() => {
    return projects.reduce(
      (acc, project) => {
        if (project.publishStatus === "PUBLISHED") acc.published += 1;
        if (project.status === "ONGOING") acc.ongoing += 1;
        if (project.featured) acc.featured += 1;
        return acc;
      },
      { published: 0, ongoing: 0, featured: 0 },
    );
  }, [projects]);

  const resetForm = () => {
    setFormState(initialFormState);
    setFormError(null);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    resetForm();
  };

  const openCreateForm = () => {
    setFormState({
      ...initialFormState,
      companyId: companies[0]?.id ?? "",
      category: companies[0]?.category ?? "MANAGEMENT_INVESTMENT",
    });
    setFormError(null);
    setSuccess(null);
    setIsFormOpen(true);
  };

  const handleEdit = (project: ProjectRecord) => {
    setFormState({
      id: project.id,
      name: project.name,
      slug: project.slug,
      companyId: project.companyId,
      category: project.category,
      location: project.location ?? "",
      clientName: project.clientName ?? "",
      description: project.description ?? "",
      scope: project.scope ?? "",
      highlights: project.highlights ?? "",
      startDate: toDateInputValue(project.startDate),
      endDate: toDateInputValue(project.endDate),
      status: project.status,
      publishStatus: project.publishStatus,
      featured: project.featured,
      coverImage: project.coverImage ?? "",
      displayOrder: String(project.displayOrder),
      galleryImages: project.images.map((image) => ({
        id: image.id,
        imageUrl: image.imageUrl,
        caption: image.caption ?? "",
        order: String(image.order),
        isDeleted: false,
      })),
    });
    setFormError(null);
    setSuccess(null);
    setIsFormOpen(true);
  };

  const validateForm = () => {
    if (!formState.name.trim()) return "Project name is required";
    if (!formState.companyId) return "Company is required";
    if (
      formState.coverImage.trim() &&
      !/^https?:\/\//.test(formState.coverImage.trim())
    ) {
      return "Cover image must be a valid URL";
    }
    if (!isLikelyDirectImageUrl(formState.coverImage)) {
      return "Cover image must be a direct image URL. Pinterest page links are not image files.";
    }
    const invalidGalleryImage = formState.galleryImages.find(
      (image) =>
        !image.isDeleted &&
        image.imageUrl.trim() &&
        !isLikelyDirectImageUrl(image.imageUrl),
    );
    if (invalidGalleryImage) {
      return `Gallery image "${invalidGalleryImage.imageUrl}" must be a direct image URL.`;
    }
    if (
      formState.startDate &&
      formState.endDate &&
      formState.endDate < formState.startDate
    ) {
      return "End date must be after start date";
    }

    return null;
  };

  const buildPayload = (): CreateProjectPayload => ({
    name: formState.name.trim(),
    slug: optionalText(formState.slug),
    companyId: formState.companyId,
    category: formState.category,
    location: nullableText(formState.location),
    clientName: nullableText(formState.clientName),
    description: nullableText(formState.description),
    scope: nullableText(formState.scope),
    highlights: nullableText(formState.highlights),
    startDate: formState.startDate || null,
    endDate: formState.endDate || null,
    status: formState.status,
    publishStatus: formState.publishStatus,
    featured: formState.featured,
    coverImage: nullableText(formState.coverImage),
    displayOrder: Number(formState.displayOrder) || 0,
    images: formState.galleryImages
      .filter((image) => !image.isDeleted && image.imageUrl.trim())
      .map((image, index) => ({
        imageUrl: image.imageUrl.trim(),
        caption: nullableText(image.caption),
        order: Number(image.order) || index,
      })),
  });

  const syncProjectImages = async (projectId: string) => {
    await Promise.all(
      formState.galleryImages.map((image, index) => {
        if (image.id && image.isDeleted) {
          return deleteProjectImage(image.id);
        }

        if (image.isDeleted || !image.imageUrl.trim()) {
          return Promise.resolve();
        }

        const payload = {
          imageUrl: image.imageUrl.trim(),
          caption: nullableText(image.caption),
          order: Number(image.order) || index,
        };

        if (image.id) {
          return updateProjectImage(image.id, payload);
        }

        return addProjectImage(projectId, payload);
      }),
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validateForm();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    setError(null);
    setSuccess(null);

    try {
      if (isEditing && formState.id) {
        const { images: _images, ...payload } = buildPayload();
        void _images;
        await updateProject(formState.id, payload as UpdateProjectPayload);
        await syncProjectImages(formState.id);
        setSuccess("Project updated successfully");
      } else {
        await createProject(buildPayload());
        setSuccess("Project created successfully");
      }

      closeForm();
      await loadProjects();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Unable to save project",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublishStatus = async (
    project: ProjectRecord,
    nextStatus: PublishStatus,
  ) => {
    setActionProjectId(project.id);
    setError(null);
    setSuccess(null);

    try {
      await updateProject(project.id, { publishStatus: nextStatus });
      setSuccess(
        nextStatus === "PUBLISHED"
          ? "Project published successfully"
          : nextStatus === "ARCHIVED"
            ? "Project archived successfully"
            : "Project unpublished successfully",
      );
      await loadProjects();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update publish status",
      );
    } finally {
      setActionProjectId(null);
    }
  };

  const handleDelete = async (project: ProjectRecord) => {
    const confirmed = window.confirm(
      `Delete "${project.name}"? This action cannot be undone.`,
    );
    if (!confirmed) return;

    setActionProjectId(project.id);
    setError(null);
    setSuccess(null);

    try {
      await deleteProject(project.id);
      setSuccess("Project deleted successfully");
      await loadProjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete project");
    } finally {
      setActionProjectId(null);
    }
  };

  const handleCompanyChange = (companyId: string) => {
    const selectedCompany = companies.find(
      (company) => company.id === companyId,
    );
    setFormState((current) => ({
      ...current,
      companyId,
      category: selectedCompany?.category ?? current.category,
    }));
  };

  const addGalleryImageRow = () => {
    setFormState((current) => ({
      ...current,
      galleryImages: [
        ...current.galleryImages,
        {
          id: null,
          imageUrl: "",
          caption: "",
          order: String(current.galleryImages.length),
          isDeleted: false,
        },
      ],
    }));
  };

  const updateGalleryImageRow = (
    index: number,
    key: keyof Pick<
      ProjectGalleryImageFormState,
      "imageUrl" | "caption" | "order"
    >,
    value: string,
  ) => {
    setFormState((current) => ({
      ...current,
      galleryImages: current.galleryImages.map((image, imageIndex) =>
        imageIndex === index ? { ...image, [key]: value } : image,
      ),
    }));
  };

  const removeGalleryImageRow = (index: number) => {
    setFormState((current) => ({
      ...current,
      galleryImages: current.galleryImages
        .map((image, imageIndex) =>
          imageIndex === index
            ? image.id
              ? { ...image, isDeleted: true }
              : null
            : image,
        )
        .filter((image): image is ProjectGalleryImageFormState =>
          Boolean(image),
        ),
    }));
  };

  const totalPages = meta?.totalPage || 1;
  const coverImageValue = formState.coverImage.trim();
  const hasInvalidCoverImage =
    Boolean(coverImageValue) && !isLikelyDirectImageUrl(coverImageValue);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#fb731f]">
            Project Management
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-normal text-slate-950 md:text-3xl">
            Dashboard projects
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Manage company projects, publishing state, project timeline,
            featured visibility and public project content.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={loadProjects}
            disabled={isLoading}
          >
            <RefreshCw className={cn("size-4", isLoading && "animate-spin")} />
            Refresh
          </Button>
          <Button type="button" onClick={openCreateForm}>
            <Plus className="size-4" />
            Create Project
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Total projects</p>
            <FolderKanban className="size-5 text-[#234279]" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-950">
            {meta?.total ?? projects.length}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Published on page
            </p>
            <HiDocumentCheck className="size-5 text-emerald-600" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-950">
            {totals.published}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Ongoing on page
            </p>
            <BriefcaseBusiness className="size-5 text-blue-600" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-950">
            {totals.ongoing}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Featured on page
            </p>
            <Star className="size-5 text-[#fb731f]" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-950">
            {totals.featured}
          </p>
        </div>
      </section>

      {(error || success) && (
        <section
          className={cn(
            "flex items-start gap-2 rounded-lg border p-3 text-sm",
            error
              ? "border-rose-200 bg-rose-50 text-rose-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700",
          )}
        >
          {error ? (
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
          ) : (
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          )}
          <p>{error || success}</p>
        </section>
      )}

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-3 border-b border-slate-200 p-4 xl:grid-cols-[minmax(0,1fr)_11rem_11rem_11rem_9rem]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search project, company, location or client"
              className="h-10 pl-9"
            />
          </div>

          <select
            value={category}
            onChange={(event) => {
              setCategory(event.target.value as BusinessCategory | "ALL");
              setPage(1);
            }}
            className={selectClassName}
            aria-label="Filter by category"
          >
            <option value="ALL">All categories</option>
            {businessCategories.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as ProjectStatus | "ALL");
              setPage(1);
            }}
            className={selectClassName}
            aria-label="Filter by project status"
          >
            <option value="ALL">All progress</option>
            {projectStatuses.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <select
            value={publishStatus}
            onChange={(event) => {
              setPublishStatus(event.target.value as PublishStatus | "ALL");
              setPage(1);
            }}
            className={selectClassName}
            aria-label="Filter by publish status"
          >
            <option value="ALL">All publish</option>
            {publishStatuses.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <select
            value={featured}
            onChange={(event) => {
              setFeatured(event.target.value as "true" | "false" | "ALL");
              setPage(1);
            }}
            className={selectClassName}
            aria-label="Filter by featured status"
          >
            <option value="ALL">All featured</option>
            <option value="true">Featured</option>
            <option value="false">Regular</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Project</th>
                <th className="px-4 py-3 font-semibold">Company</th>
                <th className="px-4 py-3 font-semibold">Progress</th>
                <th className="px-4 py-3 font-semibold">Publish</th>
                <th className="px-4 py-3 font-semibold">Timeline</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-slate-500"
                  >
                    <Loader2 className="mx-auto mb-3 size-6 animate-spin text-[#234279]" />
                    Loading projects...
                  </td>
                </tr>
              ) : projects.length ? (
                projects.map((project) => (
                  <tr key={project.id} className="align-middle">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-slate-100 bg-cover bg-center text-slate-400"
                          style={
                            project.coverImage
                              ? {
                                  backgroundImage: `url(${project.coverImage})`,
                                }
                              : undefined
                          }
                        >
                          {!project.coverImage && (
                            <FolderKanban className="size-5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-950">
                            {project.name}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            {project.location || "No location"}
                          </p>
                          <p className="truncate text-xs text-slate-400">
                            {getCategoryLabel(project.category)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-slate-900">
                        {project.company.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {project.clientName || "No client"}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                        {project.status}
                      </span>
                      {project.featured && (
                        <span className="ml-2 rounded-full bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-700">
                          Featured
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={cn(
                          "rounded-full px-2 py-1 text-xs font-semibold",
                          project.publishStatus === "PUBLISHED"
                            ? "bg-emerald-50 text-emerald-700"
                            : project.publishStatus === "ARCHIVED"
                              ? "bg-slate-100 text-slate-600"
                              : "bg-amber-50 text-amber-700",
                        )}
                      >
                        {project.publishStatus}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-500">
                      <p>{formatDate(project.startDate)}</p>
                      <p className="text-xs">{formatDate(project.endDate)}</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/projects/${project.slug}`}
                          target="_blank"
                          className="inline-flex size-7 items-center justify-center rounded-lg border border-border bg-background text-sm font-medium text-foreground shadow-xs transition-all hover:bg-muted"
                          aria-label={`View ${project.name}`}
                        >
                          <IoEyeSharp className="size-4" />
                        </Link>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          onClick={() => handleEdit(project)}
                          aria-label="Edit project"
                        >
                          <FaEdit className="size-3.5" />
                        </Button>
                        {project.publishStatus === "PUBLISHED" ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            disabled={actionProjectId === project.id}
                            onClick={() =>
                              void handlePublishStatus(project, "DRAFT")
                            }
                            aria-label="Unpublish project"
                          >
                            <FaPauseCircle className="size-3.5" />
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            disabled={actionProjectId === project.id}
                            onClick={() =>
                              void handlePublishStatus(project, "PUBLISHED")
                            }
                            aria-label="Publish project"
                          >
                            <MdCheckBox className="size-4" />
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          disabled={actionProjectId === project.id}
                          onClick={() =>
                            void handlePublishStatus(project, "ARCHIVED")
                          }
                          aria-label="Archive project"
                        >
                          <IoSettingsSharp className="size-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon-sm"
                          disabled={actionProjectId === project.id}
                          onClick={() => void handleDelete(project)}
                          aria-label="Delete project"
                        >
                          <FaTrashAlt className="size-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-slate-500"
                  >
                    No projects found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={meta?.page ?? page}
          totalPages={totalPages}
          total={meta?.total}
          onPageChange={(nextPage) => {
            if (!isLoading) setPage(nextPage);
          }}
        />
      </section>

      {isFormOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 px-4 py-8 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-form-title"
          onMouseDown={closeForm}
        >
          <form
            onSubmit={(event) => void handleSubmit(event)}
            className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg border border-slate-200 bg-white p-5 shadow-xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2
                  id="project-form-title"
                  className="text-base font-bold text-slate-950"
                >
                  {isEditing ? "Edit project" : "Create project"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {isEditing
                    ? "Update project content and publishing controls."
                    : "Add a new company project."}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={closeForm}
                aria-label="Close project form"
              >
                <X className="size-4" />
              </Button>
            </div>

            {formError && (
              <div className="mb-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <p>{formError}</p>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="project-name"
                  className="mb-1.5 block text-xs font-bold text-slate-700"
                >
                  Project Name
                </label>
                <Input
                  id="project-name"
                  value={formState.name}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Project name"
                  className="h-10"
                />
              </div>

              <div>
                <label
                  htmlFor="project-slug"
                  className="mb-1.5 block text-xs font-bold text-slate-700"
                >
                  Slug
                </label>
                <Input
                  id="project-slug"
                  value={formState.slug}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      slug: event.target.value,
                    }))
                  }
                  placeholder="auto-generated-if-empty"
                  className="h-10"
                />
              </div>

              <div>
                <label
                  htmlFor="project-company"
                  className="mb-1.5 block text-xs font-bold text-slate-700"
                >
                  Company
                </label>
                <select
                  id="project-company"
                  value={formState.companyId}
                  onChange={(event) => handleCompanyChange(event.target.value)}
                  className={cn(selectClassName, "w-full")}
                >
                  <option value="">Select company</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="project-category"
                  className="mb-1.5 block text-xs font-bold text-slate-700"
                >
                  Category
                </label>
                <select
                  id="project-category"
                  value={formState.category}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      category: event.target.value as BusinessCategory,
                    }))
                  }
                  className={cn(selectClassName, "w-full")}
                >
                  {businessCategories.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="project-location"
                  className="mb-1.5 block text-xs font-bold text-slate-700"
                >
                  Location
                </label>
                <Input
                  id="project-location"
                  value={formState.location}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      location: event.target.value,
                    }))
                  }
                  placeholder="Project location"
                  className="h-10"
                />
              </div>

              <div>
                <label
                  htmlFor="project-client"
                  className="mb-1.5 block text-xs font-bold text-slate-700"
                >
                  Client
                </label>
                <Input
                  id="project-client"
                  value={formState.clientName}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      clientName: event.target.value,
                    }))
                  }
                  placeholder="Client name"
                  className="h-10"
                />
              </div>

              <div>
                <label
                  htmlFor="project-start-date"
                  className="mb-1.5 block text-xs font-bold text-slate-700"
                >
                  Start Date
                </label>
                <Input
                  id="project-start-date"
                  type="date"
                  value={formState.startDate}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      startDate: event.target.value,
                    }))
                  }
                  className="h-10"
                />
              </div>

              <div>
                <label
                  htmlFor="project-end-date"
                  className="mb-1.5 block text-xs font-bold text-slate-700"
                >
                  End Date
                </label>
                <Input
                  id="project-end-date"
                  type="date"
                  value={formState.endDate}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      endDate: event.target.value,
                    }))
                  }
                  className="h-10"
                />
              </div>

              <div>
                <label
                  htmlFor="project-status"
                  className="mb-1.5 block text-xs font-bold text-slate-700"
                >
                  Progress Status
                </label>
                <select
                  id="project-status"
                  value={formState.status}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      status: event.target.value as ProjectStatus,
                    }))
                  }
                  className={cn(selectClassName, "w-full")}
                >
                  {projectStatuses.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="project-publish-status"
                  className="mb-1.5 block text-xs font-bold text-slate-700"
                >
                  Publish Status
                </label>
                <select
                  id="project-publish-status"
                  value={formState.publishStatus}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      publishStatus: event.target.value as PublishStatus,
                    }))
                  }
                  className={cn(selectClassName, "w-full")}
                >
                  {publishStatuses.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="project-cover-image"
                  className="mb-1.5 block text-xs font-bold text-slate-700"
                >
                  Cover Image URL
                </label>
                <Input
                  id="project-cover-image"
                  value={formState.coverImage}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      coverImage: event.target.value,
                    }))
                  }
                  placeholder="https://example.com/image.jpg"
                  className="h-10"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Use a direct image URL. Webpage links like Pinterest pins will
                  not render as images.
                </p>
                {hasInvalidCoverImage && (
                  <p className="mt-1 text-xs font-medium text-rose-600">
                    This is a webpage link, not a direct image URL. Use an
                    i.pinimg.com image URL instead.
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="project-display-order"
                  className="mb-1.5 block text-xs font-bold text-slate-700"
                >
                  Display Order
                </label>
                <Input
                  id="project-display-order"
                  type="number"
                  min={0}
                  value={formState.displayOrder}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      displayOrder: event.target.value,
                    }))
                  }
                  className="h-10"
                />
              </div>

              {coverImageValue && (
                <div className="md:col-span-2">
                  <p className="mb-1.5 text-xs font-bold text-slate-700">
                    Cover Preview
                  </p>
                  <div className="relative h-56 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                    <SafeProjectImage
                      src={coverImageValue}
                      alt={`${formState.name || "Project"} cover preview`}
                      fallbackSrc=""
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}

              <div className="md:col-span-2">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-slate-700">
                      Project Gallery
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Add multiple direct image URLs for the details page
                      gallery.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addGalleryImageRow}
                  >
                    <ImagePlus className="size-4" />
                    Add Image
                  </Button>
                </div>

                <div className="space-y-3">
                  {formState.galleryImages.filter((image) => !image.isDeleted)
                    .length ? (
                    formState.galleryImages.map((image, index) => {
                      if (image.isDeleted) return null;

                      const galleryImageUrl = image.imageUrl.trim();
                      const hasInvalidGalleryImage =
                        Boolean(galleryImageUrl) &&
                        !isLikelyDirectImageUrl(galleryImageUrl);

                      return (
                        <div
                          key={image.id ?? index}
                          className="rounded-lg border border-slate-200 p-3"
                        >
                          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_6rem_2rem]">
                            <div>
                              <label className="mb-1.5 block text-xs font-bold text-slate-700">
                                Image URL
                              </label>
                              <Input
                                value={image.imageUrl}
                                onChange={(event) =>
                                  updateGalleryImageRow(
                                    index,
                                    "imageUrl",
                                    event.target.value,
                                  )
                                }
                                placeholder="https://example.com/gallery.jpg"
                                className="h-10"
                              />
                            </div>
                            <div>
                              <label className="mb-1.5 block text-xs font-bold text-slate-700">
                                Caption
                              </label>
                              <Input
                                value={image.caption}
                                onChange={(event) =>
                                  updateGalleryImageRow(
                                    index,
                                    "caption",
                                    event.target.value,
                                  )
                                }
                                placeholder="Optional caption"
                                className="h-10"
                              />
                            </div>
                            <div>
                              <label className="mb-1.5 block text-xs font-bold text-slate-700">
                                Order
                              </label>
                              <Input
                                type="number"
                                min={0}
                                value={image.order}
                                onChange={(event) =>
                                  updateGalleryImageRow(
                                    index,
                                    "order",
                                    event.target.value,
                                  )
                                }
                                className="h-10"
                              />
                            </div>
                            <div className="flex items-end">
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                onClick={() => removeGalleryImageRow(index)}
                                aria-label="Remove gallery image"
                              >
                                <FaTrashAlt className="size-3.5" />
                              </Button>
                            </div>
                          </div>

                          {hasInvalidGalleryImage && (
                            <p className="mt-2 text-xs font-medium text-rose-600">
                              Use a direct image URL, not a webpage link.
                            </p>
                          )}

                          {galleryImageUrl && !hasInvalidGalleryImage && (
                            <div className="relative mt-3 h-36 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                              <SafeProjectImage
                                src={galleryImageUrl}
                                alt={image.caption || "Project gallery preview"}
                                fallbackSrc=""
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="rounded-lg border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500">
                      No gallery images added.
                    </div>
                  )}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formState.featured}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        featured: event.target.checked,
                      }))
                    }
                    className="size-4 rounded border-slate-300"
                  />
                  Featured project
                </label>
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="project-description"
                  className="mb-1.5 block text-xs font-bold text-slate-700"
                >
                  Description
                </label>
                <textarea
                  id="project-description"
                  value={formState.description}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Project description"
                  rows={4}
                  className="min-h-24 w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="project-scope"
                  className="mb-1.5 block text-xs font-bold text-slate-700"
                >
                  Scope
                </label>
                <textarea
                  id="project-scope"
                  value={formState.scope}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      scope: event.target.value,
                    }))
                  }
                  placeholder="Project scope"
                  rows={4}
                  className="min-h-24 w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="project-highlights"
                  className="mb-1.5 block text-xs font-bold text-slate-700"
                >
                  Project Highlights
                </label>
                <textarea
                  id="project-highlights"
                  value={formState.highlights}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      highlights: event.target.value,
                    }))
                  }
                  placeholder="Add one highlight per line"
                  rows={4}
                  className="min-h-24 w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <BsFillSendFill className="size-4" />
                )}
                {isEditing ? "Save Changes" : "Create Project"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                disabled={isSubmitting}
              >
                Clear
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProjectManagement;
