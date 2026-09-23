import { authApiRequest } from "@/lib/api/client";
import type { DashboardOverview } from "./dashboard.types";

export const getDashboardOverview = async (recentLimit = 5) => {
  return authApiRequest<DashboardOverview>(`/dashboard?recentLimit=${recentLimit}`);
};
