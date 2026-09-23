"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Bell,
  BriefcaseBusiness,
  Building2,
  Contact,
  FolderKanban,
  GalleryHorizontalEnd,
  Home,
  Menu,
  Newspaper,
  Search,
  Settings,
  ShieldCheck,
  UserRound,
  Users,
  Wrench,
} from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import type { ElementType, ReactNode } from "react";
import BrandLogo from "@/components/common/BrandLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AUTH_SESSION_CHANGE_EVENT,
  getStoredAccessToken,
  getStoredAuthUser,
  hasStoredSession,
} from "@/features/auth/auth-session";
import { cn } from "@/lib/utils";
import Loading from "../common/Loading";

type DashboardLayoutShellProps = {
  children: ReactNode;
};

const navItems = [
  { label: "Overview", href: "/dashboard", icon: BarChart3 },
  { label: "Companies", href: "/dashboard/companies", icon: Building2 },
  { label: "Services", href: "/dashboard/services", icon: Wrench },
  { label: "Projects", href: "/dashboard/projects", icon: FolderKanban },
  { label: "Gallery", href: "/dashboard/gallery", icon: GalleryHorizontalEnd },
  { label: "News", href: "/dashboard/news", icon: Newspaper },
  { label: "Careers", href: "/dashboard/careers", icon: BriefcaseBusiness },
  { label: "Applications", href: "/dashboard/applications", icon: Contact },
  { label: "Inquiries", href: "/dashboard/inquiries", icon: Bell },
  { label: "Users", href: "/dashboard/users", icon: Users },
  { label: "Profile", href: "/dashboard/profile", icon: UserRound },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
] satisfies Array<{ label: string; href: string; icon: ElementType }>;

const userNavItems = [
  { label: "Overview", href: "/dashboard", icon: BarChart3 },
  { label: "Profile", href: "/dashboard/profile", icon: UserRound },
] satisfies Array<{ label: string; href: string; icon: ElementType }>;

const subscribeToAuthChanges = (callback: () => void) => {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (
      event.key === "am_access_token" ||
      event.key === "am_refresh_token" ||
      event.key === "am_auth_user"
    ) {
      callback();
    }
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(AUTH_SESSION_CHANGE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(AUTH_SESSION_CHANGE_EVENT, callback);
  };
};

const getAuthSnapshot = () => {
  const user = getStoredAuthUser();

  return JSON.stringify({
    hasSession: Boolean(getStoredAccessToken()) || hasStoredSession(),
    isAdmin: user?.role === "ADMIN",
  });
};
const getServerAuthSnapshot = () =>
  JSON.stringify({ hasSession: false, isAdmin: false });
const subscribeToHydration = () => () => undefined;
const getHydratedSnapshot = () => true;
const getServerHydrationSnapshot = () => false;

const DashboardSidebar = ({
  isAdmin,
  onNavigate,
}: {
  isAdmin: boolean;
  onNavigate?: () => void;
}) => {
  const pathname = usePathname();
  const items = isAdmin ? navItems : userNavItems;

  return (
    <aside className="flex h-full flex-col border-r border-slate-200 bg-white">
      <Link
        href={"/"}
        className="flex h-16 items-center gap-3 border-b border-slate-200 px-5"
      >
        <BrandLogo
          alt="AM Management Group"
          className="h-10 w-auto object-contain"
          priority
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-950">
            AM Management
          </p>
          <p className="truncate text-xs text-slate-500">
            {isAdmin ? "Admin CMS" : "User Dashboard"}
          </p>
        </div>
      </Link>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950",
                isActive &&
                  "bg-[var(--am-harbour)] text-white shadow-[inset_3px_0_0_var(--am-signal)] hover:bg-[var(--am-harbour)] hover:text-white",
              )}
            >
              <Icon className="size-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-900">
            <ShieldCheck className="size-4" />
            Secure Session
          </div>
          <p className="mt-1 text-xs leading-5 text-emerald-700">
            {isAdmin ? "JWT protected admin access" : "Your account dashboard"}
          </p>
        </div>
      </div>
    </aside>
  );
};

const DashboardLayoutShell = ({ children }: DashboardLayoutShellProps) => {
  const router = useRouter();
  const authSnapshot = useSyncExternalStore(
    subscribeToAuthChanges,
    getAuthSnapshot,
    getServerAuthSnapshot,
  );
  const { hasSession, isAdmin } = JSON.parse(authSnapshot) as {
    hasSession: boolean;
    isAdmin: boolean;
  };
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const hasHydrated = useSyncExternalStore(
    subscribeToHydration,
    getHydratedSnapshot,
    getServerHydrationSnapshot,
  );
  const pathname = usePathname();

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (!hasSession) {
      router.replace("/login");
      return;
    }

    const isAllowedUserRoute =
      pathname === "/dashboard" || pathname === "/dashboard/profile";

    if (!isAdmin && !isAllowedUserRoute) {
      router.replace("/dashboard");
    }
  }, [hasHydrated, hasSession, isAdmin, pathname, router]);

  // During SSR / first paint: show loader, never redirect yet
  if (!hasHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        {/* <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-[#234279]" /> */}
        <Loading></Loading>
      </div>
    );
  }

  const isAllowedUserRoute =
    pathname === "/dashboard" || pathname === "/dashboard/profile";

  if (!hasSession || (!isAdmin && !isAllowedUserRoute)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loading></Loading>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:block lg:w-72">
        <DashboardSidebar isAdmin={isAdmin} />
      </div>

      <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
        <SheetContent
          side="left"
          className="w-[19rem] max-w-[85vw] p-0"
          showCloseButton
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Dashboard navigation</SheetTitle>
            <SheetDescription>
              {isAdmin ? "Admin dashboard sections" : "User dashboard sections"}
            </SheetDescription>
          </SheetHeader>
          <DashboardSidebar
            isAdmin={isAdmin}
            onNavigate={() => setIsMobileNavOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:px-6">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsMobileNavOpen(true)}
            aria-label="Open dashboard navigation"
          >
            <Menu className="size-4" />
          </Button>

          <div className="relative hidden w-full max-w-md sm:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search dashboard"
              className="h-10 bg-slate-50 pl-9"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Notifications"
            >
              <Bell className="size-4" />
            </Button>
            <Link
              href="/"
              className="hidden h-8 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-sm font-medium text-foreground shadow-xs transition-all hover:bg-muted sm:inline-flex"
            >
              <Home className="size-4" />
              View Site
            </Link>
          </div>
        </header>

        <div className="px-4 py-6 lg:px-8">{children}</div>
      </div>
    </div>
  );
};

export default DashboardLayoutShell;
