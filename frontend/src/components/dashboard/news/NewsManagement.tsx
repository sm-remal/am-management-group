"use client";

import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Newspaper,
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
import {
  createNews,
  deleteNews,
  getAdminNews,
  updateNews,
} from "@/features/news/news.api";
import type {
  CreateNewsPayload,
  NewsListResponse,
  NewsRecord,
  PublishStatus,
  UpdateNewsPayload,
} from "@/features/news/news.types";
import { cn } from "@/lib/utils";

type NewsFormState = {
  id: string | null;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  status: PublishStatus;
};

type NewsListMeta = NewsListResponse["meta"];

const publishStatuses: Array<{ value: PublishStatus; label: string }> = [
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
  { value: "ARCHIVED", label: "Archived" },
];

const initialFormState: NewsFormState = {
  id: null,
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImage: "",
  category: "",
  status: "DRAFT",
};

const selectClassName =
  "h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const nullableText = (value: string) => value.trim() || null;

const formatDate = (value: string | null) => {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
};

const NewsManagement = () => {
  const [newsList, setNewsList] = useState<NewsRecord[]>([]);
  const [meta, setMeta] = useState<NewsListMeta | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<PublishStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [formState, setFormState] = useState<NewsFormState>(initialFormState);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isEditing = Boolean(formState.id);

  const loadNews = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getAdminNews({ page, limit: 10, search, status });
      setNewsList(result.data?.news ?? []);
      setMeta(result.data?.meta ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load news");
    } finally {
      setIsLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadNews();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadNews]);

  const totals = useMemo(() => {
    return newsList.reduce(
      (acc, item) => {
        if (item.status === "PUBLISHED") acc.published += 1;
        if (item.status === "DRAFT") acc.draft += 1;
        return acc;
      },
      { published: 0, draft: 0 },
    );
  }, [newsList]);

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

  const handleEdit = (item: NewsRecord) => {
    setFormState({
      id: item.id,
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt ?? "",
      content: item.content,
      coverImage: item.coverImage ?? "",
      category: item.category ?? "",
      status: item.status,
    });
    setFormError(null);
    setSuccess(null);
    setIsFormOpen(true);
  };

  const validateForm = () => {
    if (!formState.title.trim()) return "Title is required";
    if (!formState.content.trim()) return "Content is required";
    if (
      formState.coverImage.trim() &&
      !/^https?:\/\//.test(formState.coverImage.trim())
    ) {
      return "Cover image must be a valid URL";
    }
    return null;
  };

  const buildPayload = (): CreateNewsPayload | UpdateNewsPayload => ({
    title: formState.title.trim(),
    slug: formState.slug.trim() || undefined,
    excerpt: nullableText(formState.excerpt),
    content: formState.content.trim(),
    coverImage: nullableText(formState.coverImage),
    category: nullableText(formState.category),
    status: formState.status,
  });

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
        await updateNews(formState.id, buildPayload());
        setSuccess("News updated successfully");
      } else {
        await createNews(buildPayload() as CreateNewsPayload);
        setSuccess("News created successfully");
      }
      closeForm();
      await loadNews();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Unable to save news");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatus = async (item: NewsRecord, nextStatus: PublishStatus) => {
    setActionId(item.id);
    setError(null);
    setSuccess(null);

    try {
      await updateNews(item.id, { status: nextStatus });
      setSuccess(`News marked as ${nextStatus.toLowerCase()}`);
      await loadNews();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update status");
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (item: NewsRecord) => {
    if (!window.confirm(`Delete "${item.title}"? This cannot be undone.`))
      return;

    setActionId(item.id);
    setError(null);
    setSuccess(null);

    try {
      await deleteNews(item.id);
      setSuccess("News deleted successfully");
      await loadNews();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete news");
    } finally {
      setActionId(null);
    }
  };

  const totalPages = meta?.totalPage || 1;

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-secondary">
            News Management
          </p>
          <h1 className="mt-1 text-2xl font-bold text-foreground md:text-3xl">
            Dashboard news
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Create and publish company news, updates and announcements.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={loadNews}
            disabled={isLoading}
          >
            <RefreshCw className={cn("size-4", isLoading && "animate-spin")} />
            Refresh
          </Button>
          <Button type="button" onClick={openCreateForm}>
            <Plus className="size-4" />
            Create News
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              Total news
            </p>
            <Newspaper className="size-5 text-primary" />
          </div>
          <p className="mt-3 text-3xl font-bold text-foreground">
            {meta?.total ?? newsList.length}
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
              Draft on page
            </p>
            <FaPauseCircle className="size-5 text-secondary" />
          </div>
          <p className="mt-3 text-3xl font-bold text-foreground">
            {totals.draft}
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
        <div className="grid gap-3 border-b border-border p-4 md:grid-cols-[minmax(0,1fr)_12rem]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search title, category or content"
              className="h-10 pl-9"
            />
          </div>
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as PublishStatus | "ALL");
              setPage(1);
            }}
            className={selectClassName}
          >
            <option value="ALL">All status</option>
            {publishStatuses.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">News</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Published</th>
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
                      Loading news...
                    </div>
                  </td>
                </tr>
              ) : newsList.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-16 text-center text-muted-foreground"
                  >
                    No news found. Create the first post to get started.
                  </td>
                </tr>
              ) : (
                newsList.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-border last:border-b-0"
                  >
                    <td className="px-4 py-4">
                      <p className="font-semibold text-foreground">
                        {item.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.slug}
                      </p>
                      {item.author?.name && (
                        <p className="text-xs text-muted-foreground">
                          By {item.author.name}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4 text-foreground">
                      {item.category || "—"}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {formatDate(item.publishedAt)}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={cn(
                          "rounded-full px-2 py-1 text-xs font-semibold",
                          item.status === "PUBLISHED"
                            ? "bg-primary/10 text-primary"
                            : item.status === "ARCHIVED"
                              ? "bg-muted text-muted-foreground"
                              : "bg-secondary/15 text-secondary",
                        )}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          onClick={() => handleEdit(item)}
                        >
                          <FaEdit className="size-3.5" />
                        </Button>
                        {item.status === "PUBLISHED" ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            disabled={actionId === item.id}
                            onClick={() => void handleStatus(item, "DRAFT")}
                          >
                            <FaPauseCircle className="size-3.5" />
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            disabled={actionId === item.id}
                            onClick={() => void handleStatus(item, "PUBLISHED")}
                          >
                            <MdCheckBox className="size-4" />
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon-sm"
                          disabled={actionId === item.id}
                          onClick={() => void handleDelete(item)}
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
                  {isEditing ? "Edit news" : "Create news"}
                </p>
                <h2 className="mt-1 text-xl font-bold text-foreground">
                  {isEditing ? "Update news post" : "Add a news post"}
                </h2>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={closeForm}
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

            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  Title
                </label>
                <Input
                  value={formState.title}
                  onChange={(e) =>
                    setFormState((c) => ({ ...c, title: e.target.value }))
                  }
                  className="h-10"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  Slug
                </label>
                <Input
                  value={formState.slug}
                  onChange={(e) =>
                    setFormState((c) => ({ ...c, slug: e.target.value }))
                  }
                  placeholder="auto-generated-if-empty"
                  className="h-10"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  Category
                </label>
                <Input
                  value={formState.category}
                  onChange={(e) =>
                    setFormState((c) => ({ ...c, category: e.target.value }))
                  }
                  className="h-10"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  Status
                </label>
                <select
                  value={formState.status}
                  onChange={(e) =>
                    setFormState((c) => ({
                      ...c,
                      status: e.target.value as PublishStatus,
                    }))
                  }
                  className={cn(selectClassName, "h-10 w-full")}
                >
                  {publishStatuses.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  Cover image URL
                </label>
                <Input
                  value={formState.coverImage}
                  onChange={(e) =>
                    setFormState((c) => ({ ...c, coverImage: e.target.value }))
                  }
                  placeholder="https://..."
                  className="h-10"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  Excerpt
                </label>
                <Input
                  value={formState.excerpt}
                  onChange={(e) =>
                    setFormState((c) => ({ ...c, excerpt: e.target.value }))
                  }
                  className="h-10"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  Content
                </label>
                <textarea
                  value={formState.content}
                  onChange={(e) =>
                    setFormState((c) => ({ ...c, content: e.target.value }))
                  }
                  rows={8}
                  className="min-h-40 w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>
              <div className="flex flex-col gap-2 sm:flex-row md:col-span-2">
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
                  {isEditing ? "Save Changes" : "Create News"}
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

export default NewsManagement;
