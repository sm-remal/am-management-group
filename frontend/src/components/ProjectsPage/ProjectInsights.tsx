"use client";

import { useEffect, useMemo, useState } from "react";
import { getPublishedProjects } from "@/features/projects/project.api";
import type { ProjectRecord } from "@/features/projects/project.types";
import { useInView } from "@/components/theme/useInView";

const STATUS = [
  { key: "COMPLETED", label: "Completed", color: "var(--am-navy)" },
  { key: "ONGOING", label: "Ongoing", color: "var(--am-signal)" },
  { key: "UPCOMING", label: "Upcoming", color: "#9fb2d1" },
] as const;

const regionOf = (location: string | null) => {
  const text = (location || "").toLowerCase();
  const regions: string[] = [];
  if (text.includes("melaka") || text.includes("malacca")) regions.push("Melaka");
  if (text.includes("negeri sembilan") || text.includes("port dickson") || text.includes("bahau")) regions.push("Negeri Sembilan");
  return regions.length ? regions : ["Other"];
};

/**
 * Projects overview infographic: status donut, projects per state and a
 * contract timeline. All three animate once when scrolled into view and are
 * computed from published projects, so they update when the dashboard does.
 */
export default function ProjectInsights() {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.2 });

  useEffect(() => {
    getPublishedProjects({ limit: 100 })
      .then((result) => setProjects(result.data?.projects ?? []))
      .catch(() => setProjects([]));
  }, []);

  const status = useMemo(
    () => STATUS.map((s) => ({ ...s, count: projects.filter((p) => p.status === s.key).length })).filter((s) => s.count),
    [projects],
  );

  const regions = useMemo(() => {
    const counts = new Map<string, number>();
    projects.forEach((p) => regionOf(p.location).forEach((r) => counts.set(r, (counts.get(r) ?? 0) + 1)));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [projects]);

  const timeline = useMemo(() => {
    const dated = projects.filter((p) => p.startDate && p.endDate);
    if (!dated.length) return null;
    const start = Math.min(...dated.map((p) => new Date(p.startDate!).getTime()));
    const end = Math.max(...dated.map((p) => new Date(p.endDate!).getTime()));
    const span = end - start || 1;
    const years: number[] = [];
    for (let y = new Date(start).getFullYear(); y <= new Date(end).getFullYear(); y += 1) years.push(y);
    return {
      years,
      startYear: years[0],
      rows: dated.map((p) => ({
        id: p.id,
        name: p.name,
        status: p.status,
        left: ((new Date(p.startDate!).getTime() - start) / span) * 100,
        width: ((new Date(p.endDate!).getTime() - new Date(p.startDate!).getTime()) / span) * 100,
      })),
    };
  }, [projects]);

  if (!projects.length) return null;

  const total = projects.length;
  const R = 52;
  const C = 2 * Math.PI * R;
  let offset = 0;
  const maxRegion = Math.max(...regions.map((r) => r[1]));

  return (
    <div ref={ref} className="mb-10 grid gap-4 lg:grid-cols-[0.9fr_1fr_1.4fr]">
      {/* Status donut */}
      <figure className="rounded-lg border border-border bg-white p-6" aria-label={status.map((s) => `${s.label}: ${s.count}`).join(", ")}>
        <figcaption className="text-sm font-semibold text-[var(--am-harbour)]">Projects by status</figcaption>
        <div className="mt-4 flex items-center gap-6">
          <svg viewBox="0 0 140 140" className="size-32 shrink-0 -rotate-90" aria-hidden="true">
            <circle cx="70" cy="70" r={R} fill="none" stroke="var(--am-steel)" strokeWidth="16" />
            {status.map((s, index) => {
              const length = (s.count / total) * C;
              const segment = (
                <circle
                  key={s.key}
                  cx="70"
                  cy="70"
                  r={R}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="16"
                  strokeDasharray={`${inView ? length : 0} ${C}`}
                  strokeDashoffset={-offset}
                  style={{ transition: `stroke-dasharray 1s cubic-bezier(.2,.8,.2,1) ${0.2 + index * 0.3}s` }}
                />
              );
              offset += length;
              return segment;
            })}
          </svg>
          <div>
            <div className="font-display text-3xl font-semibold text-[var(--am-navy)]">{total}</div>
            <div className="text-xs text-muted-foreground">projects listed</div>
            <ul className="mt-3 space-y-1.5 text-sm">
              {status.map((s) => (
                <li key={s.key} className="flex items-center gap-2">
                  <span className="size-2.5 rounded-sm" style={{ background: s.color }} />
                  {s.label} <b className="text-[var(--am-harbour)]">{s.count}</b>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </figure>

      {/* By state */}
      <figure className="rounded-lg border border-border bg-white p-6" aria-label={regions.map((r) => `${r[0]}: ${r[1]}`).join(", ")}>
        <figcaption className="text-sm font-semibold text-[var(--am-harbour)]">Projects by state</figcaption>
        <div className="mt-5 space-y-4">
          {regions.map(([name, count], index) => (
            <div key={name}>
              <div className="mb-1.5 flex justify-between text-sm">
                <span className="text-muted-foreground">{name}</span>
                <b className="text-[var(--am-harbour)]">{count}</b>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-[var(--am-steel)]">
                <div
                  className="h-full origin-left rounded-full bg-[var(--am-navy)]"
                  style={{
                    width: `${(count / maxRegion) * 100}%`,
                    transform: inView ? "scaleX(1)" : "scaleX(0)",
                    transition: `transform 1s cubic-bezier(.2,.8,.2,1) ${0.2 + index * 0.2}s`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </figure>

      {/* Timeline */}
      {timeline && (
        <figure className="rounded-lg border border-border bg-white p-6">
          <figcaption className="text-sm font-semibold text-[var(--am-harbour)]">Contract timeline</figcaption>
          <div className="mt-5 space-y-4">
            {timeline.rows.map((row, index) => (
              <div key={row.id}>
                <div className="mb-1.5 truncate text-sm text-muted-foreground">{row.name}</div>
                <div className="relative h-3 rounded-full bg-[var(--am-steel)]">
                  <div
                    className="absolute inset-y-0 origin-left rounded-full"
                    style={{
                      left: `${row.left}%`,
                      width: `${Math.max(row.width, 3)}%`,
                      background: row.status === "COMPLETED" ? "var(--am-navy)" : "var(--am-signal)",
                      transform: inView ? "scaleX(1)" : "scaleX(0)",
                      transition: `transform 1.1s cubic-bezier(.2,.8,.2,1) ${0.3 + index * 0.3}s`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-between text-xs font-semibold text-muted-foreground">
            {timeline.years.map((y) => (
              <span key={y}>{y}</span>
            ))}
          </div>
        </figure>
      )}
    </div>
  );
}
