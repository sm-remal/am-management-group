"use client";

import {
  AlertCircle,
  CheckCircle2,
  Contact,
  ExternalLink,
  Loader2,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FaTrashAlt } from "react-icons/fa";
import Pagination from "@/components/common/Pagination";
import { buttonVariants, Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  deleteApplication,
  getAdminApplications,
  updateApplicationStatus,
} from "@/features/applications/application.api";
import type {
  ApplicationListResponse,
  ApplicationRecord,
  ApplicationStatus,
} from "@/features/applications/application.types";
import { getAdminJobs } from "@/features/jobs/job.api";
import type { JobRecord } from "@/features/jobs/job.types";
import { cn } from "@/lib/utils";

type ApplicationListMeta = ApplicationListResponse["meta"];

const statusOptions: Array<{ value: ApplicationStatus; label: string }> = [
  { value: "PENDING", label: "Pending" },
  { value: "REVIEWED", label: "Reviewed" },
  { value: "SHORTLISTED", label: "Shortlisted" },
  { value: "REJECTED", label: "Rejected" },
  { value: "HIRED", label: "Hired" },
];

const selectClassName =
  "h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

const getStatusClass = (status: ApplicationStatus) => {
  switch (status) {
    case "HIRED":
    case "SHORTLISTED":
      return "bg-primary/10 text-primary";
    case "REJECTED":
      return "bg-destructive/10 text-destructive";
    case "REVIEWED":
      return "bg-secondary/15 text-secondary";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const ApplicationManagement = () => {
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [meta, setMeta] = useState<ApplicationListMeta | null>(null);
  const [search, setSearch] = useState("");
  const [jobId, setJobId] = useState<string | "ALL">("ALL");
  const [status, setStatus] = useState<ApplicationStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<ApplicationRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadApplications = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [appResult, jobResult] = await Promise.all([
        getAdminApplications({
          page,
          limit: 10,
          search,
          jobId: jobId === "ALL" ? undefined : jobId,
          status,
        }),
        getAdminJobs({ limit: 100 }),
      ]);

      setApplications(appResult.data?.applications ?? []);
      setMeta(appResult.data?.meta ?? null);
      setJobs(jobResult.data?.jobs ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load applications",
      );
    } finally {
      setIsLoading(false);
    }
  }, [jobId, page, search, status]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadApplications();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadApplications]);

  const totals = useMemo(() => {
    return applications.reduce(
      (acc, item) => {
        if (item.status === "PENDING") acc.pending += 1;
        if (item.status === "SHORTLISTED" || item.status === "HIRED")
          acc.positive += 1;
        return acc;
      },
      { pending: 0, positive: 0 },
    );
  }, [applications]);

  const handleStatusChange = async (
    item: ApplicationRecord,
    nextStatus: ApplicationStatus,
  ) => {
    setActionId(item.id);
    setError(null);
    setSuccess(null);

    try {
      const result = await updateApplicationStatus(item.id, {
        status: nextStatus,
      });
      setSuccess(`Application marked as ${nextStatus.toLowerCase()}`);
      if (selected?.id === item.id && result.data?.application) {
        setSelected(result.data.application);
      }
      await loadApplications();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update status");
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (item: ApplicationRecord) => {
    if (!window.confirm(`Delete application from "${item.fullName}"?`)) return;

    setActionId(item.id);
    setError(null);
    setSuccess(null);

    try {
      await deleteApplication(item.id);
      setSuccess("Application deleted successfully");
      if (selected?.id === item.id) setSelected(null);
      await loadApplications();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete application",
      );
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
            Application Management
          </p>
          <h1 className="mt-1 text-2xl font-bold text-foreground md:text-3xl">
            Dashboard applications
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Review job applications, update pipeline status and access candidate
            CVs.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={loadApplications}
          disabled={isLoading}
        >
          <RefreshCw className={cn("size-4", isLoading && "animate-spin")} />
          Refresh
        </Button>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              Total applications
            </p>
            <Contact className="size-5 text-primary" />
          </div>
          <p className="mt-3 text-3xl font-bold text-foreground">
            {meta?.total ?? applications.length}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              Pending on page
            </p>
            <AlertCircle className="size-5 text-secondary" />
          </div>
          <p className="mt-3 text-3xl font-bold text-foreground">
            {totals.pending}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              Shortlisted / Hired
            </p>
            <CheckCircle2 className="size-5 text-primary" />
          </div>
          <p className="mt-3 text-3xl font-bold text-foreground">
            {totals.positive}
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
        <div className="grid gap-3 border-b border-border p-4 xl:grid-cols-[minmax(0,1fr)_16rem_12rem]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search name, email, phone or job"
              className="h-10 pl-9"
            />
          </div>
          <select
            value={jobId}
            onChange={(e) => {
              setJobId(e.target.value as string | "ALL");
              setPage(1);
            }}
            className={selectClassName}
          >
            <option value="ALL">All jobs</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as ApplicationStatus | "ALL");
              setPage(1);
            }}
            className={selectClassName}
          >
            <option value="ALL">All status</option>
            {statusOptions.map((item) => (
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
                <th className="px-4 py-3 font-semibold">Applicant</th>
                <th className="px-4 py-3 font-semibold">Job</th>
                <th className="px-4 py-3 font-semibold">Applied</th>
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
                      Loading applications...
                    </div>
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-16 text-center text-muted-foreground"
                  >
                    No applications found yet.
                  </td>
                </tr>
              ) : (
                applications.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-border last:border-b-0"
                  >
                    <td className="px-4 py-4">
                      <p className="font-semibold text-foreground">
                        {item.fullName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.phone}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-foreground">
                        {item.job?.title ?? "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.job?.company?.name}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="px-4 py-4">
                      <select
                        value={item.status}
                        disabled={actionId === item.id}
                        onChange={(e) =>
                          void handleStatusChange(
                            item,
                            e.target.value as ApplicationStatus,
                          )
                        }
                        className={cn(selectClassName, "min-w-32")}
                      >
                        {statusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setSelected(item)}
                        >
                          View
                        </Button>
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

      {selected && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/40 p-4 sm:p-6">
          <div className="my-6 w-full max-w-2xl rounded-xl border border-border bg-card p-5 shadow-lg sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-secondary">
                  Application detail
                </p>
                <h2 className="mt-1 text-xl font-bold text-foreground">
                  {selected.fullName}
                </h2>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={() => setSelected(null)}
              >
                <X className="size-4" />
              </Button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-xs font-bold text-muted-foreground">
                    Email
                  </p>
                  <p className="text-foreground">{selected.email}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground">
                    Phone
                  </p>
                  <p className="text-foreground">{selected.phone}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground">Job</p>
                  <p className="text-foreground">{selected.job?.title}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground">
                    Company
                  </p>
                  <p className="text-foreground">
                    {selected.job?.company?.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground">
                    Preferred company
                  </p>
                  <p className="text-foreground">
                    {selected.preferredCompany?.name || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground">
                    Status
                  </p>
                  <span
                    className={cn(
                      "rounded-full px-2 py-1 text-xs font-semibold",
                      getStatusClass(selected.status),
                    )}
                  >
                    {selected.status}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-muted-foreground">
                  Cover message
                </p>
                <p className="mt-1 whitespace-pre-wrap text-foreground">
                  {selected.coverMessage || "No message"}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <a
                  href={selected.cvUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonVariants({ variant: "outline" })}
                >
                  <ExternalLink className="size-4" />
                  Open CV
                </a>
                {statusOptions.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    variant={
                      selected.status === option.value ? "default" : "outline"
                    }
                    size="sm"
                    disabled={actionId === selected.id}
                    onClick={() =>
                      void handleStatusChange(selected, option.value)
                    }
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationManagement;
