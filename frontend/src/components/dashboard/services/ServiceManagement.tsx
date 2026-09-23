"use client";

import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Wrench,
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
import type {
  BusinessCategory,
  CompanyRecord,
} from "@/features/companies/company.types";
import {
  createService,
  deleteService,
  getAdminServices,
  updateService,
} from "@/features/services/service.api";
import type {
  CreateServicePayload,
  ServiceListResponse,
  ServiceRecord,
  UpdateServicePayload,
} from "@/features/services/service.types";
import { cn } from "@/lib/utils";

type ServiceFormState = {
  id: string | null;
  companyId: string;
  title: string;
  slug: string;
  description: string;
  icon: string;
  image: string;
  displayOrder: string;
  isActive: boolean;
};

type ServiceListMeta = ServiceListResponse["meta"];

const businessCategories: Array<{ value: BusinessCategory; label: string }> = [
  { value: "MANAGEMENT_INVESTMENT", label: "Management & Investment" },
  { value: "CLEANING_SERVICES", label: "Cleaning Services" },
  { value: "ENGINEERING_MACHINERY", label: "Engineering & Machinery" },
  { value: "PLANTATION_AGRICULTURE", label: "Plantation & Agriculture" },
  { value: "RETAIL_TRADING", label: "Retail & Trading" },
  { value: "TRAVEL_TOURISM", label: "Travel & Tourism" },
];

const initialFormState: ServiceFormState = {
  id: null,
  companyId: "",
  title: "",
  slug: "",
  description: "",
  icon: "",
  image: "",
  displayOrder: "0",
  isActive: true,
};

const selectClassName =
  "h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const nullableText = (value: string) => value.trim() || null;

const getCategoryLabel = (value: BusinessCategory) => {
  return (
    businessCategories.find((category) => category.value === value)?.label ??
    value
  );
};

