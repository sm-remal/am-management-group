"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useSyncExternalStore,
} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  User,
  UserPlus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import Logo from "../common/Logo";
import { usePublicSettings } from "@/features/settings/usePublicSettings";
import {
  COMPANY_DATA_UPDATED_EVENT,
  getPublishedCompanies,
} from "@/features/companies/company.api";
import type {
  BusinessCategory,
  CompanyRecord,
} from "@/features/companies/company.types";
import { logoutUser } from "@/features/auth/auth.api";
import {
  AUTH_SESSION_CHANGE_EVENT,
  getStoredAccessToken,
  getStoredAuthUser,
} from "@/features/auth/auth-session";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Services", href: "/services" },
  { name: "Projects", href: "/projects" },
  { name: "Careers", href: "/careers" },
  { name: "Gallery", href: "/gallery" },
  { name: "Contact", href: "/contact" },
];

const categoryLabels: Record<BusinessCategory, string> = {
  MANAGEMENT_INVESTMENT: "Management & Investment",
  CLEANING_SERVICES: "Cleaning & Services",
  ENGINEERING_MACHINERY: "Machinery & Engineering",
  PLANTATION_AGRICULTURE: "Plantation & Agriculture",
  RETAIL_TRADING: "Retail & Trading",
  TRAVEL_TOURISM: "Travel & Tourism",
};

const authOptions = [
  {
    name: "Login",
    href: "/login",
    description: "Sign in to your account",
    icon: User,
  },
  {
    name: "Registration",
    href: "/registration",
    description: "Create a new account",
    icon: UserPlus,
  },
];

const subscribeToAuthChanges = (callback: () => void) => {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === "am_access_token" || event.key === "am_auth_user") {
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
  const token = getStoredAccessToken();
  const user = getStoredAuthUser();

  return JSON.stringify({
    isLoggedIn: Boolean(token && user),
    user,
  });
};

const getServerAuthSnapshot = () =>
  JSON.stringify({
    isLoggedIn: false,
    user: null,
  });

