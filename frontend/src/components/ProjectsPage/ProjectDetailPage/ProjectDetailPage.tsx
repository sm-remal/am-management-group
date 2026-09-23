"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import {
  getPublishedProjectBySlug,
  getPublishedProjects,
} from "@/features/projects/project.api";
import {
  getProjectCategoryLabel,
  getProjectGallery,
  getProjectImage,
  getProjectStatusLabel,
  getProjectTimeline,
  splitProjectHighlights,
  splitProjectScope,
} from "@/features/projects/project-display";
import type { ProjectRecord } from "@/features/projects/project.types";
import ProjectCard from "../ProjectCard";
import SafeProjectImage from "../SafeProjectImage";

interface Props {
  params: { slug: string };
}

export default function ProjectDetailPage({ params }: Props) {
  const [project, setProject] = useState<ProjectRecord | null>(null);
  const [relatedProjects, setRelatedProjects] = useState<ProjectRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProject = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [projectResult, projectsResult] = await Promise.all([
          getPublishedProjectBySlug(params.slug),
          getPublishedProjects({ limit: 4 }),
        ]);

        const nextProject = projectResult.data?.project ?? null;
        setProject(nextProject);
        setRelatedProjects(
          (projectsResult.data?.projects ?? [])
            .filter((item) => item.slug !== params.slug)
            .slice(0, 3),
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load project");
      } finally {
        setIsLoading(false);
      }
    };

    void loadProject();
  }, [params.slug]);

  const scopeItems = useMemo(
    () => splitProjectScope(project?.scope ?? null),
    [project?.scope],
  );
  const highlightItems = useMemo(
    () => splitProjectHighlights(project?.highlights ?? null),
    [project?.highlights],
  );
  const gallery = useMemo(
    () => (project ? getProjectGallery(project) : []),
    [project],
  );

  if (isLoading) {
    return (
      <article className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 text-slate-500">
        <div className="text-center">
          <Loader2 className="mx-auto mb-3 size-8 animate-spin text-slate-900" />
          <p className="text-sm">Loading project...</p>
        </div>
      </article>
    );
  }

  if (error || !project) {
    return (
      <article className="min-h-screen bg-slate-50 py-12">
        <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/projects"
            className="inline-flex items-center gap-1 text-sm font-medium text-secondary hover:text-[var(--am-signal-deep)]"
          >
            &larr; Back to Projects
          </Link>
          <div className="mt-8 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
            <AlertCircle className="mt-0.5 size-5 shrink-0" />
            <p>{error || "Project not found"}</p>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="min-h-screen bg-slate-50 py-8 md:py-12">
      <div className="container mx-auto space-y-8 px-4 sm:px-6 lg:px-8">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1 mb-8 md:m-auto text-sm font-medium text-secondary hover:text-[var(--am-signal-deep)]"
        >
          &larr; Back to Projects
        </Link>

        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-[var(--am-signal-deep)]">
              {getProjectCategoryLabel(project.category)}
            </span>
            <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-800">
              {getProjectStatusLabel(project.status)}
            </span>
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 sm:text-2xl">
            {project.name}
          </h1>
          <p className="text-lg text-slate-600">
            {project.description || "Project details will be updated soon."}
          </p>

          <div className="relative mt-6 h-[300px] md:h-[600px] w-full overflow-hidden rounded-2xl bg-slate-200 shadow-lg">
            <SafeProjectImage
              src={getProjectImage(project)}
              alt={project.name}
              fill
              className="object-cover"
              priority
            />
          </div>
        </header>

        <section className="grid grid-cols-1 gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <span className="block text-xs uppercase tracking-wider text-slate-500">
              Company
            </span>
            <span className="text-sm font-semibold text-slate-900">
              {project.company.name}
            </span>
          </div>
          <div>
            <span className="block text-xs uppercase tracking-wider text-slate-500">
              Location
            </span>
            <span className="text-sm font-semibold text-slate-900">
              {project.location || "Not set"}
            </span>
          </div>
          <div>
            <span className="block text-xs uppercase tracking-wider text-slate-500">
              Timeline
            </span>
            <span className="text-sm font-semibold text-slate-900">
              {getProjectTimeline(project)}
            </span>
          </div>
          <div>
            <span className="block text-xs uppercase tracking-wider text-slate-500">
              Client / Main Contractor
            </span>
            <span className="text-sm font-semibold text-slate-900">
              {project.clientName || "Not set"}
            </span>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="mb-4 text-2xl font-bold text-slate-900">
              Scope of Work
            </h2>
            {scopeItems.length ? (
              <ul className="space-y-3">
                {scopeItems.map((item, index) => (
                  <li
                    key={`${item}-${index}`}
                    className="flex items-start text-sm text-slate-700"
                  >
                    <CheckCircle2 className="mr-2 mt-0.5 size-4 shrink-0 text-secondary" />
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-600">
                Scope details will be updated soon.
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="mb-4 text-2xl font-bold text-slate-900">
              Project Highlights
            </h2>
            <ul className="space-y-3">
              {(highlightItems.length
                ? highlightItems
                : ["Project highlights will be updated soon."]
              ).map((item, index) => (
                <li
                  key={`${item}-${index}`}
                  className="flex items-start text-sm text-slate-700"
                >
                  <CheckCircle2 className="mr-2 mt-0.5 size-4 shrink-0 text-secondary" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {gallery.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">
              Project Gallery
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {gallery.map((img, index) => (
                <div
                  key={`${img}-${index}`}
                  className="relative h-88 overflow-hidden rounded-xl bg-slate-200"
                >
                  <SafeProjectImage
                    src={img}
                    alt={`${project.name} gallery image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="space-y-6 rounded-2xl bg-slate-900 p-8 text-center text-white sm:p-12">
          <h2 className="text-2xl font-bold sm:text-2xl">
            Have a similar project in mind?
          </h2>
          <p className="mx-auto max-w-xl text-sm text-slate-400 sm:text-base">
            Get in touch with AM Management Group for reliable sub-contracting
            and structural execution.
          </p>
          <div>
            <Link
              href="/contact"
              className="inline-block rounded-md bg-secondary px-8 py-3 font-semibold text-white transition-colors hover:bg-[var(--am-signal-deep)]"
            >
              Get In Touch
            </Link>
          </div>
        </section>

        {relatedProjects.length > 0 && (
          <section className="space-y-6 border-t border-slate-200 pt-8">
            <h2 className="text-2xl font-bold text-slate-900">
              Related Projects
            </h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {relatedProjects.map((relatedProject) => (
                <ProjectCard
                  key={relatedProject.slug}
                  project={relatedProject}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
