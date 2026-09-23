"use client";

import {
  AlertCircle,
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Clock3,
  DollarSign,
  Loader2,
  MapPin,
  Send,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

import AboutBanner from "@/components/About/AboutBanner/AboutBanner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createApplication } from "@/features/applications/application.api";
import { getPublishedJobBySlug } from "@/features/jobs/job.api";

import type { JobRecord } from "@/features/jobs/job.types";

const employmentLabels = {
  FULL_TIME: "Full Time",
  PART_TIME: "Part Time",
  CONTRACT: "Contract",
  INTERNSHIP: "Internship",
} as const;

const formatDate = (value: string | null) => {
  if (!value) return null;

  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
};

type Props = {
  slug: string;
};

export default function JobDetailsPage({ slug }: Props) {
  const [job, setJob] = useState<JobRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [referenceTime, setReferenceTime] = useState<number | null>(null);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    cvUrl: "",
    coverMessage: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const loadJob = async () => {
      try {
        setLoading(true);

        const result = await getPublishedJobBySlug(slug);

        setReferenceTime(Date.now());
        setJob(result.data?.job ?? null);
      } catch (err) {
        setPageError(
          err instanceof Error ? err.message : "Unable to load this position",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadJob();
  }, [slug]);

  const applicationOpen = useMemo(() => {
    if (!job || !job.isPublished) return false;

    if (!job.deadline) return true;

    if (referenceTime === null) return false;

    return new Date(job.deadline).getTime() >= referenceTime;
  }, [job, referenceTime]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!job) return;

    setFormError(null);
    setSuccess(null);

    if (!form.fullName.trim()) {
      setFormError("Full name is required.");
      return;
    }

    if (!form.email.trim()) {
      setFormError("Email is required.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setFormError("Please enter a valid email address.");
      return;
    }

    if (!form.phone.trim()) {
      setFormError("Phone number is required.");
      return;
    }

    if (!form.cvUrl.trim()) {
      setFormError("CV / Resume URL is required.");
      return;
    }

    if (!/^https?:\/\//i.test(form.cvUrl.trim())) {
      setFormError("Please enter a valid CV URL.");
      return;
    }

    setSubmitting(true);

    try {
      await createApplication({
        jobId: job.id,
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        cvUrl: form.cvUrl.trim(),
        coverMessage: form.coverMessage.trim() || null,
      });

      setSuccess(
        "Your application has been submitted successfully. Our recruitment team will contact you if you are shortlisted.",
      );

      setForm({
        fullName: "",
        email: "",
        phone: "",
        cvUrl: "",
        coverMessage: "",
      });
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Unable to submit your application.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
        <Loader2 className="size-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">
          Loading position details...
        </p>
      </div>
    );
  }

  if (pageError || !job) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-xl rounded-3xl border border-destructive/30 bg-destructive/5 p-8 text-center shadow-lg">
          <AlertCircle className="mx-auto size-12 text-destructive" />

          <h1 className="mt-4 text-2xl font-semibold text-foreground">
            Position Unavailable
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            {pageError ?? "This position could not be found or has expired."}
          </p>

          <Link
            href="/careers"
            className={buttonVariants({
              className:
                "mt-6 bg-primary text-primary-foreground hover:bg-primary/90",
            })}
          >
            <ArrowLeft className="mr-2 size-4" />
            Back to Open Positions
          </Link>
        </div>
      </div>
    );
  }

  const deadline = formatDate(job.deadline);
  const applicantCount = job._count?.applications ?? 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AboutBanner
        title={job.title}
        description={`${job.company?.name ?? "AM Management Group"} • ${
          employmentLabels[job.employmentType]
        }`}
      />

      <div className="container mx-auto space-y-8 px-4 py-12 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/careers"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-4" />
          Back to Careers
        </Link>

        {/* Job Main Header */}
        <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-md sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                  {job.company?.name ?? "Group Company"}
                </span>

                <span className="rounded-md bg-secondary/10 px-3 py-1 text-xs font-bold text-secondary">
                  {employmentLabels[job.employmentType]}
                </span>
              </div>

              <h2 className="text-2xl font-semibold text-foreground sm:text-[1.5rem]">
                {job.title}
              </h2>

              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-muted-foreground">
                {job.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-4 text-secondary" />
                    {job.location}
                  </span>
                )}

                <span className="inline-flex items-center gap-1.5">
                  <BriefcaseBusiness className="size-4 text-primary" />
                  {employmentLabels[job.employmentType]}
                </span>

                {deadline && (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 className="size-4 text-secondary" />
                    Deadline: {deadline}
                  </span>
                )}

                <span className="inline-flex items-center gap-1.5">
                  <Users className="size-4 text-primary" />
                  {applicantCount} applicant{applicantCount !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {applicationOpen ? (
              <a
                href="#application-form"
                className={buttonVariants({
                  size: "lg",
                  className:
                    "shrink-0 bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold shadow-md",
                })}
              >
                Apply for Position
              </a>
            ) : (
              <Button disabled size="lg" className="shrink-0 opacity-70">
                Applications Closed
              </Button>
            )}
          </div>
        </section>

        {/* Application Status Alert */}
        <section
          className={
            applicationOpen
              ? "rounded-2xl border border-secondary/30 bg-secondary/5 p-5 shadow-sm"
              : "rounded-2xl border border-destructive/30 bg-destructive/5 p-5 shadow-sm"
          }
        >
          <div className="flex items-start gap-3">
            {applicationOpen ? (
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-secondary" />
            ) : (
              <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
            )}

            <div>
              <p className="font-bold">
                {applicationOpen
                  ? "Applications are currently open"
                  : "Applications are currently closed"}
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                {applicationOpen
                  ? deadline
                    ? `Applications are accepted until ${deadline}.`
                    : "We are currently accepting applications for this position."
                  : "This position is no longer accepting applications."}
              </p>
            </div>
          </div>
        </section>

        {/* Job Content & Sidebar */}
        <section className="grid gap-8 lg:grid-cols-[1fr_340px]">
          {/* Main Description & Requirements */}
          <div className="space-y-8 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <article>
              <h2 className="text-2xl font-bold text-foreground border-b border-border pb-3">
                About the Role
              </h2>

              <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted-foreground sm:text-base">
                {job.description ||
                  "Join our team and contribute to professional delivery across the group."}
              </p>
            </article>

            {job.requirements && (
              <article className="pt-4">
                <h2 className="text-2xl font-bold text-foreground border-b border-border pb-3">
                  Requirements & Qualifications
                </h2>

                <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {job.requirements}
                </p>
              </article>
            )}
          </div>

          {/* Position Summary Sidebar */}
          <aside className="h-fit space-y-6 rounded-3xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-bold text-foreground border-b border-border pb-3">
              Position Summary
            </h3>

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Building2 className="mt-0.5 size-4 text-primary" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Company
                  </p>
                  <p className="font-semibold text-foreground">
                    {job.company?.name ?? "AM Management Group"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <BriefcaseBusiness className="mt-0.5 size-4 text-primary" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Employment Type
                  </p>
                  <p className="font-semibold text-foreground">
                    {employmentLabels[job.employmentType]}
                  </p>
                </div>
              </div>

              {job.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 size-4 text-primary" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Location
                    </p>
                    <p className="font-semibold text-foreground">
                      {job.location}
                    </p>
                  </div>
                </div>
              )}

              {job.salaryInfo && (
                <div className="flex items-start gap-3">
                  <DollarSign className="mt-0.5 size-4 text-secondary" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Salary Range
                    </p>
                    <p className="font-semibold text-foreground">
                      {job.salaryInfo}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Users className="mt-0.5 size-4 text-primary" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Applications
                  </p>
                  <p className="font-semibold text-foreground">
                    {applicantCount} received
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </section>

        {/* Application Form */}
        {applicationOpen && (
          <section
            id="application-form"
            className="scroll-mt-24 rounded-3xl border border-primary/20 bg-card p-6 shadow-lg sm:p-10"
          >
            <div className="mx-auto max-w-3xl">
              <div className="text-center">
                <h2 className="mt-3 text-2xl font-semibold text-foreground sm:text-2xl">
                  Apply for {job.title}
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                  Complete the form below and attach your CV link.
                </p>
              </div>

              {success && (
                <div className="mt-8 flex items-start gap-3 rounded-2xl border border-secondary/30 bg-secondary/10 p-5 text-sm font-medium text-foreground">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-secondary" />
                  <p>{success}</p>
                </div>
              )}

              {formError && (
                <div className="mt-8 flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-sm font-medium text-destructive">
                  <AlertCircle className="mt-0.5 size-5 shrink-0" />
                  <p>{formError}</p>
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                className="mt-8 grid gap-6 md:grid-cols-2"
              >
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Full Name <span className="text-secondary">*</span>
                  </label>

                  <Input
                    value={form.fullName}
                    onChange={(e) =>
                      setForm((current) => ({
                        ...current,
                        fullName: e.target.value,
                      }))
                    }
                    placeholder="John Doe"
                    className="focus-visible:ring-primary"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Email Address <span className="text-secondary">*</span>
                  </label>

                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((current) => ({
                        ...current,
                        email: e.target.value,
                      }))
                    }
                    placeholder="you@example.com"
                    className="focus-visible:ring-primary"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Phone Number <span className="text-secondary">*</span>
                  </label>

                  <Input
                    value={form.phone}
                    onChange={(e) =>
                      setForm((current) => ({
                        ...current,
                        phone: e.target.value,
                      }))
                    }
                    placeholder="+60 12-345 6789"
                    className="focus-visible:ring-primary"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    CV / Resume URL <span className="text-secondary">*</span>
                  </label>

                  <Input
                    value={form.cvUrl}
                    onChange={(e) =>
                      setForm((current) => ({
                        ...current,
                        cvUrl: e.target.value,
                      }))
                    }
                    placeholder="https://drive.google.com/your-cv"
                    className="focus-visible:ring-primary"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold">
                    Cover Message (Optional)
                  </label>

                  <textarea
                    value={form.coverMessage}
                    onChange={(e) =>
                      setForm((current) => ({
                        ...current,
                        coverMessage: e.target.value,
                      }))
                    }
                    rows={5}
                    placeholder="Briefly introduce yourself and outline why you are ideal for this role..."
                    className="w-full resize-y rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="md:col-span-2">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-primary py-6 text-base font-bold text-primary-foreground hover:bg-primary/90 sm:w-auto"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 size-5 animate-spin" />
                        Submitting Application...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 size-5" />
                        Submit Application
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
