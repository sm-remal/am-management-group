"use client";

import Link from "next/link";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Crown,
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
import { IoEyeSharp, IoSettingsSharp } from "react-icons/io5";
import { MdCheckBox } from "react-icons/md";
import Pagination from "@/components/common/Pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createCompany,
  deleteCompany,
  getAdminCompanies,
  notifyCompanyDataUpdated,
  updateCompany,
} from "@/features/companies/company.api";
import type {
  BusinessCategory,
  CompanyListResponse,
  CompanyRecord,
  CreateCompanyPayload,
  PublishStatus,
  UpdateCompanyPayload,
} from "@/features/companies/company.types";
import { cn } from "@/lib/utils";

type CompanyFormState = {
  id: string | null;
  name: string;
  slug: string;
  category: BusinessCategory;
  isMainCompany: boolean;
  shortDescription: string;
  description: string;
  logo: string;
  coverImage: string;
  registrationNumber: string;
  establishedDate: string;
  address: string;
  phone: string;
  email: string;
  businessHours: string;
  seoTitle: string;
  seoDescription: string;
  displayOrder: string;
  status: PublishStatus;
};

type CompanyListMeta = CompanyListResponse["meta"];

const businessCategories: Array<{ value: BusinessCategory; label: string }> = [
  { value: "MANAGEMENT_INVESTMENT", label: "Management & Investment" },
  { value: "CLEANING_SERVICES", label: "Cleaning Services" },
  { value: "ENGINEERING_MACHINERY", label: "Engineering & Machinery" },
  { value: "PLANTATION_AGRICULTURE", label: "Plantation & Agriculture" },
  { value: "RETAIL_TRADING", label: "Retail & Trading" },
  { value: "TRAVEL_TOURISM", label: "Travel & Tourism" },
];

const publishStatuses: Array<{ value: PublishStatus; label: string }> = [
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
  { value: "ARCHIVED", label: "Archived" },
];

const initialFormState: CompanyFormState = {
  id: null,
  name: "",
  slug: "",
  category: "MANAGEMENT_INVESTMENT",
  isMainCompany: false,
  shortDescription: "",
  description: "",
  logo: "",
  coverImage: "",
  registrationNumber: "",
  establishedDate: "",
  address: "",
  phone: "",
  email: "",
  businessHours: "",
  seoTitle: "",
  seoDescription: "",
  displayOrder: "0",
  status: "DRAFT",
};

const selectClassName =
  "h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const nullableText = (value: string) => value.trim() || null;
const optionalText = (value: string) => value.trim() || undefined;

const getCategoryLabel = (value: BusinessCategory) => {
  return (
    businessCategories.find((category) => category.value === value)?.label ??
    value
  );
};

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