const Navbar = () => {
  const settings = usePublicSettings();
  const [companies, setCompanies] = useState<CompanyRecord[]>([]);
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const isScrolledRef = useRef(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopAuthOpen, setIsDesktopAuthOpen] = useState(false);
  const authSnapshot = useSyncExternalStore(
    subscribeToAuthChanges,
    getAuthSnapshot,
    getServerAuthSnapshot,
  );
  const { isLoggedIn, user } = JSON.parse(authSnapshot) as {
    isLoggedIn: boolean;
    user: ReturnType<typeof getStoredAuthUser>;
  };

  const avatarText =
    user?.name?.slice(0, 2).toUpperCase() ||
    user?.email?.slice(0, 2).toUpperCase() ||
    "AM";

  useEffect(() => {
    let isMounted = true;

    const loadCompanies = async () => {
      try {
        const result = await getPublishedCompanies({ limit: 100 });

        if (isMounted) {
          setCompanies(result.data?.companies ?? []);
        }
      } catch {
        if (isMounted) {
          setCompanies([]);
        }
      }
    };

    const handleCompanyDataUpdated = () => {
      void loadCompanies();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void loadCompanies();
      }
    };

    window.addEventListener(
      COMPANY_DATA_UPDATED_EVENT,
      handleCompanyDataUpdated,
    );
    document.addEventListener("visibilitychange", handleVisibilityChange);
    void loadCompanies();

    return () => {
      isMounted = false;
      window.removeEventListener(
        COMPANY_DATA_UPDATED_EVENT,
        handleCompanyDataUpdated,
      );
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    let frameId = 0;

    const handleScroll = () => {
      if (frameId) return;

      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        const nextIsScrolled = window.scrollY > 20;

        if (isScrolledRef.current !== nextIsScrolled) {
          isScrolledRef.current = nextIsScrolled;
          setIsScrolled(nextIsScrolled);
        }
      });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await logoutUser();
    router.push("/login");
  };

  return (
    <div
      className={cn(
        "border-b bg-white/95 backdrop-blur-md transition-shadow duration-300 supports-[backdrop-filter]:bg-white/85",
        isScrolled
          ? "border-transparent shadow-[0_10px_30px_-18px_rgb(15_36_71/0.45)]"
          : "border-[var(--am-line)]",
      )}
    >
      <div className="container-am">
        <div className="flex h-[72px] items-center justify-between md:h-20">
          {/* Logo */}
          <Logo></Logo>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.slice(0, 2).map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "relative px-3 py-2 text-[0.93rem] font-semibold transition-colors after:absolute after:inset-x-3 after:bottom-0 after:h-[2px] after:origin-left after:scale-x-0 after:bg-secondary after:transition-transform after:duration-300 hover:after:scale-x-100",
                  isActive(link.href)
                    ? "text-[var(--am-harbour)] after:scale-x-100"
                    : "text-slate-600 hover:text-[var(--am-harbour)]",
                )}
              >
                {link.name}
              </Link>
            ))}

            {/* Companies Dropdown */}
            <DropdownMenu >
              <DropdownMenuTrigger
                render={
                  <button
                    className={cn(
                      "relative flex cursor-pointer items-center gap-1 px-3 py-2 text-[0.93rem] font-semibold outline-none transition-colors after:absolute after:inset-x-3 after:bottom-0 after:h-[2px] after:origin-left after:scale-x-0 after:bg-secondary after:transition-transform after:duration-300 hover:after:scale-x-100",
                      pathname.startsWith("/companies")
                        ? "text-[var(--am-harbour)] after:scale-x-100"
                        : "text-slate-600 hover:text-[var(--am-harbour)]",
                    )}
                  />
                }
              >
                Companies
                <ChevronDown className="h-3.5 w-3.5 opacity-70" />
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="start"
                className="w-[280px] p-2 -mt-2"
                sideOffset={8}
              >
                <div className="px-2 py-1.5 mb-1">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Our Companies
                  </p>
                </div>

                {companies.map((company) => (
                  <DropdownMenuItem
                    key={company.id}
                    className="flex flex-col items-start gap-0.5 px-2 py-2.5 cursor-pointer"
                    onClick={() => router.push(`/companies/${company.slug}`)}
                  >
                    <span className="text-sm font-medium text-slate-900">
                      {company.name}
                    </span>
                    <span className="text-xs text-slate-500">
                      {categoryLabels[company.category]}
                    </span>
                  </DropdownMenuItem>
                ))}

                <div className="border-t border-slate-100 mt-1 pt-1">
                  <DropdownMenuItem
                    className="justify-center text-sm font-medium text-slate-700 cursor-pointer"
                    onClick={() => router.push("/companies")}
                  >
                    View All Companies {"->"}
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {navLinks.slice(2).map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "relative px-3 py-2 text-[0.93rem] font-semibold transition-colors after:absolute after:inset-x-3 after:bottom-0 after:h-[2px] after:origin-left after:scale-x-0 after:bg-secondary after:transition-transform after:duration-300 hover:after:scale-x-100",
                  isActive(link.href)
                    ? "text-[var(--am-harbour)] after:scale-x-100"
                    : "text-slate-600 hover:text-[var(--am-harbour)]",
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center">
            <DropdownMenu
              open={isDesktopAuthOpen}
              onOpenChange={setIsDesktopAuthOpen}
            >
              <DropdownMenuTrigger
                render={
                  isLoggedIn ? (
                    <button
                      type="button"
                      className="flex size-10 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-primary bg-slate-100 text-sm font-bold text-slate-800 outline-none transition-all hover:ring-4 hover:ring-primary/10"
                      aria-label="Open account menu"
                      onMouseEnter={() => setIsDesktopAuthOpen(true)}
                    />
                  ) : (
                    <Button
                      size="sm"
                      className={cn(
                        "h-10 rounded-md px-5 text-sm font-bold transition-colors cursor-pointer",
                        "border-0 bg-secondary text-white hover:bg-[var(--am-signal-deep)]",
                      )}
                      onMouseEnter={() => setIsDesktopAuthOpen(true)}
                    />
                  )
                }
              >
                {isLoggedIn ? (
                  user?.avatar ? (
                    <span
                      className="size-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${user.avatar})` }}
                    />
                  ) : (
                    avatarText
                  )
                ) : (
                  <>
                    Get In Touch
                    <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                  </>
                )}
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                sideOffset={10}
                className="w-64 p-2"
              >
                {isLoggedIn ? (
                  <>
                    <div className="mb-1 px-2 py-1.5">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {user?.name || "Account"}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {user?.email || "Signed in"}
                      </p>
                    </div>
                    <DropdownMenuItem
                      className="flex items-center gap-3 rounded-lg px-2 py-2.5 cursor-pointer"
                      onClick={() => {
                        setIsDesktopAuthOpen(false);
                        router.push("/dashboard");
                      }}
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                        <LayoutDashboard className="h-4 w-4" />
                      </span>
                      <span className="flex flex-col items-start">
                        <span className="text-sm font-semibold text-slate-900">
                          Dashboard
                        </span>
                        <span className="text-xs text-slate-500">
                          Go to admin panel
                        </span>
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex items-center gap-3 rounded-lg px-2 py-2.5 cursor-pointer"
                      onClick={() => {
                        setIsDesktopAuthOpen(false);
                        void handleLogout();
                      }}
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                        <LogOut className="h-4 w-4" />
                      </span>
                      <span className="flex flex-col items-start">
                        <span className="text-sm font-semibold text-slate-900">
                          Logout
                        </span>
                        <span className="text-xs text-slate-500">
                          Sign out from account
                        </span>
                      </span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <div className="px-2 py-1.5 mb-1">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Auth Access
                      </p>
                    </div>

                    {authOptions.map((option) => {
                      const Icon = option.icon;

                      return (
                        <DropdownMenuItem
                          key={option.href}
                          className="flex items-center gap-3 rounded-lg px-2 py-2.5 cursor-pointer"
                          onClick={() => {
                            setIsDesktopAuthOpen(false);
                            router.push(option.href);
                          }}
                        >
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="flex flex-col items-start">
                            <span className="text-sm font-semibold text-slate-900">
                              {option.name}
                            </span>
                            <span className="text-xs text-slate-500">
                              {option.description}
                            </span>
                          </span>
                        </DropdownMenuItem>
                      );
                    })}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu */}
          <div className="lg:hidden">
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
              <SheetTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-slate-900 hover:bg-slate-100"
                    aria-label="Open menu"
                  />
                }
              >
                <Menu className="h-5 w-5" />
              </SheetTrigger>

              <SheetContent side="right" className="w-full sm:max-w-sm p-0">
                <SheetHeader className="border-b border-slate-100 px-6 py-5">
                  <SheetTitle className="text-left text-base font-semibold">
                    {settings.siteName}
                  </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col h-[calc(100%-5rem)] overflow-y-auto">
                  <nav className="flex-1 px-4 py-4 space-y-1">
                    {navLinks.map((link) => (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={() => setIsMobileOpen(false)}
                        className={cn(
                          "block px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                          isActive(link.href)
                            ? "bg-[var(--am-steel)] text-[var(--am-harbour)] shadow-[inset_3px_0_0_var(--am-signal)]"
                            : "text-slate-700 hover:bg-slate-50",
                        )}
                      >
                        {link.name}
                      </Link>
                    ))}

                    <div className="pt-3 mt-2 border-t border-slate-100">
                      <p className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Our Companies
                      </p>
                      <div className="space-y-0.5">
                        {companies.map((company) => (
                          <Link
                            key={company.id}
                            href={`/companies/${company.slug}`}
                            onClick={() => setIsMobileOpen(false)}
                            className="block px-3 py-2.5 rounded-lg hover:bg-slate-50"
                          >
                            <span className="block text-sm font-medium text-slate-800">
                              {company.name}
                            </span>
                            <span className="block text-xs text-slate-500 mt-0.5">
                              {categoryLabels[company.category]}
                            </span>
                          </Link>
                        ))}
                        <Link
                          href="/companies"
                          onClick={() => setIsMobileOpen(false)}
                          className="block px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                        >
                          View All Companies {"->"}
                        </Link>
                      </div>
                    </div>
                  </nav>

                  {/* Mobile CTA */}
                  <div className="border-t border-slate-100 p-4">
                    {isLoggedIn ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
                          <span
                            className="flex size-10 items-center justify-center overflow-hidden rounded-full bg-slate-200 bg-cover bg-center text-sm font-bold text-slate-700"
                            style={
                              user?.avatar
                                ? { backgroundImage: `url(${user.avatar})` }
                                : undefined
                            }
                          >
                            {!user?.avatar && avatarText}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold text-slate-900">
                              {user?.name || "Account"}
                            </span>
                            <span className="block truncate text-xs text-slate-500">
                              {user?.email || "Signed in"}
                            </span>
                          </span>
                        </div>
                        <Button
                          type="button"
                          className="w-full rounded-md"
                          size="lg"
                          onClick={() => {
                            setIsMobileOpen(false);
                            router.push("/dashboard");
                          }}
                        >
                          <LayoutDashboard className="size-4" />
                          Dashboard
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full rounded-md"
                          size="lg"
                          onClick={() => {
                            setIsMobileOpen(false);
                            void handleLogout();
                          }}
                        >
                          <LogOut className="size-4" />
                          Logout
                        </Button>
                      </div>
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              className="w-full rounded-md cursor-pointer"
                              size="lg"
                            />
                          }
                        >
                          Get In Touch
                          <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                          align="end"
                          side="top"
                          sideOffset={10}
                          className="w-[calc(100vw-2rem)] max-w-sm p-2"
                        >
                          <div className="px-2 py-1.5 mb-1">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                              Auth Access
                            </p>
                          </div>

                          {authOptions.map((option) => {
                            const Icon = option.icon;

                            return (
                              <DropdownMenuItem
                                key={option.href}
                                className="flex items-center gap-3 rounded-lg px-2 py-2.5 cursor-pointer"
                                onClick={() => {
                                  setIsMobileOpen(false);
                                  router.push(option.href);
                                }}
                              >
                                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                                  <Icon className="h-4 w-4" />
                                </span>
                                <span className="flex flex-col items-start">
                                  <span className="text-sm font-semibold text-slate-900">
                                    {option.name}
                                  </span>
                                  <span className="text-xs text-slate-500">
                                    {option.description}
                                  </span>
                                </span>
                              </DropdownMenuItem>
                            );
                          })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
