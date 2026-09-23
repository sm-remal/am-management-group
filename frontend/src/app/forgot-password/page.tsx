"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, CheckCircle2, KeyRound, Loader2, Mail } from "lucide-react";
import { forgotPassword } from "@/features/auth/auth.api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      await forgotPassword({ email: email.trim().toLowerCase() });
      setMessage(
        "If an account exists with this email, a password reset link has been sent. Please check your inbox.",
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to process your request.",
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
          Forgot password?
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Enter the email address associated with your account and we&apos;ll
          help you set a new password.
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <label
            className="block text-sm font-semibold text-slate-700"
            htmlFor="email"
          >
            Email address
            <div className="relative mt-2">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="h-12 w-full rounded-xl border border-slate-300 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-[#234279] focus:ring-2 focus:ring-[#234279]/15"
              />
            </div>
          </label>
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
          {message && (
            <div className="space-y-3 rounded-lg bg-emerald-50 px-3 py-3 text-sm text-emerald-800">
              <p className="flex gap-2">
                <CheckCircle2 size={18} className="shrink-0" />
                {message}
              </p>
            </div>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#234279] px-4 text-sm font-bold text-white transition hover:bg-[#fb731f] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading && <Loader2 size={18} className="animate-spin" />}
            {isLoading ? "Sending email..." : "Send reset instructions"}
          </button>
        </form>

        <Link
          href="/login"
          className="mt-7 flex items-center justify-center gap-2 text-sm font-semibold text-[#234279] hover:text-[#fb731f]"
        >
          <ArrowLeft size={16} />
          Back to login
        </Link>
      </section>
    </div>
  );
}
