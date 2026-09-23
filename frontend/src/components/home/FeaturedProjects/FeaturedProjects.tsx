"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Building2, Loader2, MapPin } from "lucide-react";
import SectionHeader from "@/components/theme/SectionHeader";
import { useEffect, useMemo, useState } from "react";
import {
  getProjectCategoryLabel,
  getProjectImage,
  getProjectStatusLabel,
  projectFallbackImage,
} from "@/features/projects/project-display";
import { getPublishedProjects } from "@/features/projects/project.api";
import type {
  ProjectRecord,
  ProjectStatus,
} from "@/features/projects/project.types";

type StatusFilter = "ALL" | "COMPLETED" | "ONGOING";

const statusTabs: Array<{ value: StatusFilter; label: string }> = [
  { value: "ALL", label: "All" },
  { value: "COMPLETED", label: "Completed" },
  { value: "ONGOING", label: "Ongoing" },
];

export default function FeaturedProjects({
  initialProjects,
}: {
  initialProjects?: ProjectRecord[];
}) {
  const hasInitialData = initialProjects !== undefined;
  const [projects, setProjects] = useState<ProjectRecord[]>(initialProjects ?? []);
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const [isLoading, setIsLoading] = useState(!hasInitialData);

  useEffect(() => {
    if (hasInitialData) return;

    const loadProjects = async () => {
      setIsLoading(true);

      try {
        const featuredResult = await getPublishedProjects({
          limit: 12,
          featured: "true",
        });

        let list = featuredResult.data?.projects ?? [];

        if (list.length === 0) {
          const allResult = await getPublishedProjects({ limit: 6 });
          list = allResult.data?.projects ?? [];
        }

        setProjects(list);
      } catch {
        setProjects([]);
      } finally {
        setIsLoading(false);
      }
    };

    void loadProjects();
  }, [hasInitialData]);

  const filteredProjects = useMemo(() => {
    if (filter === "ALL") return projects.slice(0, 6);
    return projects.filter((project) => project.status === filter).slice(0, 6);
  }, [filter, projects]);

  const getStatusBadgeClass = (status: ProjectStatus) => {
    if (status === "COMPLETED") return "bg-white text-primary";
    if (status === "ONGOING") return "bg-secondary text-white";
    return "bg-[var(--am-harbour)] text-white";
  };

  return (
    <section className="bg-white py-12 lg:py-16" aria-labelledby="projects-title">
      <div className="container-am">
        <SectionHeader
          kicker="Selected work"
          title={<span id="projects-title">Featured Projects & Achievements</span>}
          intro="A showcase of our landmark real estate developments, infrastructure construction, and high-value sub-contract engineering works across Malaysia."
          action={
            <div role="tablist" aria-label="Filter projects by status" className="flex items-center gap-1 rounded-md bg-[var(--am-steel)] p-1">
              {statusTabs.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  role="tab"
                  aria-selected={filter === tab.value}
                  onClick={() => setFilter(tab.value)}
                  className={`cursor-pointer rounded px-4 py-2 text-sm font-semibold transition-colors ${
                    filter === tab.value
                      ? "bg-[var(--am-harbour)] text-white"
                      : "text-muted-foreground hover:text-[var(--am-harbour)]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          }
        />

        {isLoading ? (
          <div className="flex min-h-64 flex-col items-center justify-center text-muted-foreground">
            <Loader2 className="mb-3 size-8 animate-spin text-primary" />
            <p className="text-sm">Loading featured projects...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-[var(--am-steel)] p-10 text-center text-muted-foreground">
            No featured projects available
            {filter !== "ALL" ? ` for ${getProjectStatusLabel(filter)}` : ""} yet.
          </div>
        ) : (
          <div data-reveal-stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <ProjectTile
                key={project.id}
                project={project}
                badgeClass={getStatusBadgeClass(project.status)}
              />
            ))}
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <Link
            href="/projects"
            className="group inline-flex h-12 items-center gap-2 rounded-md border-2 border-[var(--am-harbour)] px-6 text-sm font-bold text-[var(--am-harbour)] transition-colors hover:bg-[var(--am-harbour)] hover:text-white"
          >
            View All Projects
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function ProjectTile({
  project,
  badgeClass,
}: {
  project: ProjectRecord;
  badgeClass: string;
}) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="am-lift group relative block aspect-[4/3] overflow-hidden rounded-lg bg-[var(--am-harbour)]"
    >
      <Image
        src={getProjectImage(project) || projectFallbackImage}
        alt={project.name}
        fill
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        className="object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[rgb(15_36_71/0.95)] via-[rgb(15_36_71/0.35)] to-transparent" />

      <span className={`absolute left-4 top-4 rounded px-2.5 py-1 text-xs font-bold ${badgeClass}`}>
        {getProjectStatusLabel(project.status)}
      </span>
      <span className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-colors group-hover:bg-secondary">
        <ArrowUpRight className="size-4" />
      </span>

      <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
        <p className="text-xs font-semibold text-secondary">
          {getProjectCategoryLabel(project.category)}
        </p>
        <h3 className="mt-2 text-lg font-semibold leading-tight">
          {project.name}
        </h3>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-white/75">
          {project.clientName && (
            <span className="inline-flex items-center gap-1.5">
              <Building2 className="size-4 text-secondary" />
              {project.clientName}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-4 text-secondary" />
            {project.location || "Malaysia"}
          </span>
        </div>
      </div>
    </Link>
  );
}
