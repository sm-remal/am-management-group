"use client";

import {
  ArrowRight,
  BriefcaseBusiness,
  Clock3,
  Loader2,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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

type CompanyCareersSectionProps = {
  company: {
    name: string;
    slug: string;
  };
};

export default function CompanyCareersSection({
  company,
}: CompanyCareersSectionProps) {
  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [referenceTime, setReferenceTime] = useState<number | null>(null);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await getPublishedJobs({
          companySlug: company.slug,
          limit: 100,
        });

        setReferenceTime(Date.now());
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
  }, [company.slug]);

  const openJobs = useMemo(() => {
    if (referenceTime === null) return [];

    return jobs.filter((job) => {
      if (!job.isPublished) return false;
      if (!job.deadline) return true;

      return new Date(job.deadline).getTime() >= referenceTime;
    });
  }, [jobs, referenceTime]);

  return (
    <section className="border-b border-border bg-muted/30 py-10 sm:py-12">
      <div className="container-am">
        <div className="mb-10 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-10 bg-primary" />

              <span className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
                Careers
              </span>
            </div>

            <h2 className="text-2xl flex flex-col gap-3 font-bold text-foreground sm:text-2xl">
              <span>Open positions at</span>
              <span className="text-secondary">{company.name}</span>
            </h2>

            <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
              Explore current hiring opportunities for this company and apply
              directly through the careers portal.
            </p>
          </div>

          <Link
            href="/careers"
            className={buttonVariants({ variant: "outline" })}
          >
            View All Careers
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <Loader2 className="mx-auto size-7 animate-spin text-primary" />
            <p className="mt-3 text-sm text-muted-foreground">
              Checking available positions...
            </p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive">
            {error}
          </div>
        ) : openJobs.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {openJobs.map((job) => {
              const deadline = formatDate(job.deadline);

              return (
                <article
                  key={job.id}
                  className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      Applications Open
                    </span>

                    <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                      {employmentLabels[job.employmentType]}
                    </span>
                  </div>

                  <h3 className="mt-4 text-xl font-bold text-foreground">
                    {job.title}
                  </h3>

                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                    {job.location && (
                      <span className="inline-flex items-center gap-2">
                        <MapPin className="size-4" />
                        {job.location}
                      </span>
                    )}

                    {deadline && (
                      <span className="inline-flex items-center gap-2">
                        <Clock3 className="size-4" />
                        Deadline: {deadline}
                      </span>
                    )}
                  </div>

                  {job.description && (
                    <p className="mt-4 line-clamp-2 text-sm leading-6 text-muted-foreground">
                      {job.description}
                    </p>
                  )}

                  <Link
                    href={`/careers/${job.slug}`}
                    className={buttonVariants({ className: "mt-6" })}
                  >
                    Apply Now
                    <ArrowRight className="size-4" />
                  </Link>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-10 text-center shadow-sm">
            <BriefcaseBusiness className="mx-auto size-10 text-muted-foreground/50" />

            <h3 className="mt-4 text-xl font-bold text-foreground">
              No open positions right now
            </h3>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
              {company.name} is not currently accepting applications for a
              published position. Please check back later or explore other group
              opportunities.
            </p>

            <Link
              href="/careers"
              className={buttonVariants({
                variant: "outline",
                className: "mt-6",
              })}
            >
              Explore Careers
              <ArrowRight className="size-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
