"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";

import BrandLogo from "@/components/common/BrandLogo";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginUser } from "@/features/auth/auth.api";
import GoogleAuthButton from "./GoogleAuthButton";

// =====================================================
// BRAND COLORS
// =====================================================

const BRAND_PRIMARY = "#234279";
const BRAND_HOVER = "#fb731f";

// =====================================================
// ZOD SCHEMA
// =====================================================

const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" }),

  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),

  rememberMe: z.boolean().optional(),
});

// =====================================================
// TYPES
// =====================================================

type LoginFormData = z.infer<typeof loginSchema>;

// =====================================================
// COMPONENT
// =====================================================

const LoginForm: React.FC = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // =====================================================
  // REACT HOOK FORM
  // =====================================================

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),

    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  // =====================================================
  // NORMAL LOGIN
  // =====================================================

  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    setIsLoading(true);
    setSubmitError(null);

    try {
      await loginUser({
        email: data.email,
        password: data.password,
      });

      router.replace("/dashboard");
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Login failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // =====================================================
  // GOOGLE LOGIN
  // =====================================================

  const handleGoogleLoginError = (message: string) => {
    setSubmitError(message || null);
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen w-full bg-slate-50 font-sans">
      <div className="grid min-h-screen w-full lg:grid-cols-2">
        {/* =================================================
            LEFT SIDE - BRANDING
        ================================================= */}

        <section className="relative hidden overflow-hidden bg-white lg:flex lg:flex-col lg:items-center lg:justify-center lg:p-12 xl:p-16">
          {/* Decorative Background */}
          <div
            className="absolute -left-32 -top-32 h-80 w-80 rounded-full opacity-10 blur-3xl"
            style={{ backgroundColor: BRAND_PRIMARY }}
          />

          <div
            className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full opacity-10 blur-3xl"
            style={{ backgroundColor: BRAND_HOVER }}
          />

          <div className="relative z-10 flex max-w-lg flex-col items-center text-center">
            {/* Logo */}
            <div className="mb-5 rounded-2xl bg-white px-7 py-5 shadow-sm">
              <BrandLogo
                className="h-auto w-52 object-contain"
                priority
              />
            </div>

            {/* Heading */}
            <h1 className="text-2xl font-semibold leading-tight tracking-tight text-slate-900 xl:text-2xl">
              One Group. Multiple Businesses.
              <span
                className="mt-2 block font-black transition-colors duration-300"
                style={{ color: BRAND_PRIMARY }}
              >
                Diverse Expertise
              </span>
            </h1>

            {/* Description */}
            <p className="mt-6 max-w-md text-sm leading-7 text-slate-500">
              Your trusted Malaysian corporate group delivering excellence in
              Construction, Real Estate Development, Commercial Cleaning,
              Engineering, Agriculture, and Retail services.
            </p>

            {/* Feature Items */}
            <div className="mt-9 grid w-full grid-cols-3 gap-3">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p
                  className="text-xs sm:text-sm font-bold"
                  style={{ color: BRAND_PRIMARY }}
                >
                  Construction
                </p>

                <p className="mt-1 text-[10px] text-slate-400">
                  Civil & Property
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p
                  className="text-xs sm:text-sm font-bold"
                  style={{ color: BRAND_PRIMARY }}
                >
                  Facility Services
                </p>

                <p className="mt-1 text-[10px] text-slate-400">BM Magnitude</p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p
                  className="text-xs sm:text-sm font-bold"
                  style={{ color: BRAND_PRIMARY }}
                >
                  Multi-Trade
                </p>

                <p className="mt-1 text-[10px] text-slate-400">
                  Retail & Services
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            RIGHT SIDE - LOGIN FORM
        ================================================= */}

        <section className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-5 py-10 sm:px-8 lg:px-12 xl:px-20">
          <div className="w-full max-w-md">
            {/* =================================================
                MOBILE LOGO
            ================================================= */}

            <div className="mb-8 flex justify-center lg:hidden">
              <div className="rounded-2xl border border-slate-100 bg-white px-6 py-4 shadow-sm">
                <BrandLogo
                  className="h-auto w-40 object-contain"
                  priority
                />
              </div>
            </div>

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="mb-8 text-center">
              <h2 className="text-2xl font-black tracking-tight text-slate-950 sm:text-2xl">
                Welcome Back
              </h2>

              <p className="mx-auto mt-3 max-w-sm text-xs leading-6 text-slate-500 sm:text-sm">
                Log in to access your AM Management Group corporate portal and
                services.
              </p>
            </div>

            {/* =================================================
                LOGIN FORM
            ================================================= */}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {submitError && (
                <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>{submitError}</p>
                </div>
              )}

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-xs font-bold text-slate-700"
                >
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  {...register("email")}
                  className={`h-12 w-full rounded-xl border bg-white px-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:ring-4 ${
                    errors.email
                      ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                      : "border-slate-200 focus:ring-slate-100"
                  }`}
                  onFocus={(e) => {
                    if (!errors.email) {
                      e.currentTarget.style.borderColor = BRAND_PRIMARY;
                    }
                  }}
                  onBlur={(e) => {
                    if (!errors.email) {
                      e.currentTarget.style.borderColor = "";
                    }
                  }}
                />

                {errors.email && (
                  <p className="mt-1.5 text-xs font-medium text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-xs font-bold text-slate-700"
                >
                  Password
                </label>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    {...register("password")}
                    className={`h-12 w-full rounded-xl border bg-white px-4 pr-12 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:ring-4 ${
                      errors.password
                        ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                        : "border-slate-200 focus:ring-slate-100"
                    }`}
                    onFocus={(e) => {
                      if (!errors.password) {
                        e.currentTarget.style.borderColor = BRAND_PRIMARY;
                      }
                    }}
                    onBlur={(e) => {
                      if (!errors.password) {
                        e.currentTarget.style.borderColor = "";
                      }
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-slate-100"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = BRAND_PRIMARY;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "";
                    }}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>

                {errors.password && (
                  <p className="mt-1.5 text-xs font-medium text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between gap-4 pt-1">
                <label
                  htmlFor="rememberMe"
                  className="flex cursor-pointer items-center gap-2 text-xs text-slate-600"
                >
                  <input
                    id="rememberMe"
                    type="checkbox"
                    {...register("rememberMe")}
                    className="h-4 w-4 cursor-pointer rounded border-slate-300"
                    style={{
                      accentColor: BRAND_PRIMARY,
                    }}
                  />

                  <span>Remember me</span>
                </label>

                <Link
                  href="/forgot-password"
                  className="text-xs font-bold transition-colors duration-300 hover:underline"
                  style={{
                    color: BRAND_PRIMARY,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = BRAND_HOVER;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = BRAND_PRIMARY;
                  }}
                >
                  Forgot password?
                </Link>
              </div>

              {/* =================================================
                  LOGIN BUTTON
              ================================================= */}

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  backgroundColor: BRAND_PRIMARY,
                }}
                className="mt-2 flex h-12 w-full cursor-pointer items-center justify-center rounded-xl px-4 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = BRAND_HOVER;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = BRAND_PRIMARY;
                  }
                }}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Login"
                )}
              </button>
            </form>

            {/* =================================================
                DIVIDER
            ================================================= */}

            <div className="relative my-7 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>

              <span className="relative bg-slate-50 px-4 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                Or continue with
              </span>
            </div>

            {/* =================================================
                GOOGLE LOGIN
            ================================================= */}

            <GoogleAuthButton
              text="signin_with"
              disabled={isLoading}
              onSuccess={() => router.replace("/dashboard")}
              onError={handleGoogleLoginError}
            />

            {/* =================================================
                REGISTER
            ================================================= */}

            <p className="mt-7 text-center text-xs text-slate-500 sm:text-sm">
              Don&apos;t have an account?{" "}
              <Link
                href="/registration"
                className="font-bold transition-colors duration-300 hover:underline"
                style={{
                  color: BRAND_PRIMARY,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = BRAND_HOVER;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = BRAND_PRIMARY;
                }}
              >
                Create one
              </Link>
            </p>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-[10px] text-slate-400">
                Â© {new Date().getFullYear()} AM Management Group Sdn. Bhd. All
                rights reserved.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LoginForm;