const CompanyManagement = () => {
  const [companies, setCompanies] = useState<CompanyRecord[]>([]);
  const [meta, setMeta] = useState<CompanyListMeta | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<BusinessCategory | "ALL">("ALL");
  const [status, setStatus] = useState<PublishStatus | "ALL">("ALL");
  const [isMainCompany, setIsMainCompany] = useState<"true" | "false" | "ALL">(
    "ALL",
  );
  const [page, setPage] = useState(1);
  const [formState, setFormState] =
    useState<CompanyFormState>(initialFormState);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionCompanyId, setActionCompanyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isEditing = Boolean(formState.id);

  const loadCompanies = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getAdminCompanies({
        page,
        limit: 10,
        search,
        category,
        status,
        isMainCompany,
      });

      setCompanies(result.data?.companies ?? []);
      setMeta(result.data?.meta ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load companies");
    } finally {
      setIsLoading(false);
    }
  }, [category, isMainCompany, page, search, status]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadCompanies();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadCompanies]);

  const totals = useMemo(() => {
    return companies.reduce(
      (acc, company) => {
        if (company.status === "PUBLISHED") acc.published += 1;
        if (company.isMainCompany) acc.main += 1;
        acc.projects += company._count?.projects ?? 0;
        acc.services += company._count?.services ?? 0;
        return acc;
      },
      { published: 0, main: 0, projects: 0, services: 0 },
    );
  }, [companies]);

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

  const handleEdit = (company: CompanyRecord) => {
    setFormState({
      id: company.id,
      name: company.name,
      slug: company.slug,
      category: company.category,
      isMainCompany: company.isMainCompany,
      shortDescription: company.shortDescription ?? "",
      description: company.description ?? "",
      logo: company.logo ?? "",
      coverImage: company.coverImage ?? "",
      registrationNumber: company.registrationNumber ?? "",
      establishedDate: toDateInputValue(company.establishedDate),
      address: company.address ?? "",
      phone: company.phone ?? "",
      email: company.email ?? "",
      businessHours: company.businessHours ?? "",
      seoTitle: company.seoTitle ?? "",
      seoDescription: company.seoDescription ?? "",
      displayOrder: String(company.displayOrder),
      status: company.status,
    });
    setFormError(null);
    setSuccess(null);
    setIsFormOpen(true);
  };

  const validateForm = () => {
    if (!formState.name.trim()) return "Company name is required";
    if (formState.logo.trim() && !/^https?:\/\//.test(formState.logo.trim()))
      return "Logo must be a valid URL";
    if (
      formState.coverImage.trim() &&
      !/^https?:\/\//.test(formState.coverImage.trim())
    ) {
      return "Cover image must be a valid URL";
    }

    return null;
  };

  const buildPayload = (): CreateCompanyPayload => ({
    name: formState.name.trim(),
    slug: optionalText(formState.slug),
    category: formState.category,
    isMainCompany: formState.isMainCompany,
    shortDescription: nullableText(formState.shortDescription),
    description: nullableText(formState.description),
    logo: nullableText(formState.logo),
    coverImage: nullableText(formState.coverImage),
    registrationNumber: nullableText(formState.registrationNumber),
    establishedDate: formState.establishedDate || null,
    address: nullableText(formState.address),
    phone: nullableText(formState.phone),
    email: nullableText(formState.email),
    businessHours: nullableText(formState.businessHours),
    seoTitle: nullableText(formState.seoTitle),
    seoDescription: nullableText(formState.seoDescription),
    displayOrder: Number(formState.displayOrder) || 0,
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
    setError(null);
    setSuccess(null);

    try {
      if (isEditing && formState.id) {
        await updateCompany(
          formState.id,
          buildPayload() as UpdateCompanyPayload,
        );
        setSuccess("Company updated successfully");
      } else {
        await createCompany(buildPayload());
        setSuccess("Company created successfully");
      }

      notifyCompanyDataUpdated();
      closeForm();
      await loadCompanies();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Unable to save company",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (
    company: CompanyRecord,
    nextStatus: PublishStatus,
  ) => {
    setActionCompanyId(company.id);
    setError(null);
    setSuccess(null);

    try {
      await updateCompany(company.id, { status: nextStatus });
      notifyCompanyDataUpdated();
      setSuccess(
        nextStatus === "PUBLISHED"
          ? "Company published successfully"
          : nextStatus === "ARCHIVED"
            ? "Company archived successfully"
            : "Company unpublished successfully",
      );
      await loadCompanies();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update company status",
      );
    } finally {
      setActionCompanyId(null);
    }
  };

  const handleMainCompany = async (company: CompanyRecord) => {
    setActionCompanyId(company.id);
    setError(null);
    setSuccess(null);

    try {
      await updateCompany(company.id, { isMainCompany: true });
      notifyCompanyDataUpdated();
      setSuccess("Main company updated successfully");
      await loadCompanies();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update main company",
      );
    } finally {
      setActionCompanyId(null);
    }
  };

  const handleDelete = async (company: CompanyRecord) => {
    const confirmed = window.confirm(
      `Delete "${company.name}"? This action cannot be undone.`,
    );
    if (!confirmed) return;

    setActionCompanyId(company.id);
    setError(null);
    setSuccess(null);

    try {
      await deleteCompany(company.id);
      notifyCompanyDataUpdated();
      setSuccess("Company deleted successfully");
      await loadCompanies();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete company");
    } finally {
      setActionCompanyId(null);
    }
  };

  const totalPages = meta?.totalPage || 1;

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#fb731f]">
            Company Management
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-normal text-slate-950 md:text-3xl">
            Dashboard companies
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Manage company profiles, brand assets, publishing state, main
            company selection and public company content.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={loadCompanies}
            disabled={isLoading}
          >
            <RefreshCw className={cn("size-4", isLoading && "animate-spin")} />
            Refresh
          </Button>
          <Button type="button" onClick={openCreateForm}>
            <Plus className="size-4" />
            Create Company
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Total companies
            </p>
            <Building2 className="size-5 text-[#234279]" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-950">
            {meta?.total ?? companies.length}
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
              Projects linked
            </p>
            <Crown className="size-5 text-blue-600" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-950">
            {totals.projects}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Services linked
            </p>
            <IoSettingsSharp className="size-5 text-[#fb731f]" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-950">
            {totals.services}
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
        <div className="grid gap-3 border-b border-slate-200 p-4 xl:grid-cols-[minmax(0,1fr)_13rem_11rem_10rem]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search company, email, phone or description"
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
              setStatus(event.target.value as PublishStatus | "ALL");
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
            value={isMainCompany}
            onChange={(event) => {
              setIsMainCompany(event.target.value as "true" | "false" | "ALL");
              setPage(1);
            }}
            className={selectClassName}
            aria-label="Filter by main company"
          >
            <option value="ALL">All types</option>
            <option value="true">Main only</option>
            <option value="false">Subsidiary</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Company</th>
                <th className="px-4 py-3 font-semibold">Contact</th>
                <th className="px-4 py-3 font-semibold">Content</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Established</th>
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
                    Loading companies...
                  </td>
                </tr>
              ) : companies.length ? (
                companies.map((company) => (
                  <tr key={company.id} className="align-middle">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-slate-100 bg-cover bg-center text-slate-400"
                          style={
                            company.logo
                              ? { backgroundImage: `url(${company.logo})` }
                              : undefined
                          }
                        >
                          {!company.logo && <Building2 className="size-5" />}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-950">
                            {company.name}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            {getCategoryLabel(company.category)}
                          </p>
                          <p className="truncate text-xs text-slate-400">
                            {company.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-slate-900">
                        {company.email || "No email"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {company.phone || "No phone"}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-slate-900">
                        {company._count?.services ?? 0} services /{" "}
                        {company._count?.projects ?? 0} projects
                      </p>
                      <p className="text-xs text-slate-500">
                        {company._count?.galleryImages ?? 0} gallery images
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={cn(
                          "rounded-full px-2 py-1 text-xs font-semibold",
                          company.status === "PUBLISHED"
                            ? "bg-emerald-50 text-emerald-700"
                            : company.status === "ARCHIVED"
                              ? "bg-slate-100 text-slate-600"
                              : "bg-amber-50 text-amber-700",
                        )}
                      >
                        {company.status}
                      </span>
                      {company.isMainCompany && (
                        <span className="ml-2 rounded-full bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-700">
                          Main
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-slate-500">
                      <p>{formatDate(company.establishedDate)}</p>
                      <p className="text-xs">Order {company.displayOrder}</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/companies/${company.slug}`}
                          target="_blank"
                          className="inline-flex size-7 items-center justify-center rounded-lg border border-border bg-background text-sm font-medium text-foreground shadow-xs transition-all hover:bg-muted"
                          aria-label={`View ${company.name}`}
                        >
                          <IoEyeSharp className="size-4" />
                        </Link>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          onClick={() => handleEdit(company)}
                          aria-label="Edit company"
                        >
                          <FaEdit className="size-3.5" />
                        </Button>
                        {company.status === "PUBLISHED" ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            disabled={actionCompanyId === company.id}
                            onClick={() =>
                              void handleStatusChange(company, "DRAFT")
                            }
                            aria-label="Unpublish company"
                          >
                            <FaPauseCircle className="size-3.5" />
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            disabled={actionCompanyId === company.id}
                            onClick={() =>
                              void handleStatusChange(company, "PUBLISHED")
                            }
                            aria-label="Publish company"
                          >
                            <MdCheckBox className="size-4" />
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          disabled={
                            actionCompanyId === company.id ||
                            company.isMainCompany
                          }
                          onClick={() => void handleMainCompany(company)}
                          aria-label="Set as main company"
                        >
                          <HiDocumentCheck className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          disabled={actionCompanyId === company.id}
                          onClick={() =>
                            void handleStatusChange(company, "ARCHIVED")
                          }
                          aria-label="Archive company"
                        >
                          <IoSettingsSharp className="size-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon-sm"
                          disabled={actionCompanyId === company.id}
                          onClick={() => void handleDelete(company)}
                          aria-label="Delete company"
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
                    No companies found
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
          aria-labelledby="company-form-title"
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
                  id="company-form-title"
                  className="text-base font-bold text-slate-950"
                >
                  {isEditing ? "Edit company" : "Create company"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {isEditing
                    ? "Update company profile and publishing controls."
                    : "Add a new company profile."}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={closeForm}
                aria-label="Close company form"
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
                  htmlFor="company-name"
                  className="mb-1.5 block text-xs font-bold text-slate-700"
                >
                  Company Name
                </label>
                <Input
                  id="company-name"
                  value={formState.name}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Company name"
                  className="h-10"
                />
              </div>

              <div>
                <label
                  htmlFor="company-slug"
                  className="mb-1.5 block text-xs font-bold text-slate-700"
                >
                  Slug
                </label>
                <Input
                  id="company-slug"
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
                  htmlFor="company-category"
                  className="mb-1.5 block text-xs font-bold text-slate-700"
                >
                  Category
                </label>
                <select
                  id="company-category"
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
                  htmlFor="company-status"
                  className="mb-1.5 block text-xs font-bold text-slate-700"
                >
                  Publish Status
                </label>
                <select
                  id="company-status"
                  value={formState.status}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      status: event.target.value as PublishStatus,
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
                  htmlFor="company-logo"
                  className="mb-1.5 block text-xs font-bold text-slate-700"
                >
                  Logo URL
                </label>
                <Input
                  id="company-logo"
                  value={formState.logo}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      logo: event.target.value,
                    }))
                  }
                  placeholder="https://example.com/logo.png"
                  className="h-10"
                />
              </div>

              <div>
                <label
                  htmlFor="company-cover"
                  className="mb-1.5 block text-xs font-bold text-slate-700"
                >
                  Cover Image URL
                </label>
                <Input
                  id="company-cover"
                  value={formState.coverImage}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      coverImage: event.target.value,
                    }))
                  }
                  placeholder="https://example.com/cover.jpg"
                  className="h-10"
                />
              </div>

              <div>
                <label
                  htmlFor="company-email"
                  className="mb-1.5 block text-xs font-bold text-slate-700"
                >
                  Email
                </label>
                <Input
                  id="company-email"
                  type="email"
                  value={formState.email}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  placeholder="company@example.com"
                  className="h-10"
                />
              </div>

              <div>
                <label
                  htmlFor="company-phone"
                  className="mb-1.5 block text-xs font-bold text-slate-700"
                >
                  Phone
                </label>
                <Input
                  id="company-phone"
                  value={formState.phone}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      phone: event.target.value,
                    }))
                  }
                  placeholder="+60 12-345 6789"
                  className="h-10"
                />
              </div>

              <div>
                <label
                  htmlFor="company-registration"
                  className="mb-1.5 block text-xs font-bold text-slate-700"
                >
                  Registration Number
                </label>
                <Input
                  id="company-registration"
                  value={formState.registrationNumber}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      registrationNumber: event.target.value,
                    }))
                  }
                  placeholder="Company registration"
                  className="h-10"
                />
              </div>

              <div>
                <label
                  htmlFor="company-established"
                  className="mb-1.5 block text-xs font-bold text-slate-700"
                >
                  Established Date
                </label>
                <Input
                  id="company-established"
                  type="date"
                  value={formState.establishedDate}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      establishedDate: event.target.value,
                    }))
                  }
                  className="h-10"
                />
              </div>

              <div>
                <label
                  htmlFor="company-hours"
                  className="mb-1.5 block text-xs font-bold text-slate-700"
                >
                  Business Hours
                </label>
                <Input
                  id="company-hours"
                  value={formState.businessHours}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      businessHours: event.target.value,
                    }))
                  }
                  placeholder="Mon-Fri, 9:00 AM - 6:00 PM"
                  className="h-10"
                />
              </div>

              <div>
                <label
                  htmlFor="company-display-order"
                  className="mb-1.5 block text-xs font-bold text-slate-700"
                >
                  Display Order
                </label>
                <Input
                  id="company-display-order"
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

              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formState.isMainCompany}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        isMainCompany: event.target.checked,
                      }))
                    }
                    className="size-4 rounded border-slate-300"
                  />
                  Main company
                </label>
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="company-address"
                  className="mb-1.5 block text-xs font-bold text-slate-700"
                >
                  Address
                </label>
                <textarea
                  id="company-address"
                  value={formState.address}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      address: event.target.value,
                    }))
                  }
                  placeholder="Company address"
                  rows={3}
                  className="min-h-20 w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="company-short-description"
                  className="mb-1.5 block text-xs font-bold text-slate-700"
                >
                  Short Description
                </label>
                <textarea
                  id="company-short-description"
                  value={formState.shortDescription}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      shortDescription: event.target.value,
                    }))
                  }
                  placeholder="Short company overview"
                  rows={3}
                  className="min-h-20 w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="company-description"
                  className="mb-1.5 block text-xs font-bold text-slate-700"
                >
                  Description
                </label>
                <textarea
                  id="company-description"
                  value={formState.description}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Full company description"
                  rows={4}
                  className="min-h-24 w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>

              <div>
                <label
                  htmlFor="company-seo-title"
                  className="mb-1.5 block text-xs font-bold text-slate-700"
                >
                  SEO Title
                </label>
                <Input
                  id="company-seo-title"
                  value={formState.seoTitle}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      seoTitle: event.target.value,
                    }))
                  }
                  placeholder="SEO title"
                  className="h-10"
                />
              </div>

              <div>
                <label
                  htmlFor="company-seo-description"
                  className="mb-1.5 block text-xs font-bold text-slate-700"
                >
                  SEO Description
                </label>
                <Input
                  id="company-seo-description"
                  value={formState.seoDescription}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      seoDescription: event.target.value,
                    }))
                  }
                  placeholder="SEO description"
                  className="h-10"
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
                {isEditing ? "Save Changes" : "Create Company"}
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

export default CompanyManagement;
