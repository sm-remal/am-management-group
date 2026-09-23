"use client";

import {
  AlertCircle,
  BriefcaseBusiness,
  CheckCircle2,
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
  createJob,
  deleteJob,
  getAdminJobs,
  updateJob,
} from "@/features/jobs/job.api";
import type {
  CreateJobPayload,
  EmploymentType,
  JobListResponse,
  JobRecord,
  UpdateJobPayload,
} from "@/features/jobs/job.types";
import { cn } from "@/lib/utils";

type JobFormState = {
  id: string | null;
  title: string;
  slug: string;
  companyId: string;
  location: string;
  employmentType: EmploymentType;
  requirements: string;
  description: string;
  salaryInfo: string;
  deadline: string;
  isPublished: boolean;
};

type JobListMeta = JobListResponse["meta"];

const employmentTypes: Array<{ value: EmploymentType; label: string }> = [
  { value: "FULL_TIME", label: "Full Time" },
  { value: "PART_TIME", label: "Part Time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "INTERNSHIP", label: "Internship" },
];

const initialFormState: JobFormState = {
  id: null,
  title: "",
  slug: "",
  companyId: "",
  location: "",
  employmentType: "FULL_TIME",
  requirements: "",
  description: "",
  salaryInfo: "",
  deadline: "",
  isPublished: false,
};

const selectClassName =
  "h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const nullableText = (value: string) => value.trim() || null;

const toDateInputValue = (value: string | null) => {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
};

const formatDate = (value: string | null) => {
  if (!value) return "No deadline";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
};

const getEmploymentLabel = (value: EmploymentType) =>
  employmentTypes.find((item) => item.value === value)?.label ?? value;

const CareerManagement = () => {
  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [companies, setCompanies] = useState<CompanyRecord[]>([]);
  const [meta, setMeta] = useState<JobListMeta | null>(null);
  const [search, setSearch] = useState("");
  const [companyId, setCompanyId] = useState<string | "ALL">("ALL");
  const [employmentType, setEmploymentType] = useState<EmploymentType | "ALL">(
    "ALL",
  );
  const [isPublished, setIsPublished] = useState<"true" | "false" | "ALL">(
    "ALL",
  );
  const [page, setPage] = useState(1);
  const [formState, setFormState] = useState<JobFormState>(initialFormState);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isEditing = Boolean(formState.id);

  const loadJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [jobResult, companyResult] = await Promise.all([
        getAdminJobs({
          page,
          limit: 10,
          search,
          companyId: companyId === "ALL" ? undefined : companyId,
          employmentType,
          isPublished,
        }),
        getAdminCompanies({ limit: 100 }),
      ]);

      setJobs(jobResult.data?.jobs ?? []);
      setMeta(jobResult.data?.meta ?? null);
      setCompanies(companyResult.data?.companies ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load jobs");
    } finally {
      setIsLoading(false);
    }
  }, [companyId, employmentType, isPublished, page, search]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadJobs();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadJobs]);

  const totals = useMemo(() => {
    return jobs.reduce(
      (acc, job) => {
        if (job.isPublished) acc.published += 1;
        acc.applications += job._count?.applications ?? 0;
        return acc;
      },
      { published: 0, applications: 0 },
    );
  }, [jobs]);

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
    });
    setFormError(null);
    setSuccess(null);
    setIsFormOpen(true);
  };

  const handleEdit = (job: JobRecord) => {
    setFormState({
      id: job.id,
      title: job.title,
      slug: job.slug,
      companyId: job.companyId,
      location: job.location ?? "",
      employmentType: job.employmentType,
      requirements: job.requirements ?? "",
      description: job.description ?? "",
      salaryInfo: job.salaryInfo ?? "",
      deadline: toDateInputValue(job.deadline),
      isPublished: job.isPublished,
    });
    setFormError(null);
    setSuccess(null);
    setIsFormOpen(true);
  };

  const validateForm = () => {
    if (!formState.title.trim()) return "Job title is required";
    if (!formState.companyId) return "Company is required";
    return null;
  };

  const buildPayload = (): CreateJobPayload | UpdateJobPayload => ({
    title: formState.title.trim(),
    slug: formState.slug.trim() || undefined,
    companyId: formState.companyId,
    location: nullableText(formState.location),
    employmentType: formState.employmentType,
    requirements: nullableText(formState.requirements),
    description: nullableText(formState.description),
    salaryInfo: nullableText(formState.salaryInfo),
    deadline: formState.deadline || null,
    isPublished: formState.isPublished,
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
        await updateJob(formState.id, buildPayload());
        setSuccess("Job updated successfully");
      } else {
        await createJob(buildPayload() as CreateJobPayload);
        setSuccess("Job created successfully");
      }
      closeForm();
      await loadJobs();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Unable to save job");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePublish = async (job: JobRecord) => {
    setActionId(job.id);
    setError(null);
    setSuccess(null);

    try {
      await updateJob(job.id, { isPublished: !job.isPublished });
      setSuccess(job.isPublished ? "Job unpublished" : "Job published");
      await loadJobs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update job");
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (job: JobRecord) => {
    if (
      !window.confirm(
        `Delete "${job.title}"? Applications linked to this job will also be removed.`,
      )
    )
      return;

    setActionId(job.id);
    setError(null);
    setSuccess(null);

    try {
      await deleteJob(job.id);
      setSuccess("Job deleted successfully");
      await loadJobs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete job");
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
            Career Management
          </p>
          <h1 className="mt-1 text-2xl font-bold text-foreground md:text-3xl">
            Dashboard careers
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Manage job openings across group companies and publish roles for
            applicants.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={loadJobs}
            disabled={isLoading}
          >
            <RefreshCw className={cn("size-4", isLoading && "animate-spin")} />
            Refresh
          </Button>
          <Button type="button" onClick={openCreateForm}>
            <Plus className="size-4" />
            Create Job
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              Total jobs
            </p>
            <BriefcaseBusiness className="size-5 text-primary" />
          </div>
          <p className="mt-3 text-3xl font-bold text-foreground">
            {meta?.total ?? jobs.length}
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
              Applications on page
            </p>
            <FaPauseCircle className="size-5 text-secondary" />
          </div>
          <p className="mt-3 text-3xl font-bold text-foreground">
            {totals.applications}
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
        <div className="grid gap-3 border-b border-border p-4 xl:grid-cols-[minmax(0,1fr)_14rem_12rem_10rem]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search job, company or location"
              className="h-10 pl-9"
            />
          </div>
          <select
            value={companyId}
            onChange={(e) => {
              setCompanyId(e.target.value as string | "ALL");
              setPage(1);
            }}
            className={selectClassName}
          >
            <option value="ALL">All companies</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
          <select
            value={employmentType}
            onChange={(e) => {
              setEmploymentType(e.target.value as EmploymentType | "ALL");
              setPage(1);
            }}
            className={selectClassName}
          >
            <option value="ALL">All types</option>
            {employmentTypes.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <select
            value={isPublished}
            onChange={(e) => {
              setIsPublished(e.target.value as "true" | "false" | "ALL");
              setPage(1);
            }}
            className={selectClassName}
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
                <th className="px-4 py-3 font-semibold">Job</th>
                <th className="px-4 py-3 font-semibold">Company</th>
                <th className="px-4 py-3 font-semibold">Type / Deadline</th>
                <th className="px-4 py-3 font-semibold">Apps</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-16 text-center text-muted-foreground"
                  >
                    <div className="inline-flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin" />
                      Loading jobs...
                    </div>
                  </td>
                </tr>
              ) : jobs.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-16 text-center text-muted-foreground"
                  >
                    No jobs found. Create the first opening to get started.
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr
                    key={job.id}
                    className="border-b border-border last:border-b-0"
                  >
                    <td className="px-4 py-4">
                      <p className="font-semibold text-foreground">
                        {job.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {job.location || "Location not set"}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-foreground">
                      {job.company?.name ?? "—"}
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-foreground">
                        {getEmploymentLabel(job.employmentType)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(job.deadline)}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-foreground">
                      {job._count?.applications ?? 0}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={cn(
                          "rounded-full px-2 py-1 text-xs font-semibold",
                          job.isPublished
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {job.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          onClick={() => handleEdit(job)}
                        >
                          <FaEdit className="size-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          disabled={actionId === job.id}
                          onClick={() => void handleTogglePublish(job)}
                        >
                          {job.isPublished ? (
                            <FaPauseCircle className="size-3.5" />
                          ) : (
                            <MdCheckBox className="size-4" />
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon-sm"
                          disabled={actionId === job.id}
                          onClick={() => void handleDelete(job)}
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
                  {isEditing ? "Edit job" : "Create job"}
                </p>
                <h2 className="mt-1 text-xl font-bold text-foreground">
                  {isEditing ? "Update job opening" : "Add a job opening"}
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
                  Job title
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
                  Company
                </label>
                <select
                  value={formState.companyId}
                  onChange={(e) =>
                    setFormState((c) => ({ ...c, companyId: e.target.value }))
                  }
                  className={cn(selectClassName, "h-10 w-full")}
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
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  Location
                </label>
                <Input
                  value={formState.location}
                  onChange={(e) =>
                    setFormState((c) => ({ ...c, location: e.target.value }))
                  }
                  className="h-10"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  Employment type
                </label>
                <select
                  value={formState.employmentType}
                  onChange={(e) =>
                    setFormState((c) => ({
                      ...c,
                      employmentType: e.target.value as EmploymentType,
                    }))
                  }
                  className={cn(selectClassName, "h-10 w-full")}
                >
                  {employmentTypes.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  Salary info
                </label>
                <Input
                  value={formState.salaryInfo}
                  onChange={(e) =>
                    setFormState((c) => ({ ...c, salaryInfo: e.target.value }))
                  }
                  className="h-10"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  Deadline
                </label>
                <Input
                  type="date"
                  value={formState.deadline}
                  onChange={(e) =>
                    setFormState((c) => ({ ...c, deadline: e.target.value }))
                  }
                  className="h-10"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  Description
                </label>
                <textarea
                  value={formState.description}
                  onChange={(e) =>
                    setFormState((c) => ({ ...c, description: e.target.value }))
                  }
                  rows={4}
                  className="min-h-24 w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-xs font-bold text-foreground">
                  Requirements
                </label>
                <textarea
                  value={formState.requirements}
                  onChange={(e) =>
                    setFormState((c) => ({
                      ...c,
                      requirements: e.target.value,
                    }))
                  }
                  rows={4}
                  className="min-h-24 w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>
              <div className="flex items-center gap-2 md:col-span-2">
                <input
                  id="job-published"
                  type="checkbox"
                  checked={formState.isPublished}
                  onChange={(e) =>
                    setFormState((c) => ({
                      ...c,
                      isPublished: e.target.checked,
                    }))
                  }
                  className="size-4 rounded border-input text-primary"
                />
                <label
                  htmlFor="job-published"
                  className="text-sm font-medium text-foreground"
                >
                  Published (visible on careers page)
                </label>
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
                  {isEditing ? "Save Changes" : "Create Job"}
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

export default CareerManagement;
