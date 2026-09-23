"use client";

import Link from "next/link";
import { FormEvent, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { resetPassword } from "@/features/auth/auth.api";

const passwordRules =
  "8+ characters, including uppercase, lowercase, number, and special character";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={<div className="min-h-[calc(100vh-5rem)] bg-slate-50" />}
    >
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const token = useSearchParams().get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!token) {
      setError(
        "This reset link is missing or invalid. Please request a new one.",
      );
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (
      !/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password)
    ) {
      setError(`Password must contain ${passwordRules}.`);
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword({ token, password });
      setIsComplete(true);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to reset your password.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-slate-50 px-5 py-12">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/60 sm:p-9">
        <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
          <KeyRound size={24} />
        </div>
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-orange-600">
          Account recovery
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Set a new password
        </h1>
        {isComplete ? (
          <div className="mt-6 space-y-5">
            <p className="flex gap-2 rounded-lg bg-emerald-50 px-3 py-3 text-sm text-emerald-800">
              <CheckCircle2 size={18} className="shrink-0" />
              Your password has been reset successfully.
            </p>
            <Link
              href="/login"
              className="flex h-12 items-center justify-center rounded-xl bg-[#234279] text-sm font-bold text-white hover:bg-[#fb731f]"
            >
              Continue to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <p className="text-sm leading-6 text-slate-600">
              Choose a strong password for your account.
            </p>
            <PasswordField
              id="password"
              label="New password"
              value={password}
              onChange={setPassword}
              visible={showPassword}
              onToggle={() => setShowPassword((value) => !value)}
            />
            <PasswordField
              id="confirm-password"
              label="Confirm new password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              visible={showConfirmPassword}
              onToggle={() => setShowConfirmPassword((value) => !value)}
            />
            <p className="text-xs text-slate-500">
              Password must have {passwordRules}.
            </p>
            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#234279] px-4 text-sm font-bold text-white transition hover:bg-[#fb731f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading && <Loader2 size={18} className="animate-spin" />}
              {isLoading ? "Updating..." : "Update password"}
            </button>
          </form>
        )}
        {!isComplete && (
          <Link
            href="/login"
            className="mt-7 flex items-center justify-center gap-2 text-sm font-semibold text-[#234279] hover:text-[#fb731f]"
          >
            <ArrowLeft size={16} />
            Back to login
          </Link>
        )}
      </section>
    </div>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  visible,
  onToggle,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="block text-sm font-semibold text-slate-700" htmlFor={id}>
      {label}
      <div className="relative mt-2">
        <input
          id={id}
          type={visible ? "text" : "password"}
          required
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-12 w-full rounded-xl border border-slate-300 px-3 pr-11 text-sm text-slate-900 outline-none transition focus:border-[#234279] focus:ring-2 focus:ring-[#234279]/15"
        />
        <button
          type="button"
          aria-label={
            visible
              ? `Hide ${label.toLowerCase()}`
              : `Show ${label.toLowerCase()}`
          }
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#234279]"
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </label>
  );
}
