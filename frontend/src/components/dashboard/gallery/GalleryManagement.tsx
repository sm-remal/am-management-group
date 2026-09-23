"use client";

import {
  AlertCircle,
  CheckCircle2,
  GalleryHorizontalEnd,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { BsFillSendFill } from "react-icons/bs";
import { FaEdit, FaPauseCircle, FaTrashAlt } from "react-icons/fa";
import { HiDocumentCheck } from "react-icons/hi2";
import { MdCheckBox } from "react-icons/md";
import Pagination from "@/components/common/Pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAdminCompanies } from "@/features/companies/company.api";
import type { CompanyRecord } from "@/features/companies/company.types";
import {
  createGalleryImage,
  deleteGalleryImage,
  getAdminGalleryImages,
  updateGalleryImage,
} from "@/features/gallery/gallery.api";
import type {
  CreateGalleryImagePayload,
  GalleryImageRecord,
  GalleryListResponse,
  UpdateGalleryImagePayload,
} from "@/features/gallery/gallery.types";
import { cn } from "@/lib/utils";

type GalleryFormState = {
  id: string | null;
  title: string;
  imageUrl: string;
  category: string;
  companyId: string;
  displayOrder: string;
  isPublished: boolean;
};

type GalleryListMeta = GalleryListResponse["meta"];

const initialFormState: GalleryFormState = {
  id: null,
  title: "",
  imageUrl: "",
  category: "",
  companyId: "",
  displayOrder: "0",
  isPublished: true,
};

const selectClassName =
  "h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const nullableText = (value: string) => value.trim() || null;

const GalleryManagement = () => {
  const [galleryImages, setGalleryImages] = useState<GalleryImageRecord[]>([]);
  const [companies, setCompanies] = useState<CompanyRecord[]>([]);
  const [meta, setMeta] = useState<GalleryListMeta | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [companyId, setCompanyId] = useState<string | "ALL">("ALL");
  const [isPublished, setIsPublished] = useState<"true" | "false" | "ALL">(
    "ALL",
  );
  const [page, setPage] = useState(1);
  const [formState, setFormState] =
    useState<GalleryFormState>(initialFormState);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionImageId, setActionImageId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isEditing = Boolean(formState.id);

  const loadGalleryImages = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [galleryResult, companyResult] = await Promise.all([
        getAdminGalleryImages({
          page,
          limit: 10,
          search,
          category: category.trim() || undefined,
          companyId: companyId === "ALL" ? undefined : companyId,
          isPublished,
        }),
        getAdminCompanies({ limit: 100 }),
      ]);

      setGalleryImages(galleryResult.data?.galleryImages ?? []);
      setMeta(galleryResult.data?.meta ?? null);
      setCompanies(companyResult.data?.companies ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load gallery images",
      );
    } finally {
      setIsLoading(false);
    }
  }, [category, companyId, isPublished, page, search]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadGalleryImages();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadGalleryImages]);

  const totals = useMemo(() => {
    return galleryImages.reduce(
      (acc, image) => {
        if (image.isPublished) acc.published += 1;
        else acc.draft += 1;
        if (image.companyId) acc.companyLinked += 1;
        return acc;
      },
      { published: 0, draft: 0, companyLinked: 0 },
    );
  }, [galleryImages]);

  const uniqueCategories = useMemo(() => {
    const set = new Set<string>();
    galleryImages.forEach((image) => {
      if (image.category?.trim()) set.add(image.category.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [galleryImages]);

  const resetForm = () => {
    setFormState(initialFormState);
    setFormError(null);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    resetForm();
  };

  const openCreateForm = () => {
    setFormState(initialFormState);
    setFormError(null);
    setSuccess(null);
    setIsFormOpen(true);
  };

  const handleEdit = (image: GalleryImageRecord) => {
    setFormState({
      id: image.id,
      title: image.title ?? "",
      imageUrl: image.imageUrl,
      category: image.category,
      companyId: image.companyId ?? "",
      displayOrder: String(image.displayOrder),
      isPublished: image.isPublished,
    });
    setFormError(null);
    setSuccess(null);
    setIsFormOpen(true);
  };

  const validateForm = () => {
    if (!formState.imageUrl.trim()) return "Image URL is required";
    if (!/^https?:\/\//.test(formState.imageUrl.trim()))
      return "Image URL must be a valid URL";
    if (!formState.category.trim()) return "Category is required";
    return null;
  };

  const buildPayload = ():
    | CreateGalleryImagePayload
    | UpdateGalleryImagePayload => {
    return {
      title: nullableText(formState.title),
      imageUrl: formState.imageUrl.trim(),
      category: formState.category.trim(),
      companyId: formState.companyId.trim() ? formState.companyId.trim() : null,
      displayOrder: Number(formState.displayOrder) || 0,
      isPublished: formState.isPublished,
    };
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
    setSuccess(null);

    try {
      if (formState.id) {
        await updateGalleryImage(formState.id, buildPayload());
        setSuccess("Gallery image updated successfully");
      } else {
        await createGalleryImage(buildPayload() as CreateGalleryImagePayload);
        setSuccess("Gallery image created successfully");
      }

      closeForm();
      await loadGalleryImages();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Unable to save gallery image",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePublished = async (image: GalleryImageRecord) => {
    setActionImageId(image.id);
    setError(null);
    setSuccess(null);

    try {
      await updateGalleryImage(image.id, { isPublished: !image.isPublished });
      setSuccess(
        image.isPublished
          ? "Gallery image unpublished successfully"
          : "Gallery image published successfully",
      );
      await loadGalleryImages();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update publish status",
      );
    } finally {
      setActionImageId(null);
    }
  };

  const handleDelete = async (image: GalleryImageRecord) => {
    const label = image.title || image.category || "this image";
    const confirmed = window.confirm(
      `Delete "${label}"? This action cannot be undone.`,
    );
    if (!confirmed) return;

    setActionImageId(image.id);
    setError(null);
    setSuccess(null);

    try {
      await deleteGalleryImage(image.id);
      setSuccess("Gallery image deleted successfully");
      await loadGalleryImages();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete gallery image",
      );
    } finally {
      setActionImageId(null);
    }
  };

  const totalPages = meta?.totalPage || 1;

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-secondary">
            Gallery Management
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-normal text-foreground md:text-3xl">
            Dashboard gallery
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Manage gallery images for the group and individual companies,
            including publish state and display order.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={loadGalleryImages}
            disabled={isLoading}
          >
            <RefreshCw className={cn("size-4", isLoading && "animate-spin")} />
            Refresh
          </Button>
          <Button type="button" onClick={openCreateForm}>
            <Plus className="size-4" />
            Add Image
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              Total images
            </p>
            <GalleryHorizontalEnd className="size-5 text-primary" />
          </div>
          <p className="mt-3 text-3xl font-bold text-foreground">
            {meta?.total ?? galleryImages.length}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              Published on page
            </p>
            <HiDocumentCheck className="size-5 text-primary" />
          </div>
          <p className="mt-3 text-3xl font-bold text-foreground">
            {totals.published}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              Company linked
            </p>
            <FaPauseCircle className="size-5 text-secondary" />
          </div>
          <p className="mt-3 text-3xl font-bold text-foreground">
            {totals.companyLinked}
          </p>
        </div>
      </section>

      {(error || success) && (
        <section
          className={cn(
            "flex items-start gap-2 rounded-lg border p-3 text-sm",
            error
              ? "border-destructive/30 bg-destructive/10 text-destructive"
              : "border-primary/20 bg-primary/5 text-primary",
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

      <section className="rounded-lg border border-border bg-card shadow-sm">
        <div className="grid gap-3 border-b border-border p-4 xl:grid-cols-[minmax(0,1fr)_12rem_14rem_10rem]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search title, category or company"
              className="h-10 pl-9"
            />
          </div>

          <Input
            value={category}
            onChange={(event) => {
              setCategory(event.target.value);
              setPage(1);
            }}
            placeholder="Filter by category"
            className="h-10"
            list="gallery-category-options"
          />
          <datalist id="gallery-category-options">
            {uniqueCategories.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>

          <select
            value={companyId}
            onChange={(event) => {
              setCompanyId(event.target.value as string | "ALL");
              setPage(1);
            }}
            className={selectClassName}
            aria-label="Filter by company"
          >
            <option value="ALL">All companies</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>

          <select
            value={isPublished}
            onChange={(event) => {
              setIsPublished(event.target.value as "true" | "false" | "ALL");
              setPage(1);
            }}
            className={selectClassName}
            aria-label="Filter by publish status"
          >
            <option value="ALL">All status</option>
            <option value="true">Published</option>
            <option value="false">Unpublished</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Image</th>
                <th className="px-4 py-3 font-semibold">Category / Company</th>
                <th className="px-4 py-3 font-semibold">Order</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-16 text-center text-muted-foreground"
                  >
                    <div className="inline-flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin" />
                      Loading gallery images...
                    </div>
                  </td>
                </tr>
              ) : galleryImages.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-16 text-center text-muted-foreground"
                  >
                    No gallery images found. Add the first image to get started.
                  </td>
                </tr>
              ) : (
                galleryImages.map((image) => (
                  <tr
                    key={image.id}
                    className="border-b border-border last:border-b-0"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="size-14 shrink-0 rounded-lg bg-muted bg-cover bg-center"
                          style={{ backgroundImage: `url(${image.imageUrl})` }}
                        />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-foreground">
                            {image.title || "Untitled"}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {image.imageUrl}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-foreground">
                        {image.category}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {image.company?.name ?? "Group-level"}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-foreground">
                      {image.displayOrder}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={cn(
                          "rounded-full px-2 py-1 text-xs font-semibold",
                          image.isPublished
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {image.isPublished ? "Published" : "Unpublished"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          onClick={() => handleEdit(image)}
                          aria-label="Edit gallery image"
                        >
                          <FaEdit className="size-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          disabled={actionImageId === image.id}
                          onClick={() => void handleTogglePublished(image)}
                          aria-label={
                            image.isPublished
                              ? "Unpublish image"
                              : "Publish image"
                          }
                        >
                          {image.isPublished ? (
                            <FaPauseCircle className="size-3.5" />
                          ) : (
                            <MdCheckBox className="size-4" />
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon-sm"
                          disabled={actionImageId === image.id}
                          onClick={() => void handleDelete(image)}
                          aria-label="Delete gallery image"
                        >
                          <FaTrashAlt className="size-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
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
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/40 p-4 sm:p-6">
          <div className="my-6 w-full max-w-3xl rounded-xl border border-border bg-card p-5 shadow-lg sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-secondary">
                  {isEditing ? "Edit gallery image" : "Add gallery image"}
                </p>
                <h2 className="mt-1 text-xl font-bold text-foreground">
                  {isEditing
                    ? "Update image details"
                    : "Upload a new gallery image"}
                </h2>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={closeForm}
                aria-label="Close form"
              >
                <X className="size-4" />
              </Button>
            </div>

            {formError && (
              <div className="mb-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <p>{formError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label
                    htmlFor="gallery-image-url"
                    className="mb-1.5 block text-xs font-bold text-foreground"
                  >
                    Image URL
                  </label>
                  <Input
                    id="gallery-image-url"
                    value={formState.imageUrl}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        imageUrl: event.target.value,
                      }))
                    }
                    placeholder="https://..."
                    className="h-10"
                  />
                  {formState.imageUrl.trim() &&
                    /^https?:\/\//.test(formState.imageUrl.trim()) && (
                      <div
                        className="mt-3 h-40 rounded-lg border border-border bg-muted bg-cover bg-center"
                        style={{
                          backgroundImage: `url(${formState.imageUrl.trim()})`,
                        }}
                      />
                    )}
                </div>

                <div>
                  <label
                    htmlFor="gallery-title"
                    className="mb-1.5 block text-xs font-bold text-foreground"
                  >
                    Title
                  </label>
                  <Input
                    id="gallery-title"
                    value={formState.title}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        title: event.target.value,
                      }))
                    }
                    placeholder="Optional title"
                    className="h-10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="gallery-category"
                    className="mb-1.5 block text-xs font-bold text-foreground"
                  >
                    Category
                  </label>
                  <Input
                    id="gallery-category"
                    value={formState.category}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        category: event.target.value,
                      }))
                    }
                    placeholder="e.g. Operations, Projects"
                    className="h-10"
                    list="gallery-form-category-options"
                  />
                  <datalist id="gallery-form-category-options">
                    {uniqueCategories.map((item) => (
                      <option key={item} value={item} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label
                    htmlFor="gallery-company"
                    className="mb-1.5 block text-xs font-bold text-foreground"
                  >
                    Company (optional)
                  </label>
                  <select
                    id="gallery-company"
                    value={formState.companyId}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        companyId: event.target.value,
                      }))
                    }
                    className={cn(selectClassName, "h-10 w-full")}
                  >
                    <option value="">Group-level (no company)</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="gallery-order"
                    className="mb-1.5 block text-xs font-bold text-foreground"
                  >
                    Display order
                  </label>
                  <Input
                    id="gallery-order"
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

                <div className="flex items-center gap-2 md:col-span-2">
                  <input
                    id="gallery-published"
                    type="checkbox"
                    checked={formState.isPublished}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        isPublished: event.target.checked,
                      }))
                    }
                    className="size-4 rounded border-input text-primary"
                  />
                  <label
                    htmlFor="gallery-published"
                    className="text-sm font-medium text-foreground"
                  >
                    Published (visible on public site)
                  </label>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <BsFillSendFill className="size-4" />
                  )}
                  {isEditing ? "Save Changes" : "Add Image"}
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
        </div>
      )}
    </div>
  );
};

export default GalleryManagement;
