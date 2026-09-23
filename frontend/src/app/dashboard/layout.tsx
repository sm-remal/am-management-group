import type { Metadata } from "next";
import type { ReactNode } from "react";
import DashboardLayoutShell from "@/components/dashboard/DashboardLayoutShell";

export const metadata: Metadata = {
  title: "Dashboard | AM Management Group",
  description: "AM Management Group admin dashboard",
};

export default function DashboardLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <DashboardLayoutShell>{children}</DashboardLayoutShell>;
}
