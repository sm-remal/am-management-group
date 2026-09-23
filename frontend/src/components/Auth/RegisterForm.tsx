"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";

import BrandLogo from "@/components/common/BrandLogo";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerUser } from "@/features/auth/auth.api";
import GoogleAuthButton from "./GoogleAuthButton";

// =====================================================
// BRAND COLORS
// =====================================================

const BRAND_PRIMARY = "#234279";
const BRAND_HOVER = "#fb731f";

// =====================================================
// ZOD SCHEMA
// =====================================================

const registerSchema = z
  .object({
    firstName: z.string().trim().min(1, { message: "First name is required" }),
    lastName: z.string().trim().min(1, { message: "Last name is required" }),
    email: z
      .string()
      .trim()
      .min(1, { message: "Email is required" })
      .email({ message: "Invalid email address" }),
    phone: z
      .string()
      .trim()
      .max(20, { message: "Phone number must be 20 characters or less" })
      .optional(),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(/[A-Z]/, {
        message: "Password must contain at least one uppercase letter",
      })
      .regex(/[a-z]/, {
        message: "Password must contain at least one lowercase letter",
      })
      .regex(/[0-9]/, { message: "Password must contain at least one number" })
      .regex(/[^A-Za-z0-9]/, {
        message: "Password must contain at least one special character",
      }),
    confirmPassword: z
      .string()
      .min(1, { message: "Please confirm your password" }),
    terms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the Terms and Conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// =====================================================
// TYPES
// =====================================================

type RegisterFormData = z.infer<typeof registerSchema>;

// =====================================================
// COMPONENT
// =====================================================

const RegisterForm: React.FC = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // =====================================================
  // REACT HOOK FORM
  // =====================================================

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  // =====================================================
  // SUBMIT HANDLER
  // =====================================================

  const onSubmit: SubmitHandler<RegisterFormData> = async (data) => {
    setIsLoading(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      await registerUser({
        name: `${data.firstName} ${data.lastName}`.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone?.trim() || undefined,
        password: data.password,
      });

      setSubmitSuccess(
        "Account created successfully. Redirecting to dashboard...",
      );
      router.replace("/dashboard");
    } catch (error) {
      console.error("Registration failed:", error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Registration failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // =====================================================
  // GOOGLE REGISTER
  // =====================================================

  const handleGoogleRegisterError = (message: string) => {
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
              Create an account to join AM Management Group portal and access
              our premier services in Construction, Facility Management, and
              Retail solutions.
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
            RIGHT SIDE - REGISTER FORM
        ================================================= */}

        <section className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-5 py-10 sm:px-8 lg:px-12 xl:px-16">
          <div className="w-full max-w-lg">
            {/* Mobile Logo */}
            <div className="mb-6 flex justify-center lg:hidden">
              <div className="rounded-2xl border border-slate-100 bg-white px-6 py-4 shadow-sm">
                <BrandLogo
                  className="h-auto w-40 object-contain"
                  priority
                />
              </div>
            </div>

            {/* Header */}
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-black tracking-tight text-slate-950 sm:text-2xl">
                Create an Account
              </h2>

              <p className="mx-auto mt-2 max-w-sm text-xs leading-6 text-slate-500 sm:text-sm">
                Join AM Management Group to get started with our enterprise
                services.
              </p>
            </div>

            {/* =================================================
                REGISTER FORM
            ================================================= */}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {submitError && (
                <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>{submitError}</p>
                </div>
              )}

              {submitSuccess && (
                <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>{submitSuccess}</p>
                </div>
              )}

              {/* Name Fields (2 Columns) */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* First Name */}
                <div>
                  <label
                    htmlFor="firstName"
                    className="mb-1.5 block text-xs font-bold text-slate-700"
                  >
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    {...register("firstName")}
                    className={`h-11 w-full rounded-xl border bg-white px-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:ring-4 ${
                      errors.firstName
                        ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                        : "border-slate-200 focus:ring-slate-100"
                    }`}
                    onFocus={(e) => {
                      if (!errors.firstName)
                        e.currentTarget.style.borderColor = BRAND_PRIMARY;
                    }}
                    onBlur={(e) => {
                      if (!errors.firstName)
                        e.currentTarget.style.borderColor = "";
                    }}
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-xs font-medium text-red-500">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label
                    htmlFor="lastName"
                    className="mb-1.5 block text-xs font-bold text-slate-700"
                  >
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    {...register("lastName")}
                    className={`h-11 w-full rounded-xl border bg-white px-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:ring-4 ${
                      errors.lastName
                        ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                        : "border-slate-200 focus:ring-slate-100"
                    }`}
                    onFocus={(e) => {
                      if (!errors.lastName)
                        e.currentTarget.style.borderColor = BRAND_PRIMARY;
                    }}
                    onBlur={(e) => {
                      if (!errors.lastName)
                        e.currentTarget.style.borderColor = "";
                    }}
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-xs font-medium text-red-500">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Email & Phone (2 Columns) */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-xs font-bold text-slate-700"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    {...register("email")}
                    className={`h-11 w-full rounded-xl border bg-white px-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:ring-4 ${
                      errors.email
                        ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                        : "border-slate-200 focus:ring-slate-100"
                    }`}
                    onFocus={(e) => {
                      if (!errors.email)
                        e.currentTarget.style.borderColor = BRAND_PRIMARY;
                    }}
                    onBlur={(e) => {
                      if (!errors.email) e.currentTarget.style.borderColor = "";
                    }}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs font-medium text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="mb-1.5 block text-xs font-bold text-slate-700"
                  >
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="+60 12-345 6789"
                    {...register("phone")}
                    className={`h-11 w-full rounded-xl border bg-white px-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:ring-4 ${
                      errors.phone
                        ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                        : "border-slate-200 focus:ring-slate-100"
                    }`}
                    onFocus={(e) => {
                      if (!errors.phone)
                        e.currentTarget.style.borderColor = BRAND_PRIMARY;
                    }}
                    onBlur={(e) => {
                      if (!errors.phone) e.currentTarget.style.borderColor = "";
                    }}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs font-medium text-red-500">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Password & Confirm Password (2 Columns) */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-1.5 block text-xs font-bold text-slate-700"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter a strong password"
                      {...register("password")}
                      className={`h-11 w-full rounded-xl border bg-white px-4 pr-10 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:ring-4 ${
                        errors.password
                          ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                          : "border-slate-200 focus:ring-slate-100"
                      }`}
                      onFocus={(e) => {
                        if (!errors.password)
                          e.currentTarget.style.borderColor = BRAND_PRIMARY;
                      }}
                      onBlur={(e) => {
                        if (!errors.password)
                          e.currentTarget.style.borderColor = "";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-xs font-medium text-red-500">
                      {errors.password.message}
                    </p>
                  )}
                  <p className="mt-1 text-[11px] leading-4 text-slate-400">
                    Use 8+ characters with uppercase, lowercase, number and
                    special character.
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-1.5 block text-xs font-bold text-slate-700"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      {...register("confirmPassword")}
                      className={`h-11 w-full rounded-xl border bg-white px-4 pr-10 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:ring-4 ${
                        errors.confirmPassword
                          ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                          : "border-slate-200 focus:ring-slate-100"
                      }`}
                      onFocus={(e) => {
                        if (!errors.confirmPassword)
                          e.currentTarget.style.borderColor = BRAND_PRIMARY;
                      }}
                      onBlur={(e) => {
                        if (!errors.confirmPassword)
                          e.currentTarget.style.borderColor = "";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs font-medium text-red-500">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Terms & Conditions Checkbox */}
              <div>
                <label
                  htmlFor="terms"
                  className="flex cursor-pointer items-start gap-2 text-xs text-slate-600"
                >
                  <input
                    id="terms"
                    type="checkbox"
                    {...register("terms")}
                    className="mt-0.5 h-4 w-4 cursor-pointer rounded border-slate-300"
                    style={{ accentColor: BRAND_PRIMARY }}
                  />
                  <span>
                    I agree to the{" "}
                    <Link
                      href="/terms"
                      className="font-semibold underline text-slate-800"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="font-semibold underline text-slate-800"
                    >
                      Privacy Policy
                    </Link>
                  </span>
                </label>
                {errors.terms && (
                  <p className="mt-1 text-xs font-medium text-red-500">
                    {errors.terms.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                style={{ backgroundColor: BRAND_PRIMARY }}
                className="mt-2 flex h-12 w-full cursor-pointer items-center justify-center rounded-xl px-4 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                onMouseEnter={(e) => {
                  if (!isLoading)
                    e.currentTarget.style.backgroundColor = BRAND_HOVER;
                }}
                onMouseLeave={(e) => {
                  if (!isLoading)
                    e.currentTarget.style.backgroundColor = BRAND_PRIMARY;
                }}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <span className="relative bg-slate-50 px-4 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                Or sign up with
              </span>
            </div>

            {/* Google Signup Button */}
            <GoogleAuthButton
              text="signup_with"
              disabled={isLoading}
              onSuccess={() => router.replace("/dashboard")}
              onError={handleGoogleRegisterError}
            />

            {/* Redirect to Login */}
            <p className="mt-6 text-center text-xs text-slate-500 sm:text-sm">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-bold transition-colors duration-300 hover:underline"
                style={{ color: BRAND_PRIMARY }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = BRAND_HOVER;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = BRAND_PRIMARY;
                }}
              >
                Log In
              </Link>
            </p>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-[10px] text-slate-400">
                © {new Date().getFullYear()} AM Management Group Sdn. Bhd. All
                rights reserved.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default RegisterForm;
