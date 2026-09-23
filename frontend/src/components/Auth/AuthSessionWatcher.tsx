"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  AUTH_SESSION_CHANGE_EVENT,
  clearAuthSession,
  scheduleAutoLogout,
} from "@/features/auth/auth-session";

const AuthSessionWatcher = () => {
  const router = useRouter();

  useEffect(() => {
    let cleanupAutoLogout: (() => void) | undefined;

    const handleLogout = () => {
      if (window.location.pathname !== "/login") {
        router.replace("/login");
      }
    };

    const scheduleSessionLogout = () => {
      cleanupAutoLogout?.();
      cleanupAutoLogout = scheduleAutoLogout(handleLogout);
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === "am_access_token" && !event.newValue) {
        clearAuthSession();
        handleLogout();
      }

      if (event.key === "am_access_token") {
        scheduleSessionLogout();
      }
    };

    scheduleSessionLogout();
    window.addEventListener("storage", handleStorage);
    window.addEventListener(AUTH_SESSION_CHANGE_EVENT, scheduleSessionLogout);

    return () => {
      cleanupAutoLogout?.();
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(AUTH_SESSION_CHANGE_EVENT, scheduleSessionLogout);
    };
  }, [router]);

  return null;
};

export default AuthSessionWatcher;
