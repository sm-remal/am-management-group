import Link from "next/link";
import {
  getProjectCategoryLabel,
  getProjectImage,
  getProjectStatusLabel,
} from "@/features/projects/project-display";
import type { ProjectRecord } from "@/features/projects/project.types";
import SafeProjectImage from "./SafeProjectImage";

export default function ProjectCard({ project }: { project: ProjectRecord }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md">
      <div className="relative h-56 w-full bg-slate-200">
        <SafeProjectImage
          src={getProjectImage(project)}
          alt={project.name}
          fill
          className="object-cover"
        />
        <span className="absolute right-4 top-4 rounded-full bg-slate-900/80 px-3 py-1 text-xs text-white backdrop-blur-sm">
          {getProjectStatusLabel(project.status)}
        </span>
      </div>

      <div className="flex flex-grow flex-col p-6">
        <span className="mb-2 text-xs font-semibold uppercase tracking-wider text-secondary">
          {getProjectCategoryLabel(project.category)}
        </span>
        <h2 className="mb-2 line-clamp-2 text-2xl font-bold text-slate-900">
          {project.name}
        </h2>
        <p className="mb-4 line-clamp-3 text-sm text-slate-600">
          {project.description || "Project details will be updated soon."}
        </p>

        <div className="mt-auto space-y-1 border-t border-slate-100 pt-4 text-xs text-slate-500">
          <p>
            <strong className="text-slate-700">Location:</strong>{" "}
            {project.location || "Not set"}
          </p>
          <p>
            <strong className="text-slate-700">Company:</strong>{" "}
            {project.company.name}
          </p>
        </div>

        <Link
          href={`/projects/${project.slug}`}
          className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
        >
          View Case Study &rarr;
        </Link>
      </div>
    </div>
  );
}
