"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  Factory,
  Globe2,
  Leaf,
  Loader2,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import SectionHeader from "@/components/theme/SectionHeader";
import HazardTape from "@/components/theme/HazardTape";

import { getPublishedCompanies } from "@/features/companies/company.api";
import type {
  BusinessCategory,
  CompanyRecord,
} from "@/features/companies/company.types";

const categoryLabels: Record<BusinessCategory, string> = {
  MANAGEMENT_INVESTMENT: "Management & Investment",
  CLEANING_SERVICES: "Cleaning & Services",
  ENGINEERING_MACHINERY: "Machinery & Engineering",
  PLANTATION_AGRICULTURE: "Plantation & Agriculture",
  RETAIL_TRADING: "Retail & Trading",
  TRAVEL_TOURISM: "Travel & Tourism",
};

const getCategoryLabel = (category: BusinessCategory) =>
  categoryLabels[category] ?? category;

/* -------------------------------------------------------------------------- */
/* Company Icon                                                                */
/* -------------------------------------------------------------------------- */

const CompanyIcon = ({
  category,
  size,
}: {
  category: BusinessCategory;
  size: number;
}) => {
  switch (category) {
    case "MANAGEMENT_INVESTMENT":
      return <Building2 size={size} />;

    case "CLEANING_SERVICES":
      return <Sparkles size={size} />;

    case "ENGINEERING_MACHINERY":
      return <Factory size={size} />;

    case "PLANTATION_AGRICULTURE":
      return <Leaf size={size} />;

    case "RETAIL_TRADING":
      return <ShoppingBag size={size} />;

    case "TRAVEL_TOURISM":
      return <Globe2 size={size} />;

    default:
      return <Building2 size={size} />;
  }
};

/* -------------------------------------------------------------------------- */
/* Main Section                                                                */
/* -------------------------------------------------------------------------- */

