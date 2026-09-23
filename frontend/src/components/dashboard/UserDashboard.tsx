"use client";

import Link from "next/link";
import { ArrowRight, UserRound } from "lucide-react";
import type { StoredAuthUser } from "@/features/auth/auth-session";

const UserDashboard = ({ user }: { user: StoredAuthUser | null }) => {
  const displayName = user?.name || "there";

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#234279] text-white">
            <UserRound className="size-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#fb731f]">My Dashboard</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-950">
              Welcome, {displayName}
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Manage your account and explore the latest updates from AM
              Management.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-bold text-slate-950">
            Account details
          </h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4 border-b border-slate-100 pb-3">
              <dt className="text-slate-500">Name</dt>
              <dd className="text-right font-medium text-slate-900">
                {user?.name || "Not set"}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Email</dt>
              <dd className="text-right font-medium text-slate-900">
                {user?.email || "Not set"}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-bold text-slate-950">
            Explore the website
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Browse companies, services, projects and current career
            opportunities.
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#234279] hover:text-[#fb731f]"
          >
            Visit website
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default UserDashboard;
