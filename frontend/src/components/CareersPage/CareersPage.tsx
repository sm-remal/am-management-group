"use client";

import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Globe2,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import AboutBanner from "@/components/About/AboutBanner/AboutBanner";
import { buttonVariants } from "@/components/ui/button";
import { getPublishedJobs } from "@/features/jobs/job.api";
import type { EmploymentType, JobRecord } from "@/features/jobs/job.types";

const employmentLabels: Record<EmploymentType, string> = {
  FULL_TIME: "Full Time",
  PART_TIME: "Part Time",
  CONTRACT: "Contract",
  INTERNSHIP: "Internship",
};

const formatDate = (value: string | null) => {
  if (!value) return null;

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
};

export default function CareersPage() {
  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true);
        const result = await getPublishedJobs({ limit: 100 });
        setJobs(result.data?.jobs ?? []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load available positions",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadJobs();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AboutBanner
        title="Careers at AM Management Group"
        description="Build your career with a diversified Malaysian business group operating across multiple industries and business sectors."
      />

      <div className="container mx-auto space-y-14 px-4 py-10 sm:px-6 lg:px-8">
        {/* Benefits Section */}
        <section className="relative">
          <div className="mb-8 text-center">
            <span className="text-xs font-extrabold uppercase tracking-widest text-secondary"></span>
            <h2 className="mt-2 text-2xl font-bold text-foreground sm:text-2xl">
              Why Join Us?
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: BriefcaseBusiness,
                title: "Diverse Opportunities",
                description:
                  "Explore roles across different companies, industries and business functions.",
              },
              {
                icon: Globe2,
                title: "Industry Exposure",
                description:
                  "Gain practical experience across multiple sectors and business environments.",
              },
              {
                icon: Users,
                title: "Collaborative Culture",
                description:
                  "Work with teams that value communication, reliability and shared success.",
              },
              {
                icon: CheckCircle2,
                title: "Professional Growth",
                description:
                  "Develop your skills through meaningful responsibilities and real projects.",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="group relative rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-secondary/40 hover:shadow-xl hover:shadow-primary/5"
                >
                  <div className="mb-6 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-secondary group-hover:text-secondary-foreground">
                    <Icon className="size-6" />
                  </div>

                  <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>

                  <div className="absolute inset-x-0 bottom-0 h-1 rounded-b-2xl bg-gradient-to-r from-primary to-secondary opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              );
            })}
          </div>
        </section>

        {/* Jobs Section */}
        <section id="open-positions" className="scroll-mt-10">
          <div className="mb-10 flex flex-col justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-end">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-secondary">
                Opportunities
              </span>
              <h2 className="mt-1 text-2xl font-bold text-foreground">
                Available Positions
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Find a role that matches your skills and career goals.
              </p>
            </div>

            {!loading && (
              <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                {jobs.length} open position{jobs.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {loading ? (
            <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-sm">
              <div className="mx-auto size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="mt-4 text-sm font-medium text-muted-foreground">
                Loading available positions...
              </p>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-6 text-sm font-medium text-destructive">
              {error}
            </div>
          ) : jobs.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-sm">
              <BriefcaseBusiness className="mx-auto size-12 text-muted-foreground/40" />

              <h3 className="mt-4 text-lg font-bold text-foreground">
                No open positions at the moment
              </h3>

              <p className="mt-2 text-sm text-muted-foreground">
                We are not currently hiring for any published positions. Please
                check back again soon.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => {
                const deadline = formatDate(job.deadline);

                return (
                  <div
                    key={job.id}
                    className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:border-primary hover:shadow-lg"
                  >
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                            {job.company?.name ?? "Group Company"}
                          </span>

                          <span className="rounded-md bg-secondary/10 px-2.5 py-1 text-xs font-bold text-secondary">
                            {employmentLabels[job.employmentType]}
                          </span>
                        </div>

                        <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                          {job.title}
                        </h3>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-muted-foreground">
                          {job.location && (
                            <span className="flex items-center gap-1">
                              📍 {job.location}
                            </span>
                          )}
                          {deadline && (
                            <span className="flex items-center gap-1">
                              ⏳ Deadline: {deadline}
                            </span>
                          )}

                          {job._count?.applications !== undefined && (
                            <span className="text-secondary">
                              👥 {job._count.applications} applicant
                              {job._count.applications !== 1 ? "s" : ""}
                            </span>
                          )}
                        </div>

                        {job.description && (
                          <p className="line-clamp-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                            {job.description}
                          </p>
                        )}
                      </div>

                      <Link
                        href={`/careers/${job.slug}`}
                        className={buttonVariants({
                          className:
                            "shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 group-hover:bg-secondary group-hover:text-secondary-foreground transition-colors",
                        })}
                      >
                        View Position
                        <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Process Section */}
        <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-b from-muted/30 to-muted/80 px-6 py-10 sm:px-12">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mt-2 text-2xl font-bold text-foreground sm:text-2xl">
              Your journey starts here
            </h2>
          </div>

          <div className="mt-8 grid gap-8 md:grid-cols-4">
            {[
              ["01", "Explore", "Find a position that matches your skills."],
              ["02", "Apply", "Submit your application and CV online."],
              ["03", "Review", "Our team reviews your application."],
              ["04", "Connect", "Shortlisted candidates are contacted."],
            ].map(([number, title, description]) => (
              <div
                key={number}
                className="relative rounded-xl border border-border/50 bg-card p-5 shadow-sm"
              >
                <span className="text-2xl font-black text-secondary">
                  {number}
                </span>

                <h3 className="mt-2 text-lg font-bold text-foreground">
                  {title}
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-[var(--am-harbour)] px-6 py-10 text-center text-primary-foreground shadow-2xl sm:px-12">
          <div className="relative z-10 mx-auto max-w-2xl">
            <h2 className="text-2xl font-semibold sm:text-2xl">
              Ready to take the next step?
            </h2>

            <p className="mt-4 text-base opacity-90 sm:text-lg">
              Explore our available positions and find an opportunity where you
              can make a meaningful contribution.
            </p>

            <a
              href="#open-positions"
              className={buttonVariants({
                variant: "secondary",
                size: "lg",
                className:
                  "mt-8 bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-lg font-bold",
              })}
            >
              Explore Open Positions
              <ArrowRight className="ml-2 size-5" />
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
