"use client";

import {
  Activity,
  AlertCircle,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Clock3,
  FolderKanban,
  Inbox,
  Newspaper,
  RefreshCw,
  Users,
  Wrench,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ElementType, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { getDashboardOverview } from "@/features/dashboard/dashboard.api";
import type { DashboardOverview as DashboardOverviewType } from "@/features/dashboard/dashboard.types";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: number;
  helper: string;
  icon: ElementType;
  accent: "blue" | "orange" | "emerald" | "rose" | "violet" | "slate";
};

type RecentItemProps = {
  title: string;
  meta: string;
  status?: string;
};

const accentStyles: Record<StatCardProps["accent"], string> = {
  blue: "bg-blue-50 text-blue-700 ring-blue-100",
  orange: "bg-orange-50 text-orange-700 ring-orange-100",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  rose: "bg-rose-50 text-rose-700 ring-rose-100",
  violet: "bg-violet-50 text-violet-700 ring-violet-100",
  slate: "bg-slate-100 text-slate-700 ring-slate-200",
};

const formatDate = (value: string) => {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
};

const StatCard = ({ label, value, helper, icon: Icon, accent }: StatCardProps) => {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-normal text-slate-950">{value}</p>
        </div>
        <div className={cn("rounded-lg p-2 ring-1", accentStyles[accent])}>
          <Icon className="size-5" />
        </div>
      </div>
      <p className="mt-4 text-sm text-slate-500">{helper}</p>
    </div>
  );
};

const RecentItem = ({ title, meta, status }: RecentItemProps) => {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-3 last:border-b-0">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-900">{title}</p>
        <p className="mt-1 truncate text-xs text-slate-500">{meta}</p>
      </div>
      {status && (
        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">
          {status}
        </span>
      )}
    </div>
  );
};

const RecentPanel = ({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: ElementType;
  children: ReactNode;
}) => {
  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex h-14 items-center gap-2 border-b border-slate-200 px-5">
        <Icon className="size-4 text-[#234279]" />
        <h2 className="text-sm font-bold text-slate-950">{title}</h2>
      </div>
      <div className="px-5">{children}</div>
    </section>
  );
};

const EmptyState = ({ label }: { label: string }) => {
  return (
    <div className="flex min-h-32 flex-col items-center justify-center text-center">
      <Inbox className="size-8 text-slate-300" />
      <p className="mt-2 text-sm text-slate-500">{label}</p>
    </div>
  );
};

