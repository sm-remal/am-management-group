import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Company {
  number?: string;
  category?: string;
  name: string;
  description?: string | null;
  shortDescription?: string | null;
  coverImage?: string | null;
  logo?: string | null;
}

interface CompanyBannerProps {
  company: Company;
}

const categoryLabels: Record<string, string> = {
  MANAGEMENT_INVESTMENT: "Management & Investment",
  CLEANING_SERVICES: "Cleaning & Services",
  ENGINEERING_MACHINERY: "Machinery & Engineering",
  PLANTATION_AGRICULTURE: "Plantation & Agriculture",
  RETAIL_TRADING: "Retail & Trading",
  TRAVEL_TOURISM: "Travel & Tourism",
};

/** Company detail banner: split blueprint band with the company's cover image. */
const CompanyBanner = ({ company }: CompanyBannerProps) => {
  const category = company?.category
    ? categoryLabels[company.category] ?? company.category
    : "Group Subsidiary";

  return (
    <section className="relative overflow-hidden text-white">
      <div className="bg-blueprint grid lg:grid-cols-[1.15fr_0.85fr]">
        <div className="container-am relative py-9 sm:py-10 lg:mr-0 lg:max-w-none lg:py-12 lg:pl-[max(2.5rem,calc((100vw_-_80rem)/2_+_2.5rem))]">
          <Link
            href="/companies"
            className="am-rise inline-flex items-center gap-2 text-sm font-medium text-white/65 transition-colors hover:text-white"
          >
            <ArrowLeft size={16} />
            All Companies
          </Link>

          <div className="am-rise mt-8 flex items-center gap-4" style={{ animationDelay: "0.05s" }}>
            {company.logo && (
              <span className="flex size-14 items-center justify-center rounded-md bg-white p-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={company.logo} alt="" className="max-h-full max-w-full object-contain" />
              </span>
            )}
            <span className="text-sm font-semibold text-secondary">{category}</span>
          </div>

          <h1
            className="am-rise font-display mt-4 max-w-3xl text-[1.6rem] sm:text-[2rem] lg:text-[2.35rem]"
            style={{ animationDelay: "0.1s" }}
          >
            {company?.name}
          </h1>

          {company?.shortDescription && (
            <p className="am-rise mt-5 max-w-2xl text-base leading-7 text-white/75 sm:text-lg" style={{ animationDelay: "0.16s" }}>
              {company.shortDescription}
            </p>
          )}

          <div className="am-rise mt-8 flex flex-wrap gap-3" style={{ animationDelay: "0.22s" }}>
            <a
              href="#services"
              className="inline-flex h-11 items-center gap-2 rounded-md bg-secondary px-5 text-sm font-bold text-white transition-colors hover:bg-[var(--am-signal-deep)]"
            >
              Explore Services
              <ArrowRight size={16} />
            </a>
            <a
              href="#contact"
              className="inline-flex h-11 items-center rounded-md border border-white/25 px-5 text-sm font-bold text-white transition-colors hover:bg-white hover:text-[var(--am-harbour)]"
            >
              Get In Touch
            </a>
          </div>
        </div>

        <div className="relative hidden min-h-full bg-primary lg:block">
          {company.coverImage ? (
            <Image
              src={company.coverImage}
              alt={company.name}
              fill
              priority
              sizes="40vw"
              className="object-cover"
            />
          ) : (
            <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
              <div className="h-4 w-[120%] -rotate-[14deg] tape-hazard" />
            </div>
          )}
          <div aria-hidden="true" className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[var(--am-harbour)] to-transparent" />
        </div>
      </div>
      <div aria-hidden="true" className="h-1 bg-secondary" />
    </section>
  );
};

export default CompanyBanner;