const ServiceManagement = () => {
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [companies, setCompanies] = useState<CompanyRecord[]>([]);
  const [meta, setMeta] = useState<ServiceListMeta | null>(null);
  const [search, setSearch] = useState("");
  const [companyId, setCompanyId] = useState<string | "ALL">("ALL");
  const [category, setCategory] = useState<BusinessCategory | "ALL">("ALL");
  const [isActive, setIsActive] = useState<"true" | "false" | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [formState, setFormState] =
    useState<ServiceFormState>(initialFormState);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionServiceId, setActionServiceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isEditing = Boolean(formState.id);

  const loadServices = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [serviceResult, companyResult] = await Promise.all([
        getAdminServices({
          page,
          limit: 10,
          search,
          companyId: companyId === "ALL" ? undefined : companyId,
          category,
          isActive,
        }),
        getAdminCompanies({ limit: 100 }),
      ]);

      setServices(serviceResult.data?.services ?? []);
      setMeta(serviceResult.data?.meta ?? null);
      setCompanies(companyResult.data?.companies ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load services");
    } finally {
      setIsLoading(false);
    }
  }, [category, companyId, isActive, page, search]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadServices();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadServices]);

  const totals = useMemo(() => {
    return services.reduce(
      (acc, service) => {
        if (service.isActive) acc.active += 1;
        else acc.inactive += 1;
        return acc;
      },
      { active: 0, inactive: 0 },
    );
  }, [services]);

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

  const handleEdit = (service: ServiceRecord) => {
    setFormState({
      id: service.id,
      companyId: service.companyId,
      title: service.title,
      slug: service.slug,
      description: service.description ?? "",
      icon: service.icon ?? "",
      image: service.image ?? "",
      displayOrder: String(service.displayOrder),
      isActive: service.isActive,
    });
    setFormError(null);
    setSuccess(null);
    setIsFormOpen(true);
  };

  const validateForm = () => {
    if (!formState.title.trim()) return "Service title is required";
    if (!formState.companyId) return "Company is required";
    if (
      formState.image.trim() &&
      !/^https?:\/\//.test(formState.image.trim())
    ) {
      return "Image must be a valid URL";
    }
    return null;
  };

  const buildPayload = (): CreateServicePayload | UpdateServicePayload => {
    const payload: CreateServicePayload = {
      companyId: formState.companyId,
      title: formState.title.trim(),
      slug: formState.slug.trim() || undefined,
      description: nullableText(formState.description),
      icon: nullableText(formState.icon),
      image: nullableText(formState.image),
      displayOrder: Number(formState.displayOrder) || 0,
      isActive: formState.isActive,
    };

    return payload;
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
        await updateService(formState.id, buildPayload());
        setSuccess("Service updated successfully");
      } else {
        await createService(buildPayload() as CreateServicePayload);
        setSuccess("Service created successfully");
      }

      closeForm();
      await loadServices();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Unable to save service",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (service: ServiceRecord) => {
    setActionServiceId(service.id);
    setError(null);
    setSuccess(null);

    try {
      await updateService(service.id, { isActive: !service.isActive });
      setSuccess(
        service.isActive
          ? "Service deactivated successfully"
          : "Service activated successfully",
      );
      await loadServices();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update service status",
      );
    } finally {
      setActionServiceId(null);
    }
  };

  const handleDelete = async (service: ServiceRecord) => {
    const confirmed = window.confirm(
      `Delete "${service.title}"? This action cannot be undone.`,
    );
    if (!confirmed) return;

    setActionServiceId(service.id);
    setError(null);
    setSuccess(null);

    try {
      await deleteService(service.id);
      setSuccess("Service deleted successfully");
      await loadServices();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete service");
    } finally {
      setActionServiceId(null);
    }
  };

  const totalPages = meta?.totalPage || 1;

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-secondary">
            Service Management
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-normal text-foreground md:text-3xl">
            Dashboard services
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Manage company services, visibility, ordering and public service
            content across the group.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={loadServices}
            disabled={isLoading}
          >
            <RefreshCw className={cn("size-4", isLoading && "animate-spin")} />
            Refresh
          </Button>
          <Button type="button" onClick={openCreateForm}>
            <Plus className="size-4" />
            Create Service
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              Total services
            </p>
            <Wrench className="size-5 text-primary" />
          </div>
          <p className="mt-3 text-3xl font-bold text-foreground">
            {meta?.total ?? services.length}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              Active on page
            </p>
            <HiDocumentCheck className="size-5 text-primary" />
          </div>
          <p className="mt-3 text-3xl font-bold text-foreground">
            {totals.active}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              Inactive on page
            </p>
            <FaPauseCircle className="size-5 text-secondary" />
          </div>
          <p className="mt-3 text-3xl font-bold text-foreground">
            {totals.inactive}
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
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search service, company or description"
              className="h-10 pl-9"
            />
          </div>

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
            value={isActive}
            onChange={(event) => {
              setIsActive(event.target.value as "true" | "false" | "ALL");
              setPage(1);
            }}
            className={selectClassName}
            aria-label="Filter by active status"
          >
            <option value="ALL">All status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Service</th>
                <th className="px-4 py-3 font-semibold">Company</th>
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
                      Loading services...
                    </div>
                  </td>
                </tr>
              ) : services.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-16 text-center text-muted-foreground"
                  >
                    No services found. Create the first service to get started.
                  </td>
                </tr>
              ) : (
                services.map((service) => (
                  <tr
                    key={service.id}
                    className="border-b border-border last:border-b-0"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted bg-cover bg-center text-muted-foreground"
                          style={
                            service.image
                              ? { backgroundImage: `url(${service.image})` }
                              : undefined
                          }
                        >
                          {!service.image && <Wrench className="size-5" />}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-foreground">
                            {service.title}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {service.slug}
                          </p>
                          {service.icon && (
                            <p className="truncate text-xs text-muted-foreground">
                              Icon: {service.icon}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-foreground">
                        {service.company?.name ?? "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {service.company
                          ? getCategoryLabel(service.company.category)
                          : "—"}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-foreground">
                      {service.displayOrder}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={cn(
                          "rounded-full px-2 py-1 text-xs font-semibold",
                          service.isActive
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {service.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          onClick={() => handleEdit(service)}
                          aria-label="Edit service"
                        >
                          <FaEdit className="size-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          disabled={actionServiceId === service.id}
                          onClick={() => void handleToggleActive(service)}
                          aria-label={
                            service.isActive
                              ? "Deactivate service"
                              : "Activate service"
                          }
                        >
                          {service.isActive ? (
                            <FaPauseCircle className="size-3.5" />
                          ) : (
                            <MdCheckBox className="size-4" />
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon-sm"
                          disabled={actionServiceId === service.id}
                          onClick={() => void handleDelete(service)}
                          aria-label="Delete service"
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
                  {isEditing ? "Edit service" : "Create service"}
                </p>
                <h2 className="mt-1 text-xl font-bold text-foreground">
                  {isEditing ? "Update service details" : "Add a new service"}
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
                    htmlFor="service-title"
                    className="mb-1.5 block text-xs font-bold text-foreground"
                  >
                    Service Title
                  </label>
                  <Input
                    id="service-title"
                    value={formState.title}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        title: event.target.value,
                      }))
                    }
                    placeholder="Service title"
                    className="h-10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="service-slug"
                    className="mb-1.5 block text-xs font-bold text-foreground"
                  >
                    Slug
                  </label>
                  <Input
                    id="service-slug"
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
                    htmlFor="service-company"
                    className="mb-1.5 block text-xs font-bold text-foreground"
                  >
                    Company
                  </label>
                  <select
                    id="service-company"
                    value={formState.companyId}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        companyId: event.target.value,
                      }))
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
                  <label
                    htmlFor="service-icon"
                    className="mb-1.5 block text-xs font-bold text-foreground"
                  >
                    Icon name
                  </label>
                  <Input
                    id="service-icon"
                    value={formState.icon}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        icon: event.target.value,
                      }))
                    }
                    placeholder="e.g. briefcase, wrench"
                    className="h-10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="service-order"
                    className="mb-1.5 block text-xs font-bold text-foreground"
                  >
                    Display order
                  </label>
                  <Input
                    id="service-order"
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
                  <label
                    htmlFor="service-image"
                    className="mb-1.5 block text-xs font-bold text-foreground"
                  >
                    Image URL
                  </label>
                  <Input
                    id="service-image"
                    value={formState.image}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        image: event.target.value,
                      }))
                    }
                    placeholder="https://..."
                    className="h-10"
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="service-description"
                    className="mb-1.5 block text-xs font-bold text-foreground"
                  >
                    Description
                  </label>
                  <textarea
                    id="service-description"
                    value={formState.description}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    placeholder="Service description"
                    rows={4}
                    className="min-h-24 w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  />
                </div>

                <div className="flex items-center gap-2 md:col-span-2">
                  <input
                    id="service-active"
                    type="checkbox"
                    checked={formState.isActive}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        isActive: event.target.checked,
                      }))
                    }
                    className="size-4 rounded border-input text-primary"
                  />
                  <label
                    htmlFor="service-active"
                    className="text-sm font-medium text-foreground"
                  >
                    Active (visible on public site)
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
                  {isEditing ? "Save Changes" : "Create Service"}
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

export default ServiceManagement;