const CompaniesSection = () => {
  const [companies, setCompanies] = useState<CompanyRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCompanies = async () => {
      setIsLoading(true);

      try {
        const result = await getPublishedCompanies({ limit: 50 });
        const list = result.data?.companies ?? [];

        const sorted = [...list].sort((a, b) => {
          if (a.isMainCompany && !b.isMainCompany) return -1;
          if (!a.isMainCompany && b.isMainCompany) return 1;

          return (a.displayOrder ?? 0) - (b.displayOrder ?? 0);
        });

        setCompanies(sorted);
      } catch {
        setCompanies([]);
      } finally {
        setIsLoading(false);
      }
    };

    void loadCompanies();
  }, []);

  const mainCompany = useMemo(() => {
    return (
      companies.find((company) => company.isMainCompany) ?? companies[0] ?? null
    );
  }, [companies]);

  const otherCompanies = useMemo(() => {
    if (!mainCompany) return companies;

    return companies.filter((company) => company.id !== mainCompany.id);
  }, [companies, mainCompany]);

  return (
    <section className="bg-white py-12 lg:py-16">
      <div className="container-am">
        <SectionHeader
          kicker="The group"
          title="Explore Our Companies"
          intro="Explore the specialized companies operating under the umbrella of AM Management Group Sdn. Bhd. and discover their areas of expertise, services and business operations."
          action={
            <Link
              href="/companies"
              className="group inline-flex items-center gap-2 border-b-2 border-secondary pb-1 text-sm font-bold text-[var(--am-harbour)]"
            >
              All companies
              <ArrowUpRight size={16} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          }
        />

        {isLoading ? (
          <div className="flex min-h-64 flex-col items-center justify-center text-muted-foreground">
            <Loader2 className="mb-3 size-8 animate-spin text-primary" />
            <p className="text-sm">Loading companies...</p>
          </div>
        ) : companies.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-white p-10 text-center text-muted-foreground">
            No published companies available yet.
          </div>
        ) : (
          <>
            {mainCompany && (
              <div data-reveal className="mb-5">
                <FeaturedCompanyCard company={mainCompany} />
              </div>
            )}

            {otherCompanies.length > 0 && (
              <div data-reveal-stagger className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {otherCompanies.map((company) => (
                  <CompanyGridCard key={company.id} company={company} />
                ))}
                {otherCompanies.length % 3 !== 0 && (
                  <PartnerCard wide={otherCompanies.length % 3 === 1} />
                )}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default CompaniesSection;

/* -------------------------------------------------------------------------- */
/* Featured (holding) company                                                  */
/* -------------------------------------------------------------------------- */

const FeaturedCompanyCard = ({ company }: { company: CompanyRecord }) => {
  return (
    <Link
      href={`/companies/${company.slug}`}
      className="group grid overflow-hidden rounded-lg bg-[var(--am-harbour)] text-white lg:grid-cols-[1.1fr_0.9fr]"
    >
      <div className="relative flex flex-col p-8 sm:p-10 lg:p-12">
        <div className="flex items-center gap-4">
          <div className="flex size-20 items-center justify-center rounded-md bg-white p-2">
            {company.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={company.logo} alt={company.name} className="max-h-full max-w-full object-contain" />
            ) : (
              <span className="text-primary">
                <CompanyIcon category={company.category} size={28} />
              </span>
            )}
          </div>
          <span className="rounded border border-white/25 px-2.5 py-1 text-xs font-semibold text-white/80">
            {company.isMainCompany ? "Holding company" : "Company"}
          </span>
        </div>

        <h3 className="mt-6 text-2xl font-semibold leading-tight sm:text-[1.75rem]">{company.name}</h3>
        <p className="mt-2 text-sm font-semibold text-secondary">{getCategoryLabel(company.category)}</p>
        <p className="mt-5 max-w-xl leading-7 text-white/70">
          {company.shortDescription ||
            company.description ||
            "Corporate management, investment and strategic business development."}
        </p>

        <span className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-white">
          Explore Company
          <ArrowUpRight size={16} className="text-secondary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>

      <div className="relative min-h-[260px] bg-primary">
        {company.coverImage || company.logo ? (
          <Image
            src={company.coverImage || company.logo || ""}
            alt={company.name}
            fill
            sizes="(min-width: 1024px) 45vw, 100vw"
            className={company.coverImage ? "object-cover transition-transform duration-700 group-hover:scale-105" : "object-contain p-16 opacity-30"}
          />
        ) : (
          <div className="flex h-full min-h-[260px] items-center justify-center text-white/30">
            <Building2 className="size-16" />
          </div>
        )}
        <HazardTape className="absolute inset-x-0 bottom-0" height={6} />
      </div>
    </Link>
  );
};

/* -------------------------------------------------------------------------- */
/* Group company card                                                          */
/* -------------------------------------------------------------------------- */

const CompanyGridCard = ({ company }: { company: CompanyRecord }) => {
  return (
    <Link
      href={`/companies/${company.slug}`}
      className="am-lift group relative flex min-h-[240px] flex-col overflow-hidden rounded-lg border border-border bg-white p-6 transition-shadow duration-300 hover:shadow-[0_24px_50px_-28px_rgb(15_36_71/0.45)] sm:p-8"
    >
      <span
        aria-hidden="true"
        className="tape-hazard absolute inset-x-0 top-0 h-1.5 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
      />

      <div className="flex items-start justify-between">
        <div className="flex size-16 items-center justify-center overflow-hidden rounded-md border border-border bg-white p-1.5 text-primary">
          {company.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={company.logo} alt={company.name} className="max-h-full max-w-full object-contain" />
          ) : (
            <CompanyIcon category={company.category} size={24} />
          )}
        </div>
        <span className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors duration-300 group-hover:border-secondary group-hover:bg-secondary group-hover:text-white">
          <ArrowUpRight size={16} />
        </span>
      </div>

      <h3 className="mt-7 text-xl font-bold leading-snug text-[var(--am-harbour)]">{company.name}</h3>
      <p className="mt-1.5 text-sm font-semibold text-secondary">{getCategoryLabel(company.category)}</p>
      <p className="mt-4 text-sm leading-7 text-muted-foreground">
        {company.shortDescription ||
          company.description ||
          "Explore company services and business operations."}
      </p>
    </Link>
  );
};

/* -------------------------------------------------------------------------- */
/* Fills the last row so the grid never ends with an empty gap                 */
/* -------------------------------------------------------------------------- */

const PartnerCard = ({ wide }: { wide: boolean }) => {
  return (
    <Link
      href="/contact"
      className={`group relative hidden min-h-[240px] flex-col justify-between overflow-hidden rounded-lg bg-[var(--am-harbour)] p-7 text-white lg:flex ${
        wide ? "lg:col-span-2" : ""
      }`}
    >
      <span aria-hidden="true" className="tape-hazard absolute inset-x-0 top-0 h-1.5" />
      <div>
        <p className="text-sm font-semibold text-secondary">Partner with the group</p>
        <h3 className="mt-3 text-xl font-semibold leading-snug">
          Tenders, sub-contracts and corporate enquiries
        </h3>
        <p className="mt-3 max-w-md text-sm leading-7 text-white/70">
          One point of contact for every company in AM Management Group.
        </p>
      </div>
      <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold">
        Contact our team
        <ArrowUpRight size={16} className="text-secondary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
};
