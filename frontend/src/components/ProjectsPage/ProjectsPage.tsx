"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, ChevronDown, Check, Filter, Loader2 } from "lucide-react";
import AboutBanner from "../About/AboutBanner/AboutBanner";
import Pagination from "@/components/common/Pagination";
import type { BusinessCategory } from "@/features/companies/company.types";
import { getPublishedProjects } from "@/features/projects/project.api";
import {
  getProjectCategoryLabel,
  getProjectStatusLabel,
  projectCategoryLabels,
  projectStatusLabels,
} from "@/features/projects/project-display";
import type {
  ProjectRecord,
  ProjectStatus,
} from "@/features/projects/project.types";
import ProjectCard from "./ProjectCard";
import ProjectInsights from "./ProjectInsights";

type StatusFilter = "ALL" | ProjectStatus;
type IndustryFilter = "ALL" | BusinessCategory;

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>("ALL");
  const [selectedIndustry, setSelectedIndustry] =
    useState<IndustryFilter>("ALL");
  const [isIndustryOpen, setIsIndustryOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ page: 1, total: 0, totalPage: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getPublishedProjects({
          page,
          limit: 9,
          status: selectedStatus,
          category: selectedIndustry,
        });
        setProjects(result.data?.projects ?? []);
        setMeta(result.data?.meta ?? { page, total: 0, totalPage: 1 });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load projects",
        );
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, [page, selectedStatus, selectedIndustry]);

  const statusFilters = useMemo(
    () => [{ value: "ALL" as const, label: "All" }, ...projectStatusLabels],
    [],
  );
  const selectedIndustryLabel =
    selectedIndustry === "ALL"
      ? "All Categories"
      : getProjectCategoryLabel(selectedIndustry);
  const emptyLabel =
    selectedStatus !== "ALL"
      ? getProjectStatusLabel(selectedStatus)
      : selectedIndustry !== "ALL"
        ? getProjectCategoryLabel(selectedIndustry)
        : "this page";

  const updateStatus = (status: StatusFilter) => {
    setSelectedStatus(status);
    setPage(1);
  };

  const updateIndustry = (industry: IndustryFilter) => {
    setSelectedIndustry(industry);
    setIsIndustryOpen(false);
    setPage(1);
  };

  return (
    <div>
      <AboutBanner
        title="Our Projects"
        description="A proven track record of structural excellence, sub-contracting precision, and quality housing developments."
      />
      <div className="min-h-screen bg-slate-50 py-10 sm:py-12">
        <div className="container-am">
          <ProjectInsights />
          <section className="relative z-10 mb-10 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                  Satus
                </p>
                <div className="flex flex-wrap gap-2">
                  {statusFilters.map((filter) => (
                    <button
                      key={filter.value}
                      type="button"
                      onClick={() => updateStatus(filter.value)}
                      className={
                        selectedStatus === filter.value
                          ? "rounded-full border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm"
                          : "rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition-all hover:border-slate-400 hover:text-slate-900"
                      }
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative w-full lg:w-auto">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                  Categories
                </p>
                <button
                  type="button"
                  aria-expanded={isIndustryOpen}
                  onClick={() => setIsIndustryOpen((open) => !open)}
                  className={
                    selectedIndustry !== "ALL"
                      ? "flex h-11 w-full items-center justify-between gap-5 rounded-lg border border-slate-900 bg-slate-900 px-4 text-left text-sm font-semibold text-white sm:min-w-64 lg:w-72"
                      : "flex h-11 w-full items-center justify-between gap-5 rounded-lg border border-slate-200 bg-white px-4 text-left text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 sm:min-w-64 lg:w-72"
                  }
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <Filter className="size-4 shrink-0" />
                    <span className="truncate">{selectedIndustryLabel}</span>
                  </span>
                  <ChevronDown
                    className={
                      isIndustryOpen
                        ? "size-4 shrink-0 rotate-180 transition-transform"
                        : "size-4 shrink-0 transition-transform"
                    }
                  />
                </button>

                {isIndustryOpen && (
                  <div className="absolute right-0 top-full mt-2 w-full min-w-64 overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-xl sm:w-72">
                    <button
                      type="button"
                      onClick={() => updateIndustry("ALL")}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                    >
                      All Categories
                      {selectedIndustry === "ALL" && (
                        <Check className="size-4 text-slate-900" />
                      )}
                    </button>
                    {projectCategoryLabels.map((industry) => (
                      <button
                        key={industry.value}
                        type="button"
                        onClick={() => updateIndustry(industry.value)}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <span>{industry.label}</span>
                        {selectedIndustry === industry.value && (
                          <Check className="size-4 text-slate-900" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {isLoading ? (
            <div className="flex min-h-64 flex-col items-center justify-center text-slate-500">
              <Loader2 className="mb-3 size-8 animate-spin text-slate-900" />
              <p className="text-sm">Loading projects...</p>
            </div>
          ) : error ? (
            <div className="mx-auto flex max-w-xl items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              <AlertCircle className="mt-0.5 size-5 shrink-0" />
              <p>{error}</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">
              No published projects found for {emptyLabel}.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <ProjectCard key={project.slug} project={project} />
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
