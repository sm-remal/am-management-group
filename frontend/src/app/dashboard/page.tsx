"use client";

import { useSyncExternalStore } from "react";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import UserDashboard from "@/components/dashboard/UserDashboard";
import {
  AUTH_SESSION_CHANGE_EVENT,
  getStoredAuthUser,
} from "@/features/auth/auth-session";

const subscribeToAuthChanges = (callback: () => void) => {
  window.addEventListener(AUTH_SESSION_CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(AUTH_SESSION_CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
};

const getRoleSnapshot = () => getStoredAuthUser()?.role === "ADMIN";
const getServerRoleSnapshot = () => false;

export default function DashboardPage() {
  const isAdmin = useSyncExternalStore(
    subscribeToAuthChanges,
    getRoleSnapshot,
    getServerRoleSnapshot,
  );

  return isAdmin ? (
    <DashboardOverview />
  ) : (
    <UserDashboard user={getStoredAuthUser()} />
  );
}
