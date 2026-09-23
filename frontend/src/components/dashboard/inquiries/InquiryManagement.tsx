"use client";

import {
  AlertCircle,
  Bell,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FaTrashAlt } from "react-icons/fa";
import Pagination from "@/components/common/Pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  deleteInquiry,
  getAdminInquiries,
  updateInquiryStatus,
} from "@/features/contact/contact.api";
import type {
  InquiryListResponse,
  InquiryRecord,
  InquiryStatus,
} from "@/features/contact/contact.types";
import { cn } from "@/lib/utils";

type InquiryListMeta = InquiryListResponse["meta"];

const statusOptions: Array<{ value: InquiryStatus; label: string }> = [
  { value: "NEW", label: "New" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "ARCHIVED", label: "Archived" },
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

const getStatusClass = (status: InquiryStatus) => {
  switch (status) {
    case "RESOLVED":
      return "bg-primary/10 text-primary";
    case "IN_PROGRESS":
      return "bg-secondary/15 text-secondary";
    case "ARCHIVED":
      return "bg-muted text-muted-foreground";
    default:
      return "bg-secondary/10 text-secondary";
  }
};

const InquiryManagement = () => {
  const [inquiries, setInquiries] = useState<InquiryRecord[]>([]);
  const [meta, setMeta] = useState<InquiryListMeta | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<InquiryStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<InquiryRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadInquiries = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getAdminInquiries({
        page,
        limit: 10,
        search,
        status,
      });
      setInquiries(result.data?.inquiries ?? []);
      setMeta(result.data?.meta ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load inquiries");
    } finally {
      setIsLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadInquiries();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadInquiries]);

  const totals = useMemo(() => {
    return inquiries.reduce(
      (acc, item) => {
        if (item.status === "NEW") acc.newCount += 1;
        if (item.status === "IN_PROGRESS") acc.inProgress += 1;
        if (item.status === "RESOLVED") acc.resolved += 1;
        return acc;
      },
      { newCount: 0, inProgress: 0, resolved: 0 },
    );
  }, [inquiries]);

  const handleStatusChange = async (
    item: InquiryRecord,
    nextStatus: InquiryStatus,
  ) => {
    setActionId(item.id);
    setError(null);
    setSuccess(null);

    try {
      const result = await updateInquiryStatus(item.id, { status: nextStatus });
      setSuccess(
        `Inquiry marked as ${nextStatus.replace("_", " ").toLowerCase()}`,
      );
      if (selected?.id === item.id && result.data?.inquiry) {
        setSelected(result.data.inquiry);
      }
      await loadInquiries();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update status");
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (item: InquiryRecord) => {
    if (!window.confirm(`Delete inquiry from "${item.name}"?`)) return;

    setActionId(item.id);
    setError(null);
    setSuccess(null);

    try {
      await deleteInquiry(item.id);
      setSuccess("Inquiry deleted successfully");
      if (selected?.id === item.id) setSelected(null);
      await loadInquiries();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete inquiry");
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
            Inquiry Management
          </p>
          <h1 className="mt-1 text-2xl font-bold text-foreground md:text-3xl">
            Dashboard inquiries
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Review contact form submissions and track inquiry resolution status.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={loadInquiries}
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
              Total inquiries
            </p>
            <Bell className="size-5 text-primary" />
          </div>
          <p className="mt-3 text-3xl font-bold text-foreground">
            {meta?.total ?? inquiries.length}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              New on page
            </p>
            <AlertCircle className="size-5 text-secondary" />
          </div>
          <p className="mt-3 text-3xl font-bold text-foreground">
            {totals.newCount}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              Resolved on page
            </p>
            <CheckCircle2 className="size-5 text-primary" />
          </div>
          <p className="mt-3 text-3xl font-bold text-foreground">
            {totals.resolved}
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
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search name, email, subject or message"
              className="h-10 pl-9"
            />
          </div>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as InquiryStatus | "ALL");
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
                <th className="px-4 py-3 font-semibold">Contact</th>
                <th className="px-4 py-3 font-semibold">Subject</th>
                <th className="px-4 py-3 font-semibold">Received</th>
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
                      Loading inquiries...
                    </div>
                  </td>
                </tr>
              ) : inquiries.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-16 text-center text-muted-foreground"
                  >
                    No inquiries found yet.
                  </td>
                </tr>
              ) : (
                inquiries.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-border last:border-b-0"
                  >
                    <td className="px-4 py-4">
                      <p className="font-semibold text-foreground">
                        {item.name}
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
                        {item.subject}
                      </p>
                      <p className="line-clamp-1 text-xs text-muted-foreground">
                        {item.company || "No company"}
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
                            e.target.value as InquiryStatus,
                          )
                        }
                        className={cn(selectClassName, "min-w-36")}
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
                  Inquiry detail
                </p>
                <h2 className="mt-1 text-xl font-bold text-foreground">
                  {selected.subject}
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
                    Name
                  </p>
                  <p className="text-foreground">{selected.name}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground">
                    Company
                  </p>
                  <p className="text-foreground">{selected.company || "—"}</p>
                </div>
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
                  <p className="text-xs font-bold text-muted-foreground">
                    Received
                  </p>
                  <p className="text-foreground">
                    {formatDate(selected.createdAt)}
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
                    {selected.status.replace("_", " ")}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-muted-foreground">
                  Message
                </p>
                <p className="mt-1 whitespace-pre-wrap rounded-lg border border-border bg-muted/30 p-3 text-foreground">
                  {selected.message}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
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

export default InquiryManagement;
