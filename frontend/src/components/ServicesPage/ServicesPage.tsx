"use client";

import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  Filter,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import AboutBanner from "@/components/About/AboutBanner/AboutBanner";
import Pagination from "@/components/common/Pagination";
import type { BusinessCategory } from "@/features/companies/company.types";
import { getPublishedServices } from "@/features/services/service.api";
import type { ServiceRecord } from "@/features/services/service.types";

const categories: Array<{ value: BusinessCategory | "ALL"; label: string }> = [
  { value: "ALL", label: "All" },
  { value: "MANAGEMENT_INVESTMENT", label: "Management & Investment" },
  { value: "CLEANING_SERVICES", label: "Cleaning Services" },
  { value: "ENGINEERING_MACHINERY", label: "Engineering & Machinery" },
  { value: "PLANTATION_AGRICULTURE", label: "Plantation & Agriculture" },
  { value: "RETAIL_TRADING", label: "Retail & Trading" },
  { value: "TRAVEL_TOURISM", label: "Travel & Tourism" },
];

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<
    BusinessCategory | "ALL"
  >("ALL");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ page: 1, total: 0, totalPage: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getPublishedServices({
          page,
          limit: 9,
          category: selectedCategory,
        });
        setServices(result.data?.services ?? []);
        setMeta(result.data?.meta ?? { page, total: 0, totalPage: 1 });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load services",
        );
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, [page, selectedCategory]);

  const changeCategory = (category: BusinessCategory | "ALL") => {
    setSelectedCategory(category);
    setIsFilterOpen(false);
    setPage(1);
  };

  const selectedLabel =
    categories.find((category) => category.value === selectedCategory)?.label ??
    "All";

  return (
    <div>
      {/* Banner */}
      <AboutBanner
        title="Our Services"
        description="Explore the range of professional services delivered across AM Management Group and its sister companies."
      />
      <div className="min-h-screen bg-muted/30 py-10 sm:py-12">
        <div className="container-am">
          <section className="relative z-10 mb-10">
            <div className="hidden items-center justify-center gap-2.5 lg:flex">
              {categories.map((category) => (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => changeCategory(category.value)}
                  className={
                    selectedCategory === category.value
                      ? "rounded-full border border-primary bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm"
                      : "rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  }
                >
                  {category.label}
                </button>
              ))}
            </div>

            <div className="relative lg:hidden">
              <button
                type="button"
                aria-expanded={isFilterOpen}
                onClick={() => setIsFilterOpen((open) => !open)}
                className={
                  selectedCategory !== "ALL"
                    ? "flex h-12 w-full md:w-50 items-center justify-between rounded-xl border border-primary bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm"
                    : "flex h-12 w-full md:w-50 items-center justify-between rounded-xl border border-border bg-card px-4 text-sm font-semibold text-foreground shadow-sm"
                }
              >
                <span className="flex items-center gap-2">
                  <Filter className="size-4" />
                  {selectedLabel}
                </span>
                <ChevronDown
                  className={
                    isFilterOpen
                      ? "size-4 rotate-180 transition-transform"
                      : "size-4 transition-transform"
                  }
                />
              </button>

              {isFilterOpen && (
                <div className="absolute inset-x-0 top-full mt-2 overflow-hidden rounded-xl border border-border bg-card p-2 shadow-xl">
                  {categories.map((category) => (
                    <button
                      key={category.value}
                      type="button"
                      onClick={() => changeCategory(category.value)}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      {category.label}
                      {selectedCategory === category.value && (
                        <Check className="size-4 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>

          {isLoading ? (
            <div className="flex min-h-64 flex-col items-center justify-center text-muted-foreground">
              <Loader2 className="mb-3 size-8 animate-spin text-primary" />
              <p className="text-sm">Loading services...</p>
            </div>
          ) : error ? (
            <div className="mx-auto flex max-w-xl items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-5 shrink-0" />
              <p>{error}</p>
            </div>
          ) : services.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
              No published services found.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {services.map((service) => (
                  <article
                    key={service.id}
                    className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="relative aspect-[16/10] bg-muted">
                      {service.image ? (
                        <Image
                          src={service.image}
                          alt={service.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-primary">
                          <BriefcaseBusiness className="size-10" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-5 sm:p-6">
                      <p className="text-xs font-semibold uppercase tracking-wide text-secondary">
                        {service.company?.name ?? "AM Management Group"}
                      </p>
                      <h3 className="mt-2 line-clamp-2 text-xl font-bold text-foreground">
                        {service.title}
                      </h3>
                      <p className="mt-3 flex-1 text-sm leading-7 text-muted-foreground">
                        {service.description ||
                          "Professional service offered by our group companies."}
                      </p>
                      {service.company?.slug && (
                        <Link
                          href={"/companies/" + service.company.slug}
                          className="mt-5 inline-flex text-sm font-semibold text-primary hover:underline"
                        >
                          View company
                        </Link>
                      )}
                    </div>
                  </article>
                ))}
              </div>
              <Pagination
                page={meta.page}
                totalPages={meta.totalPage}
                total={meta.total}
                onPageChange={setPage}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