const DashboardOverviewLoading = () => {
  const statPlaceholders = Array.from({ length: 6 });
  const panelPlaceholders = Array.from({ length: 3 });
  const recentPlaceholders = Array.from({ length: 4 });

  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading dashboard overview">
      <section className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 flex-1 animate-pulse">
          <div className="h-4 w-32 rounded bg-orange-100" />
          <div className="mt-3 h-8 w-full max-w-md rounded bg-slate-200" />
          <div className="mt-3 h-4 w-full max-w-2xl rounded bg-slate-100" />
          <div className="mt-2 h-4 w-2/3 max-w-xl rounded bg-slate-100" />
        </div>
        <div className="h-10 w-28 shrink-0 animate-pulse rounded-md bg-slate-100" />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {statPlaceholders.map((_, index) => (
          <div key={index} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4 animate-pulse">
              <div className="flex-1">
                <div className="h-4 w-24 rounded bg-slate-100" />
                <div className="mt-3 h-8 w-16 rounded bg-slate-200" />
              </div>
              <div className="size-9 rounded-lg bg-slate-100" />
            </div>
            <div className="mt-5 h-4 w-40 animate-pulse rounded bg-slate-100" />
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {panelPlaceholders.map((_, index) => (
          <div key={index} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 animate-pulse">
              <div className="size-4 rounded bg-slate-200" />
              <div className="h-4 w-36 rounded bg-slate-200" />
            </div>
            <div className="mt-5 space-y-4 animate-pulse">
              <div className="h-4 w-full rounded bg-slate-100" />
              <div className="h-2 w-full rounded-full bg-slate-100" />
              <div className="h-4 w-5/6 rounded bg-slate-100" />
              <div className="h-2 w-full rounded-full bg-slate-100" />
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {recentPlaceholders.map((_, index) => (
          <section key={index} className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex h-14 items-center gap-2 border-b border-slate-200 px-5 animate-pulse">
              <div className="size-4 rounded bg-slate-200" />
              <div className="h-4 w-32 rounded bg-slate-200" />
            </div>
            <div className="px-5 py-2">
              {[0, 1, 2].map((item) => (
                <div key={item} className="border-b border-slate-100 py-3 last:border-b-0">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
                  <div className="mt-2 h-3 w-full animate-pulse rounded bg-slate-100" />
                </div>
              ))}
            </div>
          </section>
        ))}
      </section>
    </div>
  );
};
const DashboardOverview = () => {
  const [overview, setOverview] = useState<DashboardOverviewType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getDashboardOverview(5);
      setOverview(result.data ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load dashboard");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadDashboard();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadDashboard]);

  const statCards = useMemo(() => {
    if (!overview) return [];

    const { stats } = overview;

    return [
      {
        label: "Companies",
        value: stats.companies.total,
        helper: `${stats.companies.published} published, ${stats.companies.draft} draft`,
        icon: Building2,
        accent: "blue" as const,
      },
      {
        label: "Active Services",
        value: stats.services.active,
        helper: `${stats.services.total} total service entries`,
        icon: Wrench,
        accent: "orange" as const,
      },
      {
        label: "Projects",
        value: stats.projects.total,
        helper: `${stats.projects.featured} featured, ${stats.projects.ongoing} ongoing`,
        icon: FolderKanban,
        accent: "emerald" as const,
      },
      {
        label: "New Inquiries",
        value: stats.inquiries.new,
        helper: `${stats.inquiries.total} total contact inquiries`,
        icon: AlertCircle,
        accent: "rose" as const,
      },
      {
        label: "Applications",
        value: stats.careers.applications,
        helper: `${stats.careers.newApplications} pending applications`,
        icon: BriefcaseBusiness,
        accent: "violet" as const,
      },
      {
        label: "Users",
        value: stats.users.total,
        helper: `${stats.users.active} active, ${stats.users.admin} admins`,
        icon: Users,
        accent: "slate" as const,
      },
    ];
  }, [overview]);

  if (isLoading) {
    return <DashboardOverviewLoading />;
  }

  if (error || !overview) {
    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 size-5 text-rose-600" />
          <div>
            <h1 className="text-base font-bold text-rose-950">Dashboard unavailable</h1>
            <p className="mt-1 text-sm text-rose-700">{error || "No dashboard data returned"}</p>
            <Button type="button" className="mt-4" onClick={loadDashboard}>
              <RefreshCw className="size-4" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { stats, recentActivity } = overview;

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#fb731f]">Admin Dashboard</p>
          <h1 className="mt-1 text-2xl font-bold tracking-normal text-slate-950 md:text-3xl">
            Business operations overview
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Monitor companies, services, projects, inquiries, careers and website content from one control center.
          </p>
        </div>

        <Button type="button" variant="outline" onClick={loadDashboard}>
          <RefreshCw className="size-4" />
          Refresh
        </Button>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-950">Publishing Health</h2>
          </div>
          <div className="mt-5 space-y-4">
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Companies published</span>
                <span className="font-semibold text-slate-900">{stats.companies.published}</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-[#234279]"
                  style={{
                    width: `${stats.companies.total ? (stats.companies.published / stats.companies.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Projects published</span>
                <span className="font-semibold text-slate-900">{stats.projects.published}</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-[#fb731f]"
                  style={{
                    width: `${stats.projects.total ? (stats.projects.published / stats.projects.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Activity className="size-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-950">Content Inventory</h2>
          </div>
          <dl className="mt-5 grid grid-cols-2 gap-4">
            <div>
              <dt className="text-xs text-slate-500">Gallery</dt>
              <dd className="mt-1 text-xl font-bold text-slate-950">{stats.gallery.total}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">News</dt>
              <dd className="mt-1 text-xl font-bold text-slate-950">{stats.news.total}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Team</dt>
              <dd className="mt-1 text-xl font-bold text-slate-950">{stats.team.total}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Settings</dt>
              <dd className="mt-1 text-xl font-bold text-slate-950">{stats.settings.total}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Clock3 className="size-4 text-violet-600" />
            <h2 className="text-sm font-bold text-slate-950">Career Snapshot</h2>
          </div>
          <dl className="mt-5 space-y-3">
            <div className="flex items-center justify-between">
              <dt className="text-sm text-slate-500">Open jobs</dt>
              <dd className="font-semibold text-slate-950">{stats.careers.openJobs}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-sm text-slate-500">Pending applications</dt>
              <dd className="font-semibold text-slate-950">{stats.careers.newApplications}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-sm text-slate-500">Social links</dt>
              <dd className="font-semibold text-slate-950">{stats.socialLinks.total}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <RecentPanel title="Latest Inquiries" icon={AlertCircle}>
          {recentActivity.inquiries.length ? (
            recentActivity.inquiries.map((item) => (
              <RecentItem
                key={item.id}
                title={item.subject}
                meta={`${item.name} - ${item.email} - ${formatDate(item.createdAt)}`}
                status={item.status}
              />
            ))
          ) : (
            <EmptyState label="No inquiries yet" />
          )}
        </RecentPanel>

        <RecentPanel title="Latest Applications" icon={BriefcaseBusiness}>
          {recentActivity.applications.length ? (
            recentActivity.applications.map((item) => (
              <RecentItem
                key={item.id}
                title={item.fullName}
                meta={`${item.job.title} - ${item.email} - ${formatDate(item.createdAt)}`}
                status={item.status}
              />
            ))
          ) : (
            <EmptyState label="No applications yet" />
          )}
        </RecentPanel>

        <RecentPanel title="Latest Projects" icon={FolderKanban}>
          {recentActivity.projects.length ? (
            recentActivity.projects.map((item) => (
              <RecentItem
                key={item.id}
                title={item.name}
                meta={`${item.company.name} - ${formatDate(item.createdAt)}`}
                status={item.publishStatus}
              />
            ))
          ) : (
            <EmptyState label="No projects yet" />
          )}
        </RecentPanel>

        <RecentPanel title="Latest News" icon={Newspaper}>
          {recentActivity.news.length ? (
            recentActivity.news.map((item) => (
              <RecentItem
                key={item.id}
                title={item.title}
                meta={`${item.author?.name || "Unknown author"} - ${formatDate(item.createdAt)}`}
                status={item.status}
              />
            ))
          ) : (
            <EmptyState label="No news yet" />
          )}
        </RecentPanel>
      </section>
    </div>
  );
};

export default DashboardOverview;
