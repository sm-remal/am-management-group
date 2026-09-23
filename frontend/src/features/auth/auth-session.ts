const ACCESS_TOKEN_KEY = "am_access_token";
const REFRESH_TOKEN_KEY = "am_refresh_token";
const AUTH_USER_KEY = "am_auth_user";
export const AUTH_SESSION_CHANGE_EVENT = "am-auth-session-change";

type JwtPayload = {
  exp?: number;
  [key: string]: unknown;
};

export type StoredAuthSession = {
  accessToken: string;
  refreshToken: string;
  user: StoredAuthUser;
};

export type StoredAuthUser = {
  id?: string;
  name?: string;
  email?: string;
  avatar?: string | null;
  role?: string;
  [key: string]: unknown;
};

const isBrowser = () => typeof window !== "undefined";

const emitAuthSessionChange = () => {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(new Event(AUTH_SESSION_CHANGE_EVENT));
};

const decodeJwtPayload = (token: string): JwtPayload | null => {
  try {
    const payload = token.split(".")[1];

    if (!payload) {
      return null;
    }

    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedPayload = normalizedPayload.padEnd(
      normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
      "=",
    );

    const jsonPayload = decodeURIComponent(
      window
        .atob(paddedPayload)
        .split("")
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`)
        .join(""),
    );

    return JSON.parse(jsonPayload) as JwtPayload;
  } catch {
    return null;
  }
};

export const getAccessTokenExpiresAt = (token: string) => {
  const payload = decodeJwtPayload(token);
  return payload?.exp ? payload.exp * 1000 : null;
};

/**
 * Only treat token as expired when exp exists and is in the past.
 * If exp is missing/unreadable, do NOT force-logout (prevents refresh redirect loops).
 */
export const isAccessTokenExpired = (token: string) => {
  const expiresAt = getAccessTokenExpiresAt(token);

  if (!expiresAt) {
    return false;
  }

  // small clock-skew tolerance (30s)
  return expiresAt <= Date.now() - 30_000;
};

export const saveAuthSession = (session: StoredAuthSession) => {
  if (!isBrowser()) {
    return;
  }

  localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(session.user));
  emitAuthSessionChange();
};

export const saveStoredAuthUser = (user: StoredAuthUser) => {
  if (!isBrowser()) {
    return;
  }

  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  emitAuthSessionChange();
};
export const clearAuthSession = () => {
  if (!isBrowser()) {
    return;
  }

  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  emitAuthSessionChange();
};

export const getStoredAccessToken = () => {
  if (!isBrowser()) {
    return null;
  }

  const token = localStorage.getItem(ACCESS_TOKEN_KEY);

  if (!token) {
    return null;
  }

  if (isAccessTokenExpired(token)) {
    // Keep refresh token available for future refresh flow; clear access only when expired
    clearAuthSession();
    return null;
  }

  return token;
};

export const getStoredRefreshToken = () => {
  if (!isBrowser()) {
    return null;
  }

  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const getStoredAuthUser = () => {
  if (!isBrowser()) {
    return null;
  }

  const rawUser = localStorage.getItem(AUTH_USER_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as StoredAuthUser;
  } catch {
    return null;
  }
};

/**
 * Returns true if any auth session marker exists in localStorage.
 * Useful for hydration-safe UI checks without aggressively clearing tokens.
 */
export const hasStoredSession = () => {
  if (!isBrowser()) {
    return false;
  }

  return Boolean(
    localStorage.getItem(ACCESS_TOKEN_KEY) ||
    localStorage.getItem(REFRESH_TOKEN_KEY),
  );
};

export const scheduleAutoLogout = (onLogout?: () => void) => {
  if (!isBrowser()) {
    return undefined;
  }

  const token = localStorage.getItem(ACCESS_TOKEN_KEY);

  if (!token) {
    return undefined;
  }

  const expiresAt = getAccessTokenExpiresAt(token);

  // If we cannot read exp, do not force logout
  if (!expiresAt) {
    return undefined;
  }

  if (expiresAt <= Date.now()) {
    clearAuthSession();
    onLogout?.();
    return undefined;
  }

  const timeoutId = window.setTimeout(() => {
    clearAuthSession();
    onLogout?.();
  }, expiresAt - Date.now());

  return () => window.clearTimeout(timeoutId);
};
