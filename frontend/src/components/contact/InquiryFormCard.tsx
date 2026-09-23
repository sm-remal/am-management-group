"use client";

import { FormEvent, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { createInquiry } from "@/features/contact/contact.api";
import type { CreateInquiryPayload } from "@/features/contact/contact.types";

type InquiryFormCardProps = {
  defaultCompanyName?: string;
  successCompanyName?: string;
};

const initialForm = (defaultCompanyName = ""): CreateInquiryPayload => ({
  name: "",
  email: "",
  phone: "",
  company: defaultCompanyName,
  subject: "",
  message: "",
});

const fieldClassName =
  "w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/20 placeholder:text-slate-400";

const InquiryFormCard = ({
  defaultCompanyName = "",
  successCompanyName = "AM Management Group",
}: InquiryFormCardProps) => {
  const [form, setForm] = useState<CreateInquiryPayload>(() =>
    initialForm(defaultCompanyName)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateField = (field: keyof CreateInquiryPayload, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await createInquiry({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        company: form.company?.trim() || null,
        subject: form.subject.trim(),
        message: form.message.trim(),
      });

      setSubmitted(true);
      setForm(initialForm(defaultCompanyName));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit inquiry");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-green-200 bg-white p-8 text-center shadow-sm sm:p-10">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-green-50 text-green-700">
          <CheckCircle2 className="size-7" />
        </div>
        <h3 className="mt-5 text-xl font-bold text-slate-950">
          Inquiry Sent Successfully
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
          Thank you for reaching out. A representative from {successCompanyName}
          will contact you shortly.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-6 rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-secondary hover:text-secondary"
        >
          Send another inquiry
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
      <h2 className="text-2xl font-bold text-slate-950">Send Us An Inquiry</h2>
      <p className="mt-3 text-sm text-slate-500">
        Fill out the form below and our team will respond within 24 business
        hours.
      </p>

      {error && (
        <div className="mt-6 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-7 space-y-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="inquiry-name"
              className="mb-2 block text-xs font-semibold uppercase text-slate-900"
            >
              Full Name *
            </label>
            <input
              id="inquiry-name"
              type="text"
              required
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="John Doe"
              className={fieldClassName}
            />
          </div>

          <div>
            <label
              htmlFor="inquiry-email"
              className="mb-2 block text-xs font-semibold uppercase text-slate-900"
            >
              Email Address *
            </label>
            <input
              id="inquiry-email"
              type="email"
              required
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="john@company.com"
              className={fieldClassName}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="inquiry-phone"
              className="mb-2 block text-xs font-semibold uppercase text-slate-900"
            >
              Phone Number *
            </label>
            <input
              id="inquiry-phone"
              type="tel"
              required
              value={form.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              placeholder="+60 12-345 6789"
              className={fieldClassName}
            />
          </div>

          <div>
            <label
              htmlFor="inquiry-company"
              className="mb-2 block text-xs font-semibold uppercase text-slate-900"
            >
              Company Name
            </label>
            <input
              id="inquiry-company"
              type="text"
              value={form.company ?? ""}
              onChange={(event) => updateField("company", event.target.value)}
              placeholder="Your Company / Enterprise"
              className={fieldClassName}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="inquiry-subject"
            className="mb-2 block text-xs font-semibold uppercase text-slate-900"
          >
            Subject *
          </label>
          <input
            id="inquiry-subject"
            type="text"
            required
            value={form.subject}
            onChange={(event) => updateField("subject", event.target.value)}
            placeholder="e.g. Sub-Contracting Tender Request / Property Development"
            className={fieldClassName}
          />
        </div>

        <div>
          <label
            htmlFor="inquiry-message"
            className="mb-2 block text-xs font-semibold uppercase text-slate-900"
          >
            Message *
          </label>
          <textarea
            id="inquiry-message"
            rows={5}
            required
            value={form.message}
            onChange={(event) => updateField("message", event.target.value)}
            placeholder="Provide details about your project, timeline, location, or inquiry..."
            className={`${fieldClassName} min-h-32 resize-y`}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-lg bg-secondary px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Sending...
            </>
          ) : (
            "Send Inquiry"
          )}
        </button>
      </form>
    </div>
  );
};

export default InquiryFormCard;
