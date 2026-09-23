"use client";

import Link from "next/link";
import { ArrowRight, BadgeCheck, CalendarCheck2, MapPin } from "lucide-react";
import { usePublicSettings } from "@/features/settings/usePublicSettings";
import TickerTape from "@/components/theme/TickerTape";
import GroupInfographic from "./GroupInfographic";

const sectorTape = [
  "Construction & Real Estate",
  "Facility Support & Cleaning",
  "Machinery & Engineering",
  "Plantation & Agriculture",
  "Mini Market & Retail",
  "Travel & Ticketing",
];

const credentialTape = [
  "CIDB Registered",
  "CIDB Contractor Grade G5",
  "Incorporated 27 November 2012",
  "Headquartered in Melaka, Malaysia",
  "6+ Sister Concerns & Divisions",
  "RM 2.66M Contract Value, 2023–2026",
  "Partnerships with Tier-1 Developers",
];

/**
 * Home hero: compact (not full-screen) blueprint band with the group-structure
 * infographic, finished by two crossing safety-tape tickers.
 */
const Banner = () => {
  const settings = usePublicSettings();

  return (
    <section aria-labelledby="home-hero-title" className="relative">
      <div className="bg-blueprint relative overflow-hidden text-white">
        {/* soft light from the hub side */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-40 top-1/2 size-[46rem] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(35_66_121/0.9),transparent_65%)]"
        />

        <div className="container-am relative grid items-center gap-12 pb-20 pt-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:pb-20 lg:pt-10">
          <div>
            <p className="am-rise flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/70">
              <span className="inline-flex items-center gap-2">
                <CalendarCheck2 className="size-4 text-secondary" />
                Established 2012
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin className="size-4 text-secondary" />
                {settings.contactAddress || "Melaka, Malaysia"}
              </span>
            </p>

            <h1
              id="home-hero-title"
              className="am-rise font-display mt-5 max-w-xl text-[1.75rem] text-white sm:text-[2.1rem] lg:text-[2.5rem]"
              style={{ animationDelay: "0.08s" }}
            >
              {settings.siteTagline || "One Group. Multiple Businesses."}
            </h1>

            <p
              className="am-rise mt-6 max-w-xl text-base leading-8 text-white/75 sm:text-lg"
              style={{ animationDelay: "0.16s" }}
            >
              {settings.siteDescription}
            </p>

            <div
              className="am-rise mt-9 flex flex-wrap items-center gap-3"
              style={{ animationDelay: "0.24s" }}
            >
              <Link
                href="/companies"
                className="group inline-flex h-12 items-center gap-2 rounded-md bg-secondary px-6 text-sm font-bold text-white shadow-[0_12px_30px_-10px_rgb(251_115_31/0.7)] transition-colors hover:bg-[var(--am-signal-deep)]"
              >
                Explore our companies
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-12 items-center rounded-md border border-white/25 px-6 text-sm font-bold text-white transition-colors hover:border-white hover:bg-white hover:text-[var(--am-harbour)]"
              >
                Discuss a project
              </Link>
            </div>

            <ul
              className="am-rise mt-10 grid max-w-lg grid-cols-3 border-t border-white/15 pt-6 text-white"
              style={{ animationDelay: "0.32s" }}
            >
              {[
                { value: "G5", label: "CIDB grade" },
                { value: "10+", label: "Years operating" },
                { value: "6", label: "Business sectors" },
              ].map((item) => (
                <li key={item.label} className="pr-4">
                  <div className="font-display text-2xl sm:text-3xl">{item.value}</div>
                  <div className="mt-1.5 flex items-center gap-1.5 text-xs text-white/60 sm:text-sm">
                    <BadgeCheck className="size-3.5 text-secondary" />
                    {item.label}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="px-6 sm:px-10 lg:px-0">
            <GroupInfographic />
          </div>
        </div>
      </div>

      {/* crossing safety tapes */}
      <div className="relative z-10 -mt-12 overflow-hidden pb-4 pt-2">
        <TickerTape
          items={sectorTape}
          tone="signal"
          tilt={-1.2}
          className="z-10"
          speedSeconds={42}
          label="Business sectors"
        />
        <TickerTape
          items={credentialTape}
          tone="harbour"
          direction="right"
          tilt={0.9}
          speedSeconds={55}
          className="mt-1.5"
          label="Credentials"
        />
      </div>

    </section>
  );
};

export default Banner;
