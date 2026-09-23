"use client";

import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  Phone,
  RefreshCw,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { changePassword, getCurrentUser } from "@/features/auth/auth.api";
import { saveStoredAuthUser } from "@/features/auth/auth-session";
import { updateMyProfile } from "@/features/users/user.api";
import type { UserRecord } from "@/features/users/user.types";
import { cn } from "@/lib/utils";

type ProfileFormState = {
  name: string;
  phone: string;
  avatar: string;
};

type PasswordFormState = {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

const emptyProfileForm: ProfileFormState = {
  name: "",
  phone: "",
  avatar: "",
};

const emptyPasswordForm: PasswordFormState = {
  currentPassword: "",
  newPassword: "",
  confirmNewPassword: "",
};

const passwordRule = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const formatDate = (value: string | null) => {
  if (!value) return "Never";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
};

const getInitials = (user: UserRecord | null) => {
  const source = user?.name || user?.email || "AM";
  return source.slice(0, 2).toUpperCase();
};

const ProfileManagement = () => {
  const [user, setUser] = useState<UserRecord | null>(null);
  const [profileForm, setProfileForm] = useState<ProfileFormState>(emptyProfileForm);
  const [passwordForm, setPasswordForm] = useState<PasswordFormState>(emptyPasswordForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState(false);

  const avatarPreview = profileForm.avatar.trim();

  const accountStats = useMemo(
    () => [
      { label: "Role", value: user?.role ?? "-" },
      { label: "Status", value: user?.isActive ? "Active" : "Inactive" },
      { label: "Last login", value: formatDate(user?.lastLoginAt ?? null) },
    ],
    [user],
  );

  const syncUser = useCallback((nextUser: UserRecord) => {
    setUser(nextUser);
    setProfileForm({
      name: nextUser.name ?? "",
      phone: nextUser.phone ?? "",
      avatar: nextUser.avatar ?? "",
    });
    saveStoredAuthUser(nextUser);
  }, []);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setProfileError(null);

    try {
      const result = await getCurrentUser();
      const nextUser = result.data?.user as UserRecord | undefined;

      if (!nextUser) {
        throw new Error("Unable to load profile");
      }

      syncUser(nextUser);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Unable to load profile");
    } finally {
      setIsLoading(false);
    }
  }, [syncUser]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadProfile();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadProfile]);

  const validateProfile = () => {
    if (!profileForm.name.trim()) return "Name is required";

    if (profileForm.avatar.trim()) {
      try {
        new URL(profileForm.avatar.trim());
      } catch {
        return "Avatar must be a valid URL";
      }
    }

    return null;
  };

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validateProfile();

    if (validationError) {
      setProfileError(validationError);
      return;
    }

    setIsProfileSubmitting(true);
    setProfileError(null);
    setProfileSuccess(null);

    try {
      const result = await updateMyProfile({
        name: profileForm.name.trim(),
        phone: profileForm.phone.trim() || null,
        avatar: profileForm.avatar.trim() || null,
      });
      const nextUser = result.data?.user;

      if (nextUser) {
        syncUser(nextUser);
      }

      setProfileSuccess("Profile updated successfully");
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Unable to update profile");
    } finally {
      setIsProfileSubmitting(false);
    }
  };

  const validatePassword = () => {
    if (!passwordForm.currentPassword) return "Current password is required";
    if (!passwordRule.test(passwordForm.newPassword)) {
      return "New password must be 8+ characters with uppercase, lowercase, number and special character";
    }
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      return "New password and confirm password do not match";
    }

    return null;
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validatePassword();

    if (validationError) {
      setPasswordError(validationError);
      return;
    }

    setIsPasswordSubmitting(true);
    setPasswordError(null);
    setPasswordSuccess(null);

    try {
      await changePassword(passwordForm);
      setPasswordForm(emptyPasswordForm);
      setPasswordSuccess("Password changed successfully");
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Unable to change password");
    } finally {
      setIsPasswordSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-lg border border-slate-200 bg-white">
        <div className="text-center text-sm text-slate-500">
          <Loader2 className="mx-auto mb-3 size-7 animate-spin text-[#234279]" />
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#fb731f]">My Profile</p>
          <h1 className="mt-1 text-2xl font-bold tracking-normal text-slate-950 md:text-3xl">
            Account details
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            View your account information, update your profile, and change your password.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={() => void loadProfile()} disabled={isLoading}>
          <RefreshCw className={cn("size-4", isLoading && "animate-spin")} />
          Refresh
        </Button>
      </section>

      <section className="grid gap-4 lg:grid-cols-[22rem_minmax(0,1fr)]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col items-center text-center">
            {avatarPreview ? (
              <div
                className="size-24 rounded-lg bg-cover bg-center ring-1 ring-slate-200"
                style={{ backgroundImage: `url(${avatarPreview})` }}
                aria-label="Profile avatar preview"
              />
            ) : (
              <div className="flex size-24 items-center justify-center rounded-lg bg-[#234279] text-2xl font-bold text-white">
                {getInitials(user)}
              </div>
            )}
            <h2 className="mt-4 text-lg font-bold text-slate-950">{user?.name}</h2>
            <p className="mt-1 break-all text-sm text-slate-500">{user?.email}</p>
          </div>

          <div className="mt-6 space-y-3">
            {accountStats.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 text-sm">
                <span className="text-slate-500">{item.label}</span>
                <span className="font-semibold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={(event) => void handleProfileSubmit(event)} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50 text-[#234279]">
              <UserRound className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-950">Profile information</h2>
              <p className="text-sm text-slate-500">Name, phone and avatar can be updated.</p>
            </div>
          </div>

          {profileError && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <p>{profileError}</p>
            </div>
          )}

          {profileSuccess && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
              <p>{profileSuccess}</p>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="profile-name" className="mb-1.5 block text-xs font-bold text-slate-700">Name</label>
              <Input
                id="profile-name"
                value={profileForm.name}
                onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))}
                className="h-10"
                placeholder="Full name"
              />
            </div>
            <div>
              <label htmlFor="profile-email" className="mb-1.5 block text-xs font-bold text-slate-700">Email</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input id="profile-email" value={user?.email ?? ""} disabled className="h-10 pl-9" />
              </div>
            </div>
            <div>
              <label htmlFor="profile-phone" className="mb-1.5 block text-xs font-bold text-slate-700">Phone</label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="profile-phone"
                  value={profileForm.phone}
                  onChange={(event) => setProfileForm((current) => ({ ...current, phone: event.target.value }))}
                  className="h-10 pl-9"
                  placeholder="Phone number"
                />
              </div>
            </div>
            <div>
              <label htmlFor="profile-role" className="mb-1.5 block text-xs font-bold text-slate-700">Role</label>
              <div className="relative">
                <ShieldCheck className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input id="profile-role" value={user?.role ?? ""} disabled className="h-10 pl-9" />
              </div>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="profile-avatar" className="mb-1.5 block text-xs font-bold text-slate-700">Avatar URL</label>
              <Input
                id="profile-avatar"
                value={profileForm.avatar}
                onChange={(event) => setProfileForm((current) => ({ ...current, avatar: event.target.value }))}
                className="h-10"
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Button type="submit" disabled={isProfileSubmitting}>
              {isProfileSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              Save Profile
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isProfileSubmitting || !user}
              onClick={() => user && syncUser(user)}
            >
              Reset
            </Button>
          </div>
        </form>
      </section>

      <form onSubmit={(event) => void handlePasswordSubmit(event)} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
              <LockKeyhole className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-950">Reset password</h2>
              <p className="text-sm text-slate-500">Confirm your current password before setting a new one.</p>
            </div>
          </div>
          <Button type="button" variant="outline" onClick={() => setShowPasswords((current) => !current)}>
            {showPasswords ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            {showPasswords ? "Hide" : "Show"}
          </Button>
        </div>

        {passwordError && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <p>{passwordError}</p>
          </div>
        )}

        {passwordSuccess && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
            <p>{passwordSuccess}</p>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label htmlFor="current-password" className="mb-1.5 block text-xs font-bold text-slate-700">Current password</label>
            <Input
              id="current-password"
              type={showPasswords ? "text" : "password"}
              value={passwordForm.currentPassword}
              onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))}
              className="h-10"
            />
          </div>
          <div>
            <label htmlFor="new-password" className="mb-1.5 block text-xs font-bold text-slate-700">New password</label>
            <Input
              id="new-password"
              type={showPasswords ? "text" : "password"}
              value={passwordForm.newPassword}
              onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))}
              className="h-10"
            />
          </div>
          <div>
            <label htmlFor="confirm-new-password" className="mb-1.5 block text-xs font-bold text-slate-700">Confirm password</label>
            <Input
              id="confirm-new-password"
              type={showPasswords ? "text" : "password"}
              value={passwordForm.confirmNewPassword}
              onChange={(event) => setPasswordForm((current) => ({ ...current, confirmNewPassword: event.target.value }))}
              className="h-10"
            />
          </div>
        </div>

        <p className="mt-3 text-xs leading-5 text-slate-500">
          Use 8+ characters with uppercase, lowercase, number and special character.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <Button type="submit" disabled={isPasswordSubmitting}>
            {isPasswordSubmitting ? <Loader2 className="size-4 animate-spin" /> : <LockKeyhole className="size-4" />}
            Change Password
          </Button>
          <Button type="button" variant="outline" disabled={isPasswordSubmitting} onClick={() => setPasswordForm(emptyPasswordForm)}>
            Clear
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfileManagement;
