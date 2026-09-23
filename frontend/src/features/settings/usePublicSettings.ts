"use client";

import { useEffect, useState } from "react";

// Single source of truth for types, defaults and mapping lives in ./public-settings
// (previously duplicated here with stale placeholder values).
import {
  defaultPublicSettings,
  fetchPublicSettings as fetchFromApi,
  type PublicSettings,
} from "./public-settings";

export { defaultPublicSettings, type PublicSettings };

/** Client-side fetch that never throws: falls back to defaults. */
export const fetchPublicSettings = async (): Promise<PublicSettings> => {
  try {
    return await fetchFromApi({ cache: "no-store" });
  } catch (error) {
    console.error("Failed to fetch public settings:", error);
    return defaultPublicSettings;
  }
};

let cachedSettings: PublicSettings | null = null;
let pendingSettingsRequest: Promise<PublicSettings> | null = null;
const publicSettingsUpdatedEvent = "public-settings-updated";

const loadPublicSettings = (forceRefresh = false): Promise<PublicSettings> => {
  if (cachedSettings && !forceRefresh) {
    return Promise.resolve(cachedSettings);
  }

  pendingSettingsRequest ??= fetchPublicSettings()
    .then((settings) => {
      cachedSettings = settings;
      return settings;
    })
    .finally(() => {
      pendingSettingsRequest = null;
    });

  return pendingSettingsRequest;
};

export const invalidatePublicSettings = () => {
  cachedSettings = null;

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(publicSettingsUpdatedEvent));
  }
};

export const usePublicSettings = (): PublicSettings => {
  const [settings, setSettings] = useState<PublicSettings>(
    cachedSettings ?? defaultPublicSettings,
  );

  useEffect(() => {
    let isMounted = true;

    const refreshSettings = () => {
      cachedSettings = null;

      loadPublicSettings(true)
        .then((loadedSettings) => {
          if (isMounted) {
            setSettings(loadedSettings);
          }
        })
        .catch((error) => {
          console.error("Failed to load public settings:", error);
        });
    };

    const handleSettingsUpdated = () => refreshSettings();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshSettings();
      }
    };

    window.addEventListener(publicSettingsUpdatedEvent, handleSettingsUpdated);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    refreshSettings();

    return () => {
      isMounted = false;
      window.removeEventListener(
        publicSettingsUpdatedEvent,
        handleSettingsUpdated,
      );
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return settings;
};

/*
 * Keep this exported helper available for consumers that need to update settings
 * outside the admin settings screen.
 */
export const refreshPublicSettings = () => {
  cachedSettings = null;

  return loadPublicSettings(true);
};

export default usePublicSettings;
